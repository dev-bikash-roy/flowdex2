import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomBytes, scryptSync } from "crypto";

// Load environment variables
dotenv.config();

// Create Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper function for password hashing (for local auth)
const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export interface IStorage {
  // User operations
  getUser(id: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  upsertUser(user: any): Promise<any>;
  
  // Trading session operations
  createTradingSession(userId: string, session: any): Promise<any>;
  getTradingSessions(userId: string): Promise<any[]>;
  getTradingSession(id: string, userId: string): Promise<any>;
  updateTradingSession(id: string, userId: string, updates: any): Promise<any>;
  deleteTradingSession(id: string, userId: string): Promise<boolean>;
  
  // Trade operations
  createTrade(userId: string, trade: any): Promise<any>;
  getTrades(userId: string, sessionId?: string): Promise<any[]>;
  getTrade(id: string, userId: string): Promise<any>;
  updateTrade(id: string, userId: string, updates: any): Promise<any>;
  deleteTrade(id: string, userId: string): Promise<boolean>;
  
  // Journal entry operations
  createJournalEntry(userId: string, entry: any): Promise<any>;
  getJournalEntries(userId: string, tradeId?: string): Promise<any[]>;
  getJournalEntry(id: string, userId: string): Promise<any>;
  updateJournalEntry(id: string, userId: string, updates: any): Promise<any>;
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
  async getUser(id: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error getting user:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        console.error("Error getting user by email:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  async upsertUser(userData: any): Promise<any> {
    try {
      // Check if user exists
      let existingUser = null;
      if (userData.id) {
        existingUser = await this.getUser(userData.id);
      } else if (userData.email) {
        existingUser = await this.getUserByEmail(userData.email);
      }

      if (existingUser) {
        // Update existing user
        const updates: any = {};
        if (userData.email) updates.email = userData.email;
        if (userData.firstName !== undefined) updates.first_name = userData.firstName;
        if (userData.lastName !== undefined) updates.last_name = userData.lastName;
        if (userData.profileImageUrl !== undefined) updates.profile_image_url = userData.profileImageUrl;
        if (userData.passwordHash) updates.password_hash = userData.passwordHash;
        
        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', existingUser.id)
          .select()
          .single();
        
        if (error) {
          console.error("Error updating user:", error);
          throw error;
        }
        
        return data;
      } else {
        // Create new user
        const newUser: any = {
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          profile_image_url: userData.profileImageUrl
        };
        
        if (userData.passwordHash) {
          newUser.password_hash = userData.passwordHash;
        } else if (userData.password) {
          newUser.password_hash = hashPassword(userData.password);
        }
        
        if (userData.id) {
          newUser.id = userData.id;
        }
        
        const { data, error } = await supabase
          .from('users')
          .insert(newUser)
          .select()
          .single();
        
        if (error) {
          console.error("Error creating user:", error);
          throw error;
        }
        
        return data;
      }
    } catch (error) {
      console.error("Error upserting user:", error);
      throw error;
    }
  }

  // Trading session operations
  async createTradingSession(userId: string, session: any): Promise<any> {
    try {
      console.log("Storage received session data:", session);
      console.log("currentBalance in storage:", session.currentBalance);
      
      // Additional defensive logging
      console.log("Storage - Checking session object properties:");
      console.log("- All keys:", Object.keys(session));
      console.log("- currentBalance property exists:", 'currentBalance' in session);
      console.log("- currentBalance value:", session.currentBalance);
      console.log("- currentBalance type:", typeof session.currentBalance);
      
      // Ensure currentBalance is always present and has a value
      // This is a critical fix for the null constraint issue
      let currentBalanceValue = session.currentBalance;
      if (currentBalanceValue === undefined || currentBalanceValue === null) {
        console.log("currentBalance is undefined or null, using startingBalance or default value");
        currentBalanceValue = session.startingBalance || 0;
      }
      
      // Convert to database format (snake_case) and ensure current_balance is never null
      const dbSession = {
        name: session.name,
        pair: session.pair,
        starting_balance: session.startingBalance?.toString() || '0',
        current_balance: currentBalanceValue.toString(), // This should never be undefined now
        start_date: session.startDate,
        description: session.description || '',
        user_id: userId,
        is_active: true,
      };
      
      // Additional defensive check
      if (!dbSession.current_balance) {
        console.log("WARNING: current_balance is falsy, setting to starting_balance or default");
        dbSession.current_balance = dbSession.starting_balance || '0';
      }
      
      console.log("Creating trading session with data:", dbSession);
      
      const { data, error } = await supabase
        .from('trading_sessions')
        .insert(dbSession)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating trading session:", error);
        throw error;
      }
      
      console.log("Trading session created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error creating trading session:", error);
      throw error;
    }
  }

  async getTradingSessions(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('trading_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error getting trading sessions:", error);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error getting trading sessions:", error);
      return [];
    }
  }

  async getTradingSession(id: string, userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('trading_sessions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error getting trading session:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getting trading session:", error);
      return null;
    }
  }

  async updateTradingSession(id: string, userId: string, updates: any): Promise<any> {
    try {
      // Convert numeric values to strings for database storage
      const dbUpdates: any = {};
      if (updates.name !== undefined) {
        dbUpdates.name = updates.name;
      }
      if (updates.pair !== undefined) {
        dbUpdates.pair = updates.pair;
      }
      if (updates.startingBalance !== undefined) {
        dbUpdates.starting_balance = updates.startingBalance?.toString();
      }
      if (updates.currentBalance !== undefined) {
        dbUpdates.current_balance = updates.currentBalance?.toString();
      } else if (updates.startingBalance !== undefined) {
        // If startingBalance is updated but currentBalance is not, update currentBalance as well
        dbUpdates.current_balance = updates.startingBalance?.toString();
      }
      if (updates.startDate !== undefined) {
        dbUpdates.start_date = updates.startDate;
      }
      if (updates.endDate !== undefined) {
        dbUpdates.end_date = updates.endDate;
      }
      if (updates.description !== undefined) {
        dbUpdates.description = updates.description;
      }
      if (updates.isActive !== undefined) {
        dbUpdates.is_active = updates.isActive;
      }
      
      const { data, error } = await supabase
        .from('trading_sessions')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating trading session:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error updating trading session:", error);
      throw error;
    }
  }

  async deleteTradingSession(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trading_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error deleting trading session:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting trading session:", error);
      return false;
    }
  }

  // Trade operations
  async createTrade(userId: string, trade: any): Promise<any> {
    try {
      const newTrade = {
        ...trade,
        user_id: userId,
        entry_price: trade.entryPrice?.toString(),
        exit_price: trade.exitPrice?.toString(),
        quantity: trade.quantity?.toString(),
        stop_loss: trade.stopLoss?.toString(),
        take_profit: trade.takeProfit?.toString(),
        profit_loss: trade.profitLoss?.toString()
      };
      
      const { data, error } = await supabase
        .from('trades')
        .insert(newTrade)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating trade:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error creating trade:", error);
      throw error;
    }
  }

  async getTrades(userId: string, sessionId?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId);
      
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      
      // Apply ordering
      const { data, error } = await query
        .order('entry_time', { ascending: false });
      
      if (error) {
        console.error("Error getting trades:", error);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error getting trades:", error);
      return [];
    }
  }

  async getTrade(id: string, userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error getting trade:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getting trade:", error);
      return null;
    }
  }

  async updateTrade(id: string, userId: string, updates: any): Promise<any> {
    try {
      // Convert numeric values to strings for database storage
      const dbUpdates: any = { ...updates };
      if (updates.entryPrice !== undefined) {
        dbUpdates.entry_price = updates.entryPrice?.toString();
      }
      if (updates.exitPrice !== undefined) {
        dbUpdates.exit_price = updates.exitPrice?.toString();
      }
      if (updates.quantity !== undefined) {
        dbUpdates.quantity = updates.quantity?.toString();
      }
      if (updates.stopLoss !== undefined) {
        dbUpdates.stop_loss = updates.stopLoss?.toString();
      }
      if (updates.takeProfit !== undefined) {
        dbUpdates.take_profit = updates.takeProfit?.toString();
      }
      if (updates.profitLoss !== undefined) {
        dbUpdates.profit_loss = updates.profitLoss?.toString();
      }
      
      const { data, error } = await supabase
        .from('trades')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating trade:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error updating trade:", error);
      throw error;
    }
  }

  async deleteTrade(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error deleting trade:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting trade:", error);
      return false;
    }
  }

  // Journal entry operations
  async createJournalEntry(userId: string, entry: any): Promise<any> {
    try {
      const newEntry = {
        ...entry,
        user_id: userId
      };
      
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(newEntry)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating journal entry:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error creating journal entry:", error);
      throw error;
    }
  }

  async getJournalEntries(userId: string, tradeId?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId);
      
      if (tradeId) {
        query = query.eq('trade_id', tradeId);
      }
      
      // Apply ordering
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error getting journal entries:", error);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error getting journal entries:", error);
      return [];
    }
  }

  async getJournalEntry(id: string, userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error getting journal entry:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error getting journal entry:", error);
      return null;
    }
  }

  async updateJournalEntry(id: string, userId: string, updates: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating journal entry:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error updating journal entry:", error);
      throw error;
    }
  }

  async deleteJournalEntry(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error deleting journal entry:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      return false;
    }
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
    try {
      // Get all user's closed trades for performance calculation
      const { data: tradesData, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'closed');
      
      if (error) {
        console.error("Error getting user trades:", error);
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
        }
      }
      
      if (tradesData.length === 0) {
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
        }
      }
      
      const profits: number[] = tradesData.map((t: any) => parseFloat(t.profit_loss || '0'))
      const totalTrades = tradesData.length
      const totalReturn = profits.reduce((sum: number, p: number) => sum + p, 0)
      
      const winningTrades = profits.filter((p: number) => p > 0)
      const losingTrades = profits.filter((p: number) => p < 0)
      
      const winRate = (winningTrades.length / totalTrades) * 100
      const grossProfit = winningTrades.reduce((sum: number, p: number) => sum + p, 0)
      const grossLoss = Math.abs(losingTrades.reduce((sum: number, p: number) => sum + p, 0))
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0
      
      const averageWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0
      const averageLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0
      
      const bestTrade = Math.max(...profits)
      const worstTrade = Math.min(...profits)
      
      // Calculate max drawdown
      let peak = 0
      let maxDrawdown = 0
      let runningTotal = 0
      
      for (const profit of profits) {
        runningTotal += profit
        if (runningTotal > peak) {
          peak = runningTotal
        }
        const drawdown = peak - runningTotal
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown
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
      }
    } catch (error) {
      console.error("Error getting user performance:", error);
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
      }
    }
  }
}

export const storage = new DatabaseStorage();