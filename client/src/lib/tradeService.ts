import { apiRequest } from './queryClient';

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
export async function executeTrade(tradeData: TradeData): Promise<TradeResponse> {
  try {
    const response = await apiRequest('POST', '/api/trades', serializeTradeData(tradeData));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
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
export async function closeTrade(tradeId: string, exitPrice: number): Promise<TradeResponse> {
  try {
    const response = await apiRequest(
      'PUT',
      `/api/trades/${tradeId}`,
      serializeTradeData({
        exitPrice,
        status: 'closed',
        exitTime: new Date().toISOString(),
      }),
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
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
export async function fetchTrades(sessionId: string): Promise<TradeResponse[]> {
  try {
    const response = await apiRequest('GET', `/api/trades?sessionId=${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
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
export async function updateTrade(tradeId: string, updates: Partial<TradeData>): Promise<TradeResponse> {
  try {
    const response = await apiRequest('PUT', `/api/trades/${tradeId}`, serializeTradeData(updates));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
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
    const response = await apiRequest('DELETE', `/api/trades/${tradeId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting trade:', error);
    throw new Error(`Failed to delete trade: ${error}`);
  }
}