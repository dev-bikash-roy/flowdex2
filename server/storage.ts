import {
  users,
  tradingSessions,
  trades,
  journalEntries,
  type User,
  type UpsertUser,
  type TradingSession,
  type InsertTradingSession,
  type Trade,
  type InsertTrade,
  type JournalEntry,
  type InsertJournalEntry,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, between } from "drizzle-orm";

// In-memory storage for development
const inMemoryStorage: {
  users: Record<string, any>;
  tradingSessions: Record<string, any>;
  trades: Record<string, any>;
  journalEntries: Record<string, any>;
} = {
  users: {},
  tradingSessions: {},
  trades: {},
  journalEntries: {}
};

let useInMemory = process.env.NODE_ENV?.trim().toLowerCase() === 'development' || 
                       process.env.DEVELOPMENT === 'true' ||
                       (!process.env.NODE_ENV && !process.env.REPL_ID);

// Check if we can connect to the database
if (!useInMemory && !process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using in-memory storage");
  useInMemory = true;
}

// Export the useInMemory variable so it can be accessed from other files
export { useInMemory };

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Trading session operations
  createTradingSession(userId: string, session: InsertTradingSession): Promise<TradingSession>;
  getTradingSessions(userId: string): Promise<TradingSession[]>;
  getTradingSession(id: string, userId: string): Promise<TradingSession | undefined>;
  updateTradingSession(id: string, userId: string, updates: Partial<InsertTradingSession>): Promise<TradingSession | undefined>;
  deleteTradingSession(id: string, userId: string): Promise<boolean>;
  
  // Trade operations
  createTrade(userId: string, trade: InsertTrade): Promise<Trade>;
  getTrades(userId: string, sessionId?: string): Promise<Trade[]>;
  getTrade(id: string, userId: string): Promise<Trade | undefined>;
  updateTrade(id: string, userId: string, updates: Partial<InsertTrade>): Promise<Trade | undefined>;
  deleteTrade(id: string, userId: string): Promise<boolean>;
  
  // Journal entry operations
  createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(userId: string, tradeId?: string): Promise<JournalEntry[]>;
  getJournalEntry(id: string, userId: string): Promise<JournalEntry | undefined>;
  updateJournalEntry(id: string, userId: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: string, userId: string): Promise<boolean>;
  
  // Analytics operations
  getUserPerformance(userId: string): Promise<{
    totalReturn: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    totalTrades: number;
    winningTrades: number;
    averageWin: number;
    averageLoss: number;
    bestTrade: number;
    worstTrade: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    // In development, return the mock user if requested
    if (useInMemory) {
      // Check if this is the mock user
      if (id === "dev-user-1") {
        return {
          id: "dev-user-1",
          email: "developer@example.com",
          firstName: "Dev",
          lastName: "User",
          profileImageUrl: "",
          passwordHash: "",
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      return inMemoryStorage.users[id];
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (useInMemory) {
      const user = {
        ...userData,
        id: userData.id || `user_${Date.now()}`,
        email: userData.email !== undefined ? userData.email : null,
        firstName: userData.firstName !== undefined ? userData.firstName : null,
        lastName: userData.lastName !== undefined ? userData.lastName : null,
        profileImageUrl: userData.profileImageUrl !== undefined ? userData.profileImageUrl : null,
        passwordHash: userData.passwordHash !== undefined ? userData.passwordHash : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStorage.users[user.id] = user;
      return user;
    }
    
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Trading session operations
  async createTradingSession(userId: string, session: InsertTradingSession): Promise<TradingSession> {
    if (useInMemory) {
      const newSession = {
        id: `session_${Date.now()}`,
        userId,
        ...session,
        currentBalance: session.startingBalance,
        isActive: true,
        description: session.description !== undefined ? session.description : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStorage.tradingSessions[newSession.id] = newSession;
      return newSession;
    }
    
    const [newSession] = await db
      .insert(tradingSessions)
      .values({
        ...session,
        userId,
        currentBalance: session.startingBalance,
      })
      .returning();
    return newSession;
  }

  async getTradingSessions(userId: string): Promise<TradingSession[]> {
    if (useInMemory) {
      return Object.values(inMemoryStorage.tradingSessions)
        .filter((session: any) => session.userId === userId)
        .sort((a: any, b: any) => b.createdAt - a.createdAt);
    }
    
    return await db
      .select()
      .from(tradingSessions)
      .where(eq(tradingSessions.userId, userId))
      .orderBy(desc(tradingSessions.createdAt));
  }

  async getTradingSession(id: string, userId: string): Promise<TradingSession | undefined> {
    if (useInMemory) {
      const session = inMemoryStorage.tradingSessions[id];
      return session && session.userId === userId ? session : undefined;
    }
    
    const [session] = await db
      .select()
      .from(tradingSessions)
      .where(and(eq(tradingSessions.id, id), eq(tradingSessions.userId, userId)));
    return session;
  }

  async updateTradingSession(id: string, userId: string, updates: Partial<InsertTradingSession>): Promise<TradingSession | undefined> {
    if (useInMemory) {
      const session = inMemoryStorage.tradingSessions[id];
      if (!session || session.userId !== userId) return undefined;
      
      const updatedSession = {
        ...session,
        ...updates,
        updatedAt: new Date()
      };
      inMemoryStorage.tradingSessions[id] = updatedSession;
      return updatedSession;
    }
    
    const [updated] = await db
      .update(tradingSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tradingSessions.id, id), eq(tradingSessions.userId, userId)))
      .returning();
    return updated;
  }

  async deleteTradingSession(id: string, userId: string): Promise<boolean> {
    if (useInMemory) {
      const session = inMemoryStorage.tradingSessions[id];
      if (!session || session.userId !== userId) return false;
      
      delete inMemoryStorage.tradingSessions[id];
      return true;
    }
    
    const result = await db
      .delete(tradingSessions)
      .where(and(eq(tradingSessions.id, id), eq(tradingSessions.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Trade operations
  async createTrade(userId: string, trade: InsertTrade): Promise<Trade> {
    if (useInMemory) {
      const newTrade = {
        id: `trade_${Date.now()}`,
        userId,
        ...trade,
        status: trade.status || 'open',
        exitPrice: trade.exitPrice !== undefined ? trade.exitPrice : null,
        profitLoss: trade.profitLoss !== undefined ? trade.profitLoss : null,
        stopLoss: trade.stopLoss !== undefined ? trade.stopLoss : null,
        takeProfit: trade.takeProfit !== undefined ? trade.takeProfit : null,
        exitTime: trade.exitTime !== undefined ? trade.exitTime : null,
        tags: trade.tags !== undefined ? trade.tags : null,
        notes: trade.notes !== undefined ? trade.notes : null,
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      };
      inMemoryStorage.trades[newTrade.id] = newTrade;
      return newTrade;
    }
    
    const [newTrade] = await db
      .insert(trades)
      .values({
        ...trade,
        userId,
      })
      .returning();
    return newTrade;
  }

  async getTrades(userId: string, sessionId?: string): Promise<Trade[]> {
    if (useInMemory) {
      return Object.values(inMemoryStorage.trades)
        .filter((trade: any) => 
          trade.userId === userId && 
          (!sessionId || trade.sessionId === sessionId)
        )
        .sort((a: any, b: any) => b.entryTime - a.entryTime);
    }
    
    const conditions = [eq(trades.userId, userId)];
    if (sessionId) {
      conditions.push(eq(trades.sessionId, sessionId));
    }
    
    return await db
      .select()
      .from(trades)
      .where(and(...conditions))
      .orderBy(desc(trades.entryTime));
  }

  async getTrade(id: string, userId: string): Promise<Trade | undefined> {
    if (useInMemory) {
      const trade = inMemoryStorage.trades[id];
      return trade && trade.userId === userId ? trade : undefined;
    }
    
    const [trade] = await db
      .select()
      .from(trades)
      .where(and(eq(trades.id, id), eq(trades.userId, userId)));
    return trade;
  }

  async updateTrade(id: string, userId: string, updates: Partial<InsertTrade>): Promise<Trade | undefined> {
    if (useInMemory) {
      const trade = inMemoryStorage.trades[id];
      if (!trade || trade.userId !== userId) return undefined;
      
      const updatedTrade = {
        ...trade,
        ...updates,
        updatedAt: new Date()
      };
      inMemoryStorage.trades[id] = updatedTrade;
      return updatedTrade;
    }
    
    const [updated] = await db
      .update(trades)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(trades.id, id), eq(trades.userId, userId)))
      .returning();
    return updated;
  }

  async deleteTrade(id: string, userId: string): Promise<boolean> {
    if (useInMemory) {
      const trade = inMemoryStorage.trades[id];
      if (!trade || trade.userId !== userId) return false;
      
      delete inMemoryStorage.trades[id];
      return true;
    }
    
    const result = await db
      .delete(trades)
      .where(and(eq(trades.id, id), eq(trades.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Journal entry operations
  async createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry> {
    if (useInMemory) {
      const newEntry = {
        id: `entry_${Date.now()}`,
        userId,
        ...entry,
        emotions: entry.emotions !== undefined ? entry.emotions : null,
        lessons: entry.lessons !== undefined ? entry.lessons : null,
        screenshots: entry.screenshots !== undefined ? entry.screenshots : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryStorage.journalEntries[newEntry.id] = newEntry;
      return newEntry;
    }
    
    const [newEntry] = await db
      .insert(journalEntries)
      .values({
        ...entry,
        userId,
      })
      .returning();
    return newEntry;
  }

  async getJournalEntries(userId: string, tradeId?: string): Promise<JournalEntry[]> {
    if (useInMemory) {
      return Object.values(inMemoryStorage.journalEntries)
        .filter((entry: any) => 
          entry.userId === userId && 
          (!tradeId || entry.tradeId === tradeId)
        )
        .sort((a: any, b: any) => b.createdAt - a.createdAt);
    }
    
    const conditions = [eq(journalEntries.userId, userId)];
    if (tradeId) {
      conditions.push(eq(journalEntries.tradeId, tradeId));
    }
    
    return await db
      .select()
      .from(journalEntries)
      .where(and(...conditions))
      .orderBy(desc(journalEntries.createdAt));
  }

  async getJournalEntry(id: string, userId: string): Promise<JournalEntry | undefined> {
    if (useInMemory) {
      const entry = inMemoryStorage.journalEntries[id];
      return entry && entry.userId === userId ? entry : undefined;
    }
    
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
    return entry;
  }

  async updateJournalEntry(id: string, userId: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    if (useInMemory) {
      const entry = inMemoryStorage.journalEntries[id];
      if (!entry || entry.userId !== userId) return undefined;
      
      const updatedEntry = {
        ...entry,
        ...updates,
        updatedAt: new Date()
      };
      inMemoryStorage.journalEntries[id] = updatedEntry;
      return updatedEntry;
    }
    
    const [updated] = await db
      .update(journalEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .returning();
    return updated;
  }

  async deleteJournalEntry(id: string, userId: string): Promise<boolean> {
    if (useInMemory) {
      const entry = inMemoryStorage.journalEntries[id];
      if (!entry || entry.userId !== userId) return false;
      
      delete inMemoryStorage.journalEntries[id];
      return true;
    }
    
    const result = await db
      .delete(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Analytics operations
  async getUserPerformance(userId: string): Promise<{
    totalReturn: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    totalTrades: number;
    winningTrades: number;
    averageWin: number;
    averageLoss: number;
    bestTrade: number;
    worstTrade: number;
  }> {
    let userTrades: any[] = [];
    
    if (useInMemory) {
      userTrades = Object.values(inMemoryStorage.trades)
        .filter((trade: any) => trade.userId === userId && trade.status === 'closed');
    } else {
      userTrades = await db
        .select()
        .from(trades)
        .where(and(eq(trades.userId, userId), eq(trades.status, 'closed')));
    }

    if (userTrades.length === 0) {
      return {
        totalReturn: 0,
        winRate: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        totalTrades: 0,
        winningTrades: 0,
        averageWin: 0,
        averageLoss: 0,
        bestTrade: 0,
        worstTrade: 0,
      };
    }

    const totalTrades = userTrades.length;
    const profits = userTrades.map(t => parseFloat(t.profitLoss || '0'));
    const totalReturn = profits.reduce((sum, p) => sum + p, 0);
    
    const winningTrades = profits.filter(p => p > 0);
    const losingTrades = profits.filter(p => p < 0);
    
    const winRate = (winningTrades.length / totalTrades) * 100;
    const grossProfit = winningTrades.reduce((sum, p) => sum + p, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, p) => sum + p, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    
    const averageWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
    
    const bestTrade = Math.max(...profits);
    const worstTrade = Math.min(...profits);
    
    // Calculate max drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let runningTotal = 0;
    
    for (const profit of profits) {
      runningTotal += profit;
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      totalReturn,
      winRate,
      profitFactor,
      maxDrawdown,
      totalTrades,
      winningTrades: winningTrades.length,
      averageWin,
      averageLoss,
      bestTrade,
      worstTrade,
    };
  }
}

export const storage = new DatabaseStorage();