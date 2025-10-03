import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for server-side operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

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

  // Since we're using Supabase for auth, we don't need complex serialization
  passport.serializeUser((user: any, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      // Get user from Supabase Auth
      const { data: { user }, error } = await supabase.auth.admin.getUserById(id);
      
      if (error || !user) {
        return cb(null, null);
      }

      cb(null, user);
    } catch (error) {
      cb(error, null);
    }
  });

  // Signup endpoint - using Supabase auth
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Sign up user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        return res.status(400).json({ message: error.message });
      }

      // Also create user in users table
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            first_name: firstName,
            last_name: lastName
          });

        if (insertError) {
          console.error('Error inserting user into users table:', insertError);
          // Don't fail the signup if this fails, as the auth user was created
        }
      }

      // Store access token in session for later use
      if (data.session?.access_token) {
        (req.session as any).access_token = data.session.access_token;
      } else {
        // Clear access token if not available
        (req.session as any).access_token = null;
      }

      // Auto-login the new user
      if (data.user) {
        // Set session
        req.login(data.user, (err) => {
          if (err) {
            console.error('Session login error:', err);
            return res.status(201).json({
              message: "Account created successfully",
              user: data.user
            });
          }
          
          return res.status(201).json({
            message: "Account created and logged in successfully",
            user: data.user
          });
        });
      } else {
        return res.status(201).json({
          message: "Account created successfully",
          user: data.user
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Login endpoint - using Supabase auth
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Sign in user with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase login error:', error);
        return res.status(401).json({ message: error.message });
      }

      // Store access token in session for later use
      if (data.session?.access_token) {
        (req.session as any).access_token = data.session.access_token;
      } else {
        // Clear access token if not available
        (req.session as any).access_token = null;
      }

      // Set session
      if (data.user) {
        req.login(data.user, (err) => {
          if (err) {
            console.error('Session login error:', err);
            return res.status(500).json({ message: "Login failed" });
          }
          
          return res.json({ 
            message: "Logged in successfully", 
            user: data.user
          });
        });
      } else {
        return res.json({ 
          message: "Logged in successfully", 
          user: data.user
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Clear access token on error
      if (req.session) {
        (req.session as any).access_token = null;
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req, res) => {
    try {
      // Sign out with Supabase (this will invalidate the current session)
      const { error } = await supabase.auth.signOut();
      
      // Clear local session in all cases
      if (req.session) {
        // Explicitly clear the access token
        (req.session as any).access_token = null;
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destroy error:', err);
          }
        });
      }
      
      req.logout((err) => {
        if (err) {
          console.error('Passport logout error:', err);
        }
      });
      
      if (error) {
        console.error('Supabase logout error:', error);
      }

      // Return success response - the frontend should handle redirecting
      return res.json({ message: "Logged out successfully", success: true });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if there's an error with Supabase, we should clear the local session
      if (req.session) {
        // Explicitly clear the access token
        (req.session as any).access_token = null;
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destroy error:', err);
          }
        });
      }
      
      req.logout((err) => {
        if (err) {
          console.error('Passport logout error:', err);
        }
      });
      
      // Still return success to ensure the user is logged out locally
      return res.json({ message: "Logged out successfully", success: true });
    }
  });
  
  // Get current user endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      // For Supabase auth, we need to get the user from the session/access token
      const authHeader = req.headers.authorization;
      let user = null;
      let isValid = false;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
          user = data.user;
          isValid = true;
        }
      } else if (req.session && (req.session as any).access_token) {
        const { data, error } = await supabase.auth.getUser((req.session as any).access_token);
        if (!error && data.user) {
          user = data.user;
          isValid = true;
        }
      } else if (req.user) {
        // If we have a user in the request, we should still validate it with Supabase
        user = req.user as any;
        // Try to validate with Supabase
        const { data, error } = await supabase.auth.getUser();
        if (!error && data.user) {
          user = data.user;
          isValid = true;
        }
      }
      
      // If we don't have a valid user, clear the session and return unauthorized
      if (!isValid) {
        if (req.session) {
          (req.session as any).access_token = null;
        }
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get additional user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        // Return basic user info from auth if users table query fails
        return res.json({
          id: user.id,
          email: user.email,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || ''
        });
      }

      return res.json({
        id: user.id,
        email: user.email,
        firstName: userData.first_name || user.user_metadata?.first_name || '',
        lastName: userData.last_name || user.user_metadata?.last_name || ''
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      // Clear session on error
      if (req.session) {
        (req.session as any).access_token = null;
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // For Supabase auth, we need to get the user from the session/access token
    const authHeader = req.headers.authorization;
    let user = null;
    let isValid = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        user = data.user;
        isValid = true;
      }
    } else if (req.session && (req.session as any).access_token) {
      const { data, error } = await supabase.auth.getUser((req.session as any).access_token);
      if (!error && data.user) {
        user = data.user;
        isValid = true;
      }
    } else if (req.user) {
      // If we have a user in the request, we should still validate it with Supabase
      user = req.user as any;
      // Try to validate with Supabase
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        user = data.user;
        isValid = true;
      }
    }
    
    // If we don't have a valid user, clear the session
    if (!isValid) {
      if (req.session) {
        (req.session as any).access_token = null;
      }
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth check error:', error);
    // Clear session on error
    if (req.session) {
      (req.session as any).access_token = null;
    }
    return res.status(401).json({ message: "Unauthorized" });
  }
};