import { supabase } from './supabaseClient';

export interface TradeData {
  sessionId: string;
  pair: string;
  type: 'buy' | 'sell';
  executionType: 'market' | 'limit' | 'stop';
  entryPrice: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  notes?: string;
  tags?: string[];
}

function serializeTradeData<T extends object>(data: T): Record<string, unknown> {
  const decimalFields = [
    'entryPrice',
    'exitPrice',
    'quantity',
    'stopLoss',
    'takeProfit',
    'profitLoss',
  ];

  const serialized: Record<string, unknown> = { ...(data as Record<string, unknown>) };

  for (const field of decimalFields) {
    const value = serialized[field];
    if (value !== undefined && value !== null) {
      serialized[field] = value.toString();
    }
  }

  return serialized;
}

// Convert string values back to numbers for frontend
function deserializeTradeData(data: any): any {
  const decimalFields = [
    'entryPrice',
    'exitPrice',
    'quantity',
    'stopLoss',
    'takeProfit',
    'profitLoss',
  ];

  const deserialized: any = { ...data };

  for (const field of decimalFields) {
    const value = deserialized[field];
    if (value !== undefined && value !== null) {
      deserialized[field] = parseFloat(value);
    }
  }

  return deserialized;
}

export interface TradeResponse {
  id: string;
  sessionId: string;
  userId: string;
  pair: string;
  type: string;
  executionType: string;
  entryPrice: string;
  exitPrice: string | null;
  quantity: string;
  stopLoss: string | null;
  takeProfit: string | null;
  profitLoss: string | null;
  status: string;
  entryTime: string;
  exitTime: string | null;
  notes: string | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Execute a new trade
 * @param tradeData Trade execution data
 * @returns Promise with created trade
 */
export async function executeTrade(tradeData: TradeData): Promise<any> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Prepare trade data
    const tradeRecord = {
      session_id: tradeData.sessionId,
      user_id: user.id,
      pair: tradeData.pair,
      type: tradeData.type,
      execution_type: tradeData.executionType,
      entry_price: tradeData.entryPrice.toString(),
      quantity: tradeData.quantity.toString(),
      stop_loss: tradeData.stopLoss?.toString(),
      take_profit: tradeData.takeProfit?.toString(),
      status: 'open',
      entry_time: new Date().toISOString(),
      notes: tradeData.notes,
      tags: tradeData.tags,
    };

    const { data, error } = await supabase
      .from('trades')
      .insert(tradeRecord)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return deserializeTradeData(data);
  } catch (error) {
    console.error('Error executing trade:', error);
    throw new Error(`Failed to execute trade: ${error}`);
  }
}

/**
 * Close an existing trade
 * @param tradeId ID of the trade to close
 * @param exitPrice Price at which to close the trade
 * @returns Promise with updated trade
 */
export async function closeTrade(tradeId: string, exitPrice: number): Promise<any> {
  try {
    const updates = {
      exit_price: exitPrice.toString(),
      status: 'closed',
      exit_time: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', tradeId)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return deserializeTradeData(data);
  } catch (error) {
    console.error('Error closing trade:', error);
    throw new Error(`Failed to close trade: ${error}`);
  }
}

/**
 * Fetch all trades for a session
 * @param sessionId Session ID to fetch trades for
 * @returns Promise with array of trades
 */
export async function fetchTrades(sessionId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('session_id', sessionId)
      .order('entry_time', { ascending: false });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data.map(deserializeTradeData);
  } catch (error) {
    console.error('Error fetching trades:', error);
    throw new Error(`Failed to fetch trades: ${error}`);
  }
}

/**
 * Update trade details
 * @param tradeId ID of the trade to update
 * @param updates Partial trade data to update
 * @returns Promise with updated trade
 */
export async function updateTrade(tradeId: string, updates: Partial<TradeData>): Promise<any> {
  try {
    // Convert updates to proper format
    const dbUpdates: any = {};
    if (updates.stopLoss !== undefined) dbUpdates.stop_loss = updates.stopLoss.toString();
    if (updates.takeProfit !== undefined) dbUpdates.take_profit = updates.takeProfit.toString();
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.executionType !== undefined) dbUpdates.execution_type = updates.executionType;

    const { data, error } = await supabase
      .from('trades')
      .update(dbUpdates)
      .eq('id', tradeId)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return deserializeTradeData(data);
  } catch (error) {
    console.error('Error updating trade:', error);
    throw new Error(`Failed to update trade: ${error}`);
  }
}

/**
 * Delete a trade
 * @param tradeId ID of the trade to delete
 * @returns Promise with deletion result
 */
export async function deleteTrade(tradeId: string): Promise<{ message: string }> {
  try {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeId);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return { message: 'Trade deleted successfully' };
  } catch (error) {
    console.error('Error deleting trade:', error);
    throw new Error(`Failed to delete trade: ${error}`);
  }
}