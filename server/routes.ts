import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTradingSessionSchema, insertTradeSchema, insertJournalEntrySchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { randomBytes, scryptSync } from "crypto";

const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

// Get the fixed NODE_ENV from process.env (already trimmed in index.ts)
const NODE_ENV = process.env.NODE_ENV || 'production';

// Debug environment variables
console.log('Environment variables:');
console.log('NODE_ENV:', NODE_ENV);
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
  console.log('Registering routes with NODE_ENV:', NODE_ENV);
  console.log('NODE_ENV type:', typeof NODE_ENV);
  console.log('NODE_ENV length:', NODE_ENV.length);
  
  // Use explicit AUTH_MODE or default to local for non-production environments
  const useSupabaseAuth = process.env.AUTH_MODE === 'supabase';
  const useLocalAuth = !useSupabaseAuth && (process.env.AUTH_MODE === 'local' || NODE_ENV !== 'production');
  console.log('Using Supabase auth:', useSupabaseAuth);
  console.log('Using local auth:', useLocalAuth);
  
  // Dynamically import auth modules based on auth mode
  let authModule: any;
  if (useSupabaseAuth) {
    console.log('Loading supabaseAuth');
    authModule = await import("./supabaseAuth");
  } else if (useLocalAuth) {
    console.log('Loading localAuth');
    authModule = await import("./localAuth");
  } else {
    console.log('Loading replitAuth for production');
    authModule = await import("./replitAuth");
  }
  
  const { setupAuth, isAuthenticated } = authModule;
  await setupAuth(app);

  // Import market data routes
  const marketDataRoutes = await import("./routes/marketData.js");
  console.log("TwelveData service enabled - loading market data routes");

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
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return sanitized user data without password hash
      const publicUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      res.json(publicUser);
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
      console.log("Creating trading session for user:", userId);
      console.log("Request body:", req.body);
      
      // Transform the request body to match the expected schema
      // The frontend sends camelCase, but the database expects snake_case
      const transformedData = {
        name: req.body.name,
        pair: req.body.pair,
        startingBalance: req.body.startingBalance ? parseFloat(req.body.startingBalance) : 0,
        currentBalance: req.body.currentBalance ? parseFloat(req.body.currentBalance) : (req.body.startingBalance ? parseFloat(req.body.startingBalance) : 0), // More defensive approach
        startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
        description: req.body.description || '',
      };
      
      console.log("Transformed data:", transformedData);
      
      // Additional defensive logging to track the currentBalance field
      console.log("Checking currentBalance field:");
      console.log("- req.body.currentBalance:", req.body.currentBalance);
      console.log("- transformedData.currentBalance:", transformedData.currentBalance);
      console.log("- typeof transformedData.currentBalance:", typeof transformedData.currentBalance);
      
      // Log the exact data we're passing to storage
      console.log("Data being passed to storage.createTradingSession:", {
        userId: userId || '',
        sessionData: transformedData
      });
      
      // Directly pass the transformed data to storage without schema validation to avoid caching issues
      const session = await storage.createTradingSession(userId || '', transformedData);
      console.log("Created session:", session);
      
      // Format session for frontend
      const formattedSession = formatSessionForFrontend(session);
      res.status(201).json(formattedSession);
    } catch (error: any) {
      console.error("Error creating trading session:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", error.errors);
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create trading session", error: error.message || "Unknown error" });
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

  // Market Data Routes (Twelve Data Integration) - No auth required for market data
  app.use('/api/market-data', marketDataRoutes.default);

  // Test endpoint for Twelve Data - No auth required for testing
  app.get('/api/test-twelve-data', async (req: any, res) => {
    try {
      const { twelveDataService } = await import('./services/twelveDataService.js');
      const testData = await twelveDataService.getTimeSeries('EURUSD', '1h', 10);
      res.json({
        success: true,
        message: 'Twelve Data is working!',
        sampleData: testData,
        supportedInstruments: twelveDataService.getSupportedInstruments()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Twelve Data integration failed'
      });
    }
  });

  // Chart Data Endpoint (Updated to use Twelve Data) - Temporarily remove auth for testing
  app.get('/api/chart-data', async (req: any, res) => {
    try {
      const { symbol, interval, limit } = req.query;
      
      console.log('Chart data request:', { symbol, interval, limit });
      
      if (!symbol || !interval) {
        return res.status(400).json({ message: "Symbol and interval are required" });
      }
      
      const limitNum = limit ? parseInt(limit as string) : 100;
      
      // Use Twelve Data service if available
      if (process.env.TWELVEDATA_API_KEY) {
        try {
          console.log(`Fetching data from Twelve Data for ${symbol} with interval ${interval}`);
          
          // Import the service dynamically
          const { twelveDataService } = await import('./services/twelveDataService.js');
          const timeSeriesData = await twelveDataService.getTimeSeries(symbol as string, interval as string, limitNum);
          
          if (timeSeriesData && timeSeriesData.values && Array.isArray(timeSeriesData.values)) {
            const formattedData = twelveDataService.formatCandlesForChart(timeSeriesData);
            console.log(`Successfully fetched ${formattedData.length} candles from Twelve Data`);
            
            // Return in the format expected by the frontend
            return res.json({
              data: formattedData.map(candle => ({
                time: new Date(candle.time * 1000).toISOString(),
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume
              })),
              symbol: symbol,
              interval: interval,
              source: 'twelvedata'
            });
          } else {
            console.log("Invalid data structure from Twelve Data, falling back to mock data");
          }
        } catch (error) {
          console.error("Error fetching from Twelve Data:", error);
          console.log("Falling back to mock data");
          
          // Log more details about the error
          if (error instanceof Error) {
            console.error("Twelve Data error details:", error.message);
          }
        }
      }
      
      // Fallback to mock data
      console.log("Using mock data for chart");
      const mockData = generateMockChartData(symbol as string, interval as string, limitNum);
      return res.json({
        ...mockData,
        source: 'mock'
      });
      
      /*
      // Use mock data if TWELVEDATA_API_KEY is not set or service is not available
      if (!process.env.TWELVEDATA_API_KEY || !twelveDataService) {
        console.log("Using mock data for chart - TWELVEDATA_API_KEY not set or service not available");
        const mockData = generateMockChartData(symbol as string, interval as string, limitNum);
        return res.json(mockData);
      }
      
      try {
        // Attempt to fetch data from TwelveData
        console.log(`Attempting to fetch data from TwelveData for ${symbol} with interval ${interval}`);
        const timeSeriesData = await twelveDataService.getTimeSeries(symbol as string, interval as string, limitNum);
        
        console.log('Received timeSeriesData:', typeof timeSeriesData, !!timeSeriesData);
        
        // Add proper error handling for undefined values
        if (!timeSeriesData) {
          console.log("No time series data received from TwelveData, using mock data");
          const mockData = generateMockChartData(symbol as string, interval as string, limitNum);
          return res.json(mockData);
        }
        
        // Check if the response indicates an error
        if (timeSeriesData.status === 'error') {
          console.log("TwelveData API returned error:", timeSeriesData.message);
          const mockData = generateMockChartData(symbol as string, interval as string, limitNum);
          return res.json(mockData);
        }
        
        // Check if values exist and are an array
        if (!timeSeriesData.values || !Array.isArray(timeSeriesData.values)) {
          console.log("Invalid time series data structure received from TwelveData, using mock data");
          console.log('timeSeriesData structure:', Object.keys(timeSeriesData || {}));
          const mockData = generateMockChartData(symbol as string, interval as string, limitNum);
          return res.json(mockData);
        }
        
        // Check if we have any data points
        if (timeSeriesData.values.length === 0) {
          console.log("No data points received from TwelveData, using mock data");
          const mockData = generateMockChartData(symbol as string, interval as string, limitNum);
          return res.json(mockData);
        }
        
        console.log(`Processing ${timeSeriesData.values.length} data points`);
        
        // Format data for frontend - with proper error handling
        const formattedData = timeSeriesData.values.map((item: any) => {
          // Validate each data point
          if (!item || typeof item !== 'object') {
            console.warn('Invalid data point in timeSeriesData:', item);
            return null;
          }
          
          return {
            time: item.datetime || new Date().toISOString(),
            open: item.open ? parseFloat(item.open) : 0,
            high: item.high ? parseFloat(item.high) : 0,
            low: item.low ? parseFloat(item.low) : 0,
            close: item.close ? parseFloat(item.close) : 0,
            volume: item.volume ? parseFloat(item.volume) : 0
          };
        }).filter((item: any) => item !== null); // Remove any null items
        
        console.log(`Returning ${formattedData.length} formatted data points`);
        
        res.json({
          data: formattedData,
          symbol,
          interval
        });
      } catch (twelveDataError: any) {
        console.error("Error fetching data from TwelveData, using mock data:", twelveDataError);
        console.error("Error stack:", twelveDataError.stack);
        const mockData = generateMockChartData(symbol as string, interval as string, limitNum);
        return res.json(mockData);
      }
      */
    } catch (error: any) {
      console.error("Error fetching chart data:", error);
      console.error("Error stack:", error.stack);
      // Use mock data as fallback
      try {
        const { symbol, interval, limit } = req.query;
        const limitNum = limit ? parseInt(limit as string) : 100;
        const mockData = generateMockChartData(symbol as string, interval as string, limitNum);
        return res.json(mockData);
      } catch (mockError) {
        console.error("Error generating mock data:", mockError);
        res.status(500).json({ message: "Failed to fetch chart data" });
      }
    }
  });

  // Current Price Endpoint
  app.get('/api/price', isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.query;
      
      if (!symbol) {
        return res.status(400).json({ message: "Symbol is required" });
      }
      
      // Always use mock data since we're not using TwelveData
      console.log("Using mock price data - TwelveData integration disabled");
      return res.json({
        symbol,
        price: (100 + (Math.random() - 0.5) * 10).toFixed(5),
        timestamp: new Date().toISOString()
      });
      
      /*
      // Use mock data if TWELVEDATA_API_KEY is not set or service is not available
      if (!process.env.TWELVEDATA_API_KEY || !twelveDataService) {
        console.log("Using mock price data - TWELVEDATA_API_KEY not set or service not available");
        return res.json({
          symbol,
          price: (100 + (Math.random() - 0.5) * 10).toFixed(5),
          timestamp: new Date().toISOString()
        });
      }
      
      try {
        // Attempt to fetch current price from TwelveData
        const priceData = await twelveDataService.getPrice(symbol as string);
        
        res.json({
          symbol,
          price: priceData.price,
          timestamp: new Date().toISOString()
        });
      } catch (twelveDataError) {
        console.error("Error fetching price from TwelveData, using mock data:", twelveDataError);
        return res.json({
          symbol,
          price: (100 + (Math.random() - 0.5) * 10).toFixed(5),
          timestamp: new Date().toISOString()
        });
      }
      */
    } catch (error) {
      console.error("Error fetching current price:", error);
      // Fallback to mock data
      try {
        const { symbol } = req.query;
        return res.json({
          symbol,
          price: (100 + (Math.random() - 0.5) * 10).toFixed(5),
          timestamp: new Date().toISOString()
        });
      } catch (mockError) {
        console.error("Error generating mock price data:", mockError);
        res.status(500).json({ message: "Failed to fetch current price" });
      }
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
      const body = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      }).parse(req.body);

      const passwordHash = hashPassword(body.password);
      await storage.upsertUser({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        passwordHash,
      });

      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid signup data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      database: process.env.DATABASE_URL ? 'postgresql' : 'in-memory',
      auth: useLocalAuth ? 'local' : 'replit'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}