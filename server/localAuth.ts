import passport from "passport";
import session from "express-session";
import { Strategy as LocalStrategy } from "passport-local";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Mock user for development
const mockUser = {
  id: "dev-user-1",
  email: "developer@example.com",
  firstName: "Dev",
  lastName: "User",
  profileImageUrl: ""
};

// Mock user storage for development
const users: any[] = [mockUser];

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // false for development
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Mock authentication for development
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
      // In development, accept any credentials
      const user = users.find(u => u.email === email) || mockUser;
      return done(null, user);
    }
  ));

  passport.serializeUser((user: any, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser((id: string, cb) => {
    const user = users.find(u => u.id === id) || mockUser;
    cb(null, user);
  });

  // Mock login endpoint for development - consistent with Replit auth
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        return res.json({ 
          message: "Logged in successfully", 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      });
    })(req, res, next);
  });

  // Logout endpoint - destroy session and end auth
  app.get("/api/logout", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }

      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({ message: "Logout error" });
        }
        res.json({ message: "Logged out successfully" });
      });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ message: "Unauthorized" });
};