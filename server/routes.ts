import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTradingSessionSchema, insertTradeSchema, insertJournalEntrySchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Debug environment variables
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REPL_ID:', process.env.REPL_ID);
console.log('ISSUER_URL:', process.env.ISSUER_URL);
console.log('REPLIT_DOMAINS:', process.env.REPLIT_DOMAINS);

// Mock data generator for testing
const generateMockChartData = (symbol: string, interval: string, count: number = 30) => {
  const data = [];
  const now = new Date();
  
  // Generate mock price data
  let basePrice = 100;
  for (let i = count; i >= 0; i--) {
    const time = new Date(now);
    time.setHours(now.getHours() - i);
    
    // Random walk for price
    const change = (Math.random() - 0.5) * 2;
    basePrice += change;
    
    // Ensure positive prices
    basePrice = Math.max(basePrice, 1);
    
    const open = basePrice;
    const close = basePrice + (Math.random() - 0.5);
    const high = Math.max(open, close) + Math.random();
    const low = Math.min(open, close) - Math.random();
    const volume = Math.floor(Math.random() * 10000) + 1000;
    
    data.push({
      time: time.toISOString(),
      open: parseFloat(open.toFixed(5)),
      high: parseFloat(high.toFixed(5)),
      low: parseFloat(low.toFixed(5)),
      close: parseFloat(close.toFixed(5)),
      volume: volume
    });
  }
  
  return {
    data: data,
    symbol: symbol,
    interval: interval
  };
};

// Helper function to convert string values to numbers for frontend
const formatTradeForFrontend = (trade: any) => {
  return {
    ...trade,
    entryPrice: trade.entryPrice ? parseFloat(trade.entryPrice) : null,
    exitPrice: trade.exitPrice ? parseFloat(trade.exitPrice) : null,
    quantity: trade.quantity ? parseFloat(trade.quantity) : null,
    stopLoss: trade.stopLoss ? parseFloat(trade.stopLoss) : null,
    takeProfit: trade.takeProfit ? parseFloat(trade.takeProfit) : null,
    profitLoss: trade.profitLoss ? parseFloat(trade.profitLoss) : null,
  };
};

// Helper function to convert string values to numbers for trading sessions
const formatSessionForFrontend = (session: any) => {
  return {
    ...session,
    startingBalance: session.startingBalance ? parseFloat(session.startingBalance) : null,
    currentBalance: session.currentBalance ? parseFloat(session.currentBalance) : null,
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Debug environment detection
  console.log('Registering routes with NODE_ENV:', process.env.NODE_ENV);
  console.log('NODE_ENV type:', typeof process.env.NODE_ENV);
  console.log('NODE_ENV length:', process.env.NODE_ENV?.length);
  console.log('Trimmed NODE_ENV:', process.env.NODE_ENV?.trim());
  console.log('Lowercase NODE_ENV:', process.env.NODE_ENV?.toLowerCase());
  
  // More robust environment detection - also check for explicit development flag
  const isDevelopment = process.env.NODE_ENV?.trim().toLowerCase() === 'development' || 
                       process.env.DEVELOPMENT === 'true' ||
                       (!process.env.NODE_ENV && !process.env.REPL_ID);
  console.log('Using development auth:', isDevelopment);
  
  // Dynamically import auth modules based on environment
  let authModule: any;
  if (isDevelopment) {
    console.log('Loading localAuth for development');
    authModule = await import("./localAuth");
  } else {
    console.log('Loading replitAuth for production');
    authModule = await import("./replitAuth");
  }
  
  const { setupAuth, isAuthenticated } = authModule;
  await setupAuth(app);

  // Dynamically import twelve data service
  let twelveDataService: any;
  try {
    twelveDataService = await import("./services/twelveDataService");
  } catch (error) {
    console.log("TwelveData service not available, using mock data");
    twelveDataService = null;
  }

  // Dynamically import stripe service
  let stripeService: any;
  try {
    stripeService = await import("./services/stripeService");
  } catch (error) {
    console.log("Stripe service not available:", error);
    stripeService = null;
  }

  // Dynamically import S3 service
  let s3Service: any;
  try {
    s3Service = await import("./services/s3Service");
  } catch (error) {
    console.log("S3 service not available:", error);
    s3Service = null;
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id || req.user.claims?.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put('/api/users/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id || req.user.claims?.sub;
      const updates = insertUserSchema
        .pick({ firstName: true, lastName: true, profileImageUrl: true })
        .partial()
        .parse(req.body);
      const user = await storage.upsertUser({ id: userId, ...updates });
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update user" });
      }
    }
  });

  // Trading Sessions
  app.get('/api/trading-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const sessions = await storage.getTradingSessions(userId || '');
      // Format sessions for frontend
      const formattedSessions = sessions.map(formatSessionForFrontend);
      res.json(formattedSessions);
    } catch (error) {
      console.error("Error fetching trading sessions:", error);
      res.status(500).json({ message: "Failed to fetch trading sessions" });
    }
  });

  app.post('/api/trading-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const sessionData = insertTradingSessionSchema.parse(req.body);
      const session = await storage.createTradingSession(userId || '', sessionData);
      // Format session for frontend
      const formattedSession = formatSessionForFrontend(session);
      res.status(201).json(formattedSession);
    } catch (error) {
      console.error("Error creating trading session:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create trading session" });
      }
    }
  });

  app.get('/api/trading-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const session = await storage.getTradingSession(req.params.id, userId || '');
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      // Format session for frontend
      const formattedSession = formatSessionForFrontend(session);
      res.json(formattedSession);
    } catch (error) {
      console.error("Error fetching trading session:", error);
      res.status(500).json({ message: "Failed to fetch trading session" });
    }
  });

  app.put('/api/trading-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const updates = insertTradingSessionSchema.partial().parse(req.body);
      const session = await storage.updateTradingSession(req.params.id, userId || '', updates);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      // Format session for frontend
      const formattedSession = formatSessionForFrontend(session);
      res.json(formattedSession);
    } catch (error) {
      console.error("Error updating trading session:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update trading session" });
      }
    }
  });

  app.delete('/api/trading-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const deleted = await storage.deleteTradingSession(req.params.id, userId || '');
      if (!deleted) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json({ message: "Session deleted successfully" });
    } catch (error) {
      console.error("Error deleting trading session:", error);
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  // Trades
  app.get('/api/trades', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const sessionId = req.query.sessionId as string | undefined;
      const trades = await storage.getTrades(userId || '', sessionId);
      // Format trades for frontend
      const formattedTrades = trades.map(formatTradeForFrontend);
      res.json(formattedTrades);
    } catch (error) {
      console.error("Error fetching trades:", error);
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.post('/api/trades', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const tradeData = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(userId || '', tradeData);
      // Format trade for frontend
      const formattedTrade = formatTradeForFrontend(trade);
      res.status(201).json(formattedTrade);
    } catch (error) {
      console.error("Error creating trade:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid trade data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create trade" });
      }
    }
  });

  app.get('/api/trades/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const trade = await storage.getTrade(req.params.id, userId || '');
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      // Format trade for frontend
      const formattedTrade = formatTradeForFrontend(trade);
      res.json(formattedTrade);
    } catch (error) {
      console.error("Error fetching trade:", error);
      res.status(500).json({ message: "Failed to fetch trade" });
    }
  });

  app.put('/api/trades/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const updates = insertTradeSchema.partial().parse(req.body);
      const trade = await storage.updateTrade(req.params.id, userId || '', updates);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      // Format trade for frontend
      const formattedTrade = formatTradeForFrontend(trade);
      res.json(formattedTrade);
    } catch (error) {
      console.error("Error updating trade:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update trade" });
      }
    }
  });

  app.delete('/api/trades/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const deleted = await storage.deleteTrade(req.params.id, userId || '');
      if (!deleted) {
        return res.status(404).json({ message: "Trade not found" });
      }
      res.json({ message: "Trade deleted successfully" });
    } catch (error) {
      console.error("Error deleting trade:", error);
      res.status(500).json({ message: "Failed to delete trade" });
    }
  });

  // Journal Entries
  app.get('/api/journal-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const tradeId = req.query.tradeId as string | undefined;
      const entries = await storage.getJournalEntries(userId || '', tradeId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post('/api/journal-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const entryData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(userId || '', entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create journal entry" });
      }
    }
  });

  app.get('/api/journal-entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const entry = await storage.getJournalEntry(req.params.id, userId || '');
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching journal entry:", error);
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });

  app.put('/api/journal-entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const updates = insertJournalEntrySchema.partial().parse(req.body);
      const entry = await storage.updateJournalEntry(req.params.id, userId || '', updates);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error updating journal entry:", error);
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete('/api/journal-entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const deleted = await storage.deleteJournalEntry(req.params.id, userId || '');
      if (!deleted) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json({ message: "Entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Analytics
  app.get('/api/analytics/performance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const performance = await storage.getUserPerformance(userId || '');
      res.json(performance);
    } catch (error) {
      console.error("Error fetching performance analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Chart Data Endpoint
  app.get('/api/chart-data', isAuthenticated, async (req: any, res) => {
    try {
      const { symbol, interval, limit } = req.query;
      
      if (!symbol || !interval) {
        return res.status(400).json({ message: "Symbol and interval are required" });
      }
      
      const limitNum = limit ? parseInt(limit as string) : 100;
      
      // Use mock data if TWELVEDATA_API_KEY is not set or service is not available
      if (!process.env.TWELVEDATA_API_KEY || !twelveDataService) {
        console.log("Using mock data for chart - TWELVEDATA_API_KEY not set or service not available");
        const mockData = generateMockChartData(symbol as string, interval as string, limitNum);
        return res.json(mockData);
      }
      
      // Fetch data from TwelveData
      const timeSeriesData = await twelveDataService.getTimeSeries(symbol as string, interval as string, limitNum);
      
      // Format data for frontend
      const formattedData = timeSeriesData.values.map((item: any) => ({
        time: item.datetime,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume)
      }));
      
      res.json({
        data: formattedData,
        symbol,
        interval
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Current Price Endpoint
  app.get('/api/price', isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.query;
      
      if (!symbol) {
        return res.status(400).json({ message: "Symbol is required" });
      }
      
      // Use mock data if TWELVEDATA_API_KEY is not set or service is not available
      if (!process.env.TWELVEDATA_API_KEY || !twelveDataService) {
        console.log("Using mock price data - TWELVEDATA_API_KEY not set or service not available");
        return res.json({
          symbol,
          price: (100 + (Math.random() - 0.5) * 10).toFixed(5),
          timestamp: new Date().toISOString()
        });
      }
      
      // Fetch current price from TwelveData
      const priceData = await twelveDataService.getPrice(symbol as string);
      
      res.json({
        symbol,
        price: priceData.price,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching current price:", error);
      res.status(500).json({ message: "Failed to fetch current price" });
    }
  });

  // Stripe Subscription Routes
  app.get('/api/subscription/plans', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripeService) {
        return res.status(501).json({ message: "Stripe service not implemented" });
      }
      
      res.json(stripeService.subscriptionPlans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  app.post('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripeService) {
        return res.status(501).json({ message: "Stripe service not implemented" });
      }
      
      const userId = req.user?.id || req.user?.claims?.sub;
      const { planId } = req.body;
      
      // In a real implementation, you would:
      // 1. Get or create a Stripe customer for the user
      // 2. Create a subscription
      // 3. Store subscription details in your database
      
      // For now, we'll return a mock response
      res.status(201).json({
        message: "Subscription created successfully",
        subscriptionId: `sub_${Date.now()}`,
        planId,
        status: "active"
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.delete('/api/subscription/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripeService) {
        return res.status(501).json({ message: "Stripe service not implemented" });
      }
      
      const { id } = req.params;
      
      // In a real implementation, you would cancel the subscription in Stripe
      // and update your database accordingly
      
      res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // S3 File Upload Routes
  app.post('/api/file-upload-url', isAuthenticated, async (req: any, res) => {
    try {
      if (!s3Service) {
        return res.status(501).json({ message: "S3 service not implemented" });
      }
      
      const { fileName, fileType } = req.body;
      
      if (!fileName) {
        return res.status(400).json({ message: "File name is required" });
      }
      
      // Generate a unique key for the file
      const fileKey = `uploads/${req.user.id}/${Date.now()}-${fileName}`;
      
      // Get a presigned URL for upload
      const uploadUrl = await s3Service.getUploadUrl(fileKey);
      
      res.json({
        uploadUrl,
        fileKey,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  app.get('/api/file-download-url', isAuthenticated, async (req: any, res) => {
    try {
      if (!s3Service) {
        return res.status(501).json({ message: "S3 service not implemented" });
      }
      
      const { fileKey } = req.query;
      
      if (!fileKey || typeof fileKey !== 'string') {
        return res.status(400).json({ message: "File key is required" });
      }
      
      // Verify the user has access to this file
      // In a real implementation, you would check your database
      // to ensure the user owns this file
      
      // Get a presigned URL for download
      const downloadUrl = await s3Service.getDownloadUrl(fileKey);
      
      res.json({
        downloadUrl,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
      });
    } catch (error) {
      console.error("Error generating download URL:", error);
      res.status(500).json({ message: "Failed to generate download URL" });
    }
  });

  // Sign Up Endpoint
  app.post('/api/signup', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Here you would implement the logic to create a new user
      // For simplicity, we'll just return a success message
      // In a real application, you would hash the password and store the user in the database
      console.log(`User signup requested for: ${email}`);
      
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DATABASE_URL ? 'postgresql' : 'in-memory',
      auth: isDevelopment ? 'local-mock' : 'replit'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}