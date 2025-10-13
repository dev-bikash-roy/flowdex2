import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors'; // Add CORS import
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";

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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const isDevelopment = NODE_ENV === "development";
  console.log('Environment check:', {
    NODE_ENV: NODE_ENV,
    isDevelopment,
    'app.get("env")': app.get("env")
  });
  
  if (isDevelopment) {
    console.log('🚀 Setting up Vite development server...');
    await setupVite(app, server);
  } else {
    console.log('📦 Serving static files from dist...');
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Handle port in use error gracefully
  let currentPort = port;
  const tryListen = () => {
    const httpServer = createServer(app);
    httpServer.listen(currentPort, () => {
      log(`serving on port ${currentPort}`);
    }).on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`Port ${currentPort} is already in use. Trying ${currentPort + 1}...`);
        currentPort++;
        tryListen();
      } else {
        console.error(e);
      }
    });
  };
  
  tryListen();
})();