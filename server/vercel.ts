import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes";
import { log } from "./vite";
import path from "path";

// Fix NODE_ENV trailing space issue
const NODE_ENV = process.env.NODE_ENV?.trim() || 'production';
process.env.NODE_ENV = NODE_ENV;

// Debug environment variables
console.log('Environment variables:');
console.log('NODE_ENV:', NODE_ENV);
console.log('NODE_ENV type:', typeof NODE_ENV);
console.log('NODE_ENV length:', NODE_ENV.length);

const app = express();

// Add CORS configuration
app.use(cors({
  origin: NODE_ENV === 'development' 
    ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'] 
    : true, // In production, allow all origins or specify your production domain
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Register routes
registerRoutes(app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  throw err;
});

// In Vercel, serve static files from the public directory
const isDevelopment = NODE_ENV === "development";
if (!isDevelopment) {
  console.log('📦 Serving static files from dist/public...');
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(distPath));
  
  // Handle all non-API routes with index.html for client-side routing
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return;
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// Export the app for Vercel
export default app;