import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertTradingSessionSchema, 
  insertTradeSchema, 
  insertJournalEntrySchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Trading Sessions
  app.post('/api/trading-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertTradingSessionSchema.parse(req.body);
      const session = await storage.createTradingSession(userId, sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating trading session:", error);
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.get('/api/trading-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getTradingSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching trading sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get('/api/trading-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const session = await storage.getTradingSession(req.params.id, userId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching trading session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.put('/api/trading-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertTradingSessionSchema.partial().parse(req.body);
      const session = await storage.updateTradingSession(req.params.id, userId, updates);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error updating trading session:", error);
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete('/api/trading-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteTradingSession(req.params.id, userId);
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
  app.post('/api/trades', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tradeData = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(userId, tradeData);
      res.json(trade);
    } catch (error) {
      console.error("Error creating trade:", error);
      res.status(400).json({ message: "Invalid trade data" });
    }
  });

  app.get('/api/trades', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = req.query.sessionId as string;
      const trades = await storage.getTrades(userId, sessionId);
      res.json(trades);
    } catch (error) {
      console.error("Error fetching trades:", error);
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.get('/api/trades/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const trade = await storage.getTrade(req.params.id, userId);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      res.json(trade);
    } catch (error) {
      console.error("Error fetching trade:", error);
      res.status(500).json({ message: "Failed to fetch trade" });
    }
  });

  app.put('/api/trades/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertTradeSchema.partial().parse(req.body);
      const trade = await storage.updateTrade(req.params.id, userId, updates);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      res.json(trade);
    } catch (error) {
      console.error("Error updating trade:", error);
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete('/api/trades/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteTrade(req.params.id, userId);
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
  app.post('/api/journal-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(userId, entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(400).json({ message: "Invalid entry data" });
    }
  });

  app.get('/api/journal-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tradeId = req.query.tradeId as string;
      const entries = await storage.getJournalEntries(userId, tradeId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  app.get('/api/journal-entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entry = await storage.getJournalEntry(req.params.id, userId);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching journal entry:", error);
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });

  app.put('/api/journal-entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertJournalEntrySchema.partial().parse(req.body);
      const entry = await storage.updateJournalEntry(req.params.id, userId, updates);
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
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteJournalEntry(req.params.id, userId);
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
      const userId = req.user.claims.sub;
      const performance = await storage.getUserPerformance(userId);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching performance analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
