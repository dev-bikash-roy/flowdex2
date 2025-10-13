import passport from "passport";
import session from "express-session";
import { Strategy as LocalStrategy } from "passport-local";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { scryptSync, randomBytes } from "crypto";
import { z } from "zod";

// Validation schemas
const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

// Password hashing utilities
const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, hashedPassword: string) => {
  const [salt, hash] = hashedPassword.split(':');
  const hashToVerify = scryptSync(password, salt, 64).toString('hex');
  return hash === hashToVerify;
};

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

  // Real local authentication
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        if (!user.passwordHash) {
          return done(null, false, { message: 'Account not properly configured' });
        }
        
        const isValidPassword = verifyPassword(password, user.passwordHash);
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await storage.getUser(id);
      cb(null, user || null);
    } catch (error) {
      cb(error, null);
    }
  });

  // Signup endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      console.log('Signup request body:', req.body);
      
      const { email, password, firstName, lastName } = signupSchema.parse(req.body);
      console.log('Parsed signup data:', { email, firstName, lastName });
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log('User already exists:', email);
        return res.status(409).json({ message: "User already exists" });
      }
      
      // Create new user
      console.log('Hashing password...');
      const hashedPassword = hashPassword(password);
      console.log('Password hashed successfully');
      
      console.log('Creating user in database...');
      const newUser = await storage.upsertUser({
        email,
        firstName,  // Use camelCase to match UpsertUser type
        lastName,    // Use camelCase to match UpsertUser type
        passwordHash: hashedPassword  // Use camelCase to match UpsertUser type
      });
      console.log('User created successfully:', newUser.id);
      
      // Auto-login the new user
      req.logIn(newUser, (err) => {
        if (err) {
          console.error('Login after signup failed:', err);
          return res.status(500).json({ message: "Signup successful but login failed" });
        }
        console.log('User logged in successfully after signup');
        return res.status(201).json({
          message: "Account created successfully",
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName
          }
        });
      });
    } catch (error: any) {
      console.error('Signup error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Login endpoint
  app.post("/api/auth/login", (req, res, next) => {
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
  
  // Get current user endpoint
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });
    }
    return res.status(401).json({ message: "Unauthorized" });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ message: "Unauthorized" });
};