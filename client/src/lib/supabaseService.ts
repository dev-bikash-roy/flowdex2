import { supabase } from '@/lib/supabaseClient'

// User operations
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export const updateUser = async (updates: any) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  })
  if (error) throw error
  return data.user
}

// Trading Sessions
export const getTradingSessions = async () => {
  const { data, error } = await supabase
    .from('trading_sessions')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createTradingSession = async (session: any) => {
  // Convert numeric values to proper format
  const sessionData = {
    ...session,
    starting_balance: session.startingBalance?.toString(),
    current_balance: session.currentBalance?.toString()
  }
  
  const { data, error } = await supabase
    .from('trading_sessions')
    .insert(sessionData)
    .select()
    .single()
  
  if (error) throw error
  
  // Convert back to frontend format
  return {
    ...data,
    startingBalance: data.starting_balance ? parseFloat(data.starting_balance) : null,
    currentBalance: data.current_balance ? parseFloat(data.current_balance) : null
  }
}

export const getTradingSession = async (id: string) => {
  const { data, error } = await supabase
    .from('trading_sessions')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  
  // Convert to frontend format
  return {
    ...data,
    startingBalance: data.starting_balance ? parseFloat(data.starting_balance) : null,
    currentBalance: data.current_balance ? parseFloat(data.current_balance) : null
  }
}

export const updateTradingSession = async (id: string, updates: any) => {
  // Convert numeric values to proper format
  const sessionUpdates: any = { ...updates }
  if (updates.startingBalance !== undefined) {
    sessionUpdates.starting_balance = updates.startingBalance?.toString()
  }
  if (updates.currentBalance !== undefined) {
    sessionUpdates.current_balance = updates.currentBalance?.toString()
  }
  
  const { data, error } = await supabase
    .from('trading_sessions')
    .update(sessionUpdates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  
  // Convert back to frontend format
  return {
    ...data,
    startingBalance: data.starting_balance ? parseFloat(data.starting_balance) : null,
    currentBalance: data.current_balance ? parseFloat(data.current_balance) : null
  }
}

export const deleteTradingSession = async (id: string) => {
  const { error } = await supabase
    .from('trading_sessions')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Trades
export const getTrades = async (sessionId?: string) => {
  let query = supabase
    .from('trades')
    .select('*')
    .order('entry_time', { ascending: false })
  
  if (sessionId) {
    query = query.eq('session_id', sessionId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  
  // Convert to frontend format
  return data.map(trade => ({
    ...trade,
    entryPrice: trade.entry_price ? parseFloat(trade.entry_price) : null,
    exitPrice: trade.exit_price ? parseFloat(trade.exit_price) : null,
    quantity: trade.quantity ? parseFloat(trade.quantity) : null,
    stopLoss: trade.stop_loss ? parseFloat(trade.stop_loss) : null,
    takeProfit: trade.take_profit ? parseFloat(trade.take_profit) : null,
    profitLoss: trade.profit_loss ? parseFloat(trade.profit_loss) : null
  }))
}

export const createTrade = async (trade: any) => {
  // Convert numeric values to proper format
  const tradeData = {
    ...trade,
    entry_price: trade.entryPrice?.toString(),
    exit_price: trade.exitPrice?.toString(),
    quantity: trade.quantity?.toString(),
    stop_loss: trade.stopLoss?.toString(),
    take_profit: trade.takeProfit?.toString(),
    profit_loss: trade.profitLoss?.toString()
  }
  
  const { data, error } = await supabase
    .from('trades')
    .insert(tradeData)
    .select()
    .single()
  
  if (error) throw error
  
  // Convert back to frontend format
  return {
    ...data,
    entryPrice: data.entry_price ? parseFloat(data.entry_price) : null,
    exitPrice: data.exit_price ? parseFloat(data.exit_price) : null,
    quantity: data.quantity ? parseFloat(data.quantity) : null,
    stopLoss: data.stop_loss ? parseFloat(data.stop_loss) : null,
    takeProfit: data.take_profit ? parseFloat(data.take_profit) : null,
    profitLoss: data.profit_loss ? parseFloat(data.profit_loss) : null
  }
}

export const getTrade = async (id: string) => {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  
  // Convert to frontend format
  return {
    ...data,
    entryPrice: data.entry_price ? parseFloat(data.entry_price) : null,
    exitPrice: data.exit_price ? parseFloat(data.exit_price) : null,
    quantity: data.quantity ? parseFloat(data.quantity) : null,
    stopLoss: data.stop_loss ? parseFloat(data.stop_loss) : null,
    takeProfit: data.take_profit ? parseFloat(data.take_profit) : null,
    profitLoss: data.profit_loss ? parseFloat(data.profit_loss) : null
  }
}

export const updateTrade = async (id: string, updates: any) => {
  // Convert numeric values to proper format
  const tradeUpdates: any = { ...updates }
  if (updates.entryPrice !== undefined) {
    tradeUpdates.entry_price = updates.entryPrice?.toString()
  }
  if (updates.exitPrice !== undefined) {
    tradeUpdates.exit_price = updates.exitPrice?.toString()
  }
  if (updates.quantity !== undefined) {
    tradeUpdates.quantity = updates.quantity?.toString()
  }
  if (updates.stopLoss !== undefined) {
    tradeUpdates.stop_loss = updates.stopLoss?.toString()
  }
  if (updates.takeProfit !== undefined) {
    tradeUpdates.take_profit = updates.takeProfit?.toString()
  }
  if (updates.profitLoss !== undefined) {
    tradeUpdates.profit_loss = updates.profitLoss?.toString()
  }
  
  const { data, error } = await supabase
    .from('trades')
    .update(tradeUpdates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  
  // Convert back to frontend format
  return {
    ...data,
    entryPrice: data.entry_price ? parseFloat(data.entry_price) : null,
    exitPrice: data.exit_price ? parseFloat(data.exit_price) : null,
    quantity: data.quantity ? parseFloat(data.quantity) : null,
    stopLoss: data.stop_loss ? parseFloat(data.stop_loss) : null,
    takeProfit: data.take_profit ? parseFloat(data.take_profit) : null,
    profitLoss: data.profit_loss ? parseFloat(data.profit_loss) : null
  }
}

export const deleteTrade = async (id: string) => {
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Journal Entries
export const getJournalEntries = async (tradeId?: string) => {
  let query = supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (tradeId) {
    query = query.eq('trade_id', tradeId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export const createJournalEntry = async (entry: any) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert(entry)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getJournalEntry = async (id: string) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export const updateJournalEntry = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteJournalEntry = async (id: string) => {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Analytics
export const getUserPerformance = async () => {
  // Get all user's closed trades for performance calculation
  const { data: trades, error } = await supabase
    .from('trades')
    .select('profit_loss, status')
    .eq('status', 'closed')
  
  if (error) throw error
  
  if (trades.length === 0) {
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
  
  const profits = trades.map(t => parseFloat(t.profit_loss || '0'))
  const totalTrades = trades.length
  const totalReturn = profits.reduce((sum, p) => sum + p, 0)
  
  const winningTrades = profits.filter(p => p > 0)
  const losingTrades = profits.filter(p => p < 0)
  
  const winRate = (winningTrades.length / totalTrades) * 100
  const grossProfit = winningTrades.reduce((sum, p) => sum + p, 0)
  const grossLoss = Math.abs(losingTrades.reduce((sum, p) => sum + p, 0))
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
}