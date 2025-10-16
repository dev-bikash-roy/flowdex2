/**
 * Utility functions for formatting trading pairs
 */

export interface TradingPairInfo {
  value: string;
  label: string;
  description: string;
  twelveDataSymbol: string;  // Format for Twelve Data API
  tradingViewSymbol: string; // Format for TradingView charts
}

export const tradingPairs: TradingPairInfo[] = [
  { value: "EURUSD", label: "EUR/USD", description: "Euro vs US Dollar", twelveDataSymbol: "EUR/USD", tradingViewSymbol: "FX:EURUSD" },
  { value: "GBPUSD", label: "GBP/USD", description: "British Pound vs US Dollar", twelveDataSymbol: "GBP/USD", tradingViewSymbol: "FX:GBPUSD" },
  { value: "USDJPY", label: "USD/JPY", description: "US Dollar vs Japanese Yen", twelveDataSymbol: "USD/JPY", tradingViewSymbol: "FX:USDJPY" },
  { value: "USDCHF", label: "USD/CHF", description: "US Dollar vs Swiss Franc", twelveDataSymbol: "USD/CHF", tradingViewSymbol: "FX:USDCHF" },
  { value: "AUDUSD", label: "AUD/USD", description: "Australian Dollar vs US Dollar", twelveDataSymbol: "AUD/USD", tradingViewSymbol: "FX:AUDUSD" },
  { value: "USDCAD", label: "USD/CAD", description: "US Dollar vs Canadian Dollar", twelveDataSymbol: "USD/CAD", tradingViewSymbol: "FX:USDCAD" },
  { value: "NZDUSD", label: "NZD/USD", description: "New Zealand Dollar vs US Dollar", twelveDataSymbol: "NZD/USD", tradingViewSymbol: "FX:NZDUSD" },
  { value: "EURGBP", label: "EUR/GBP", description: "Euro vs British Pound", twelveDataSymbol: "EUR/GBP", tradingViewSymbol: "FX:EURGBP" },
  { value: "EURJPY", label: "EUR/JPY", description: "Euro vs Japanese Yen", twelveDataSymbol: "EUR/JPY", tradingViewSymbol: "FX:EURJPY" },
  { value: "GBPJPY", label: "GBP/JPY", description: "British Pound vs Japanese Yen", twelveDataSymbol: "GBP/JPY", tradingViewSymbol: "FX:GBPJPY" },
  { value: "XAUUSD", label: "XAU/USD", description: "Gold vs US Dollar", twelveDataSymbol: "XAU/USD", tradingViewSymbol: "TVC:GOLD" },
  { value: "XAGUSD", label: "XAG/USD", description: "Silver vs US Dollar", twelveDataSymbol: "XAG/USD", tradingViewSymbol: "TVC:SILVER" },
  { value: "BTCUSD", label: "BTC/USD", description: "Bitcoin vs US Dollar", twelveDataSymbol: "BTC/USD", tradingViewSymbol: "BINANCE:BTCUSDT" },
  { value: "ETHUSD", label: "ETH/USD", description: "Ethereum vs US Dollar", twelveDataSymbol: "ETH/USD", tradingViewSymbol: "BINANCE:ETHUSDT" },
  { value: "GER40", label: "DAX", description: "DAX Index (Germany)", twelveDataSymbol: "DAX", tradingViewSymbol: "TVC:DAX" },
];

/**
 * Format a trading pair from database format (EURUSD) to display format (EUR/USD)
 * @param pair - The trading pair in database format (e.g., "EURUSD")
 * @returns The formatted trading pair (e.g., "EUR/USD") or the original if not found
 */
export function formatTradingPair(pair: string): string {
  const pairInfo = tradingPairs.find(p => p.value === pair);
  return pairInfo ? pairInfo.label : pair;
}

/**
 * Get trading pair information including description
 * @param pair - The trading pair in database format (e.g., "EURUSD")
 * @returns The trading pair info object or null if not found
 */
export function getTradingPairInfo(pair: string): TradingPairInfo | null {
  return tradingPairs.find(p => p.value === pair) || null;
}

/**
 * Format trading pair with description for display
 * @param pair - The trading pair in database format (e.g., "EURUSD")
 * @returns Formatted string like "EUR/USD - Euro vs US Dollar"
 */
export function formatTradingPairWithDescription(pair: string): string {
  const pairInfo = getTradingPairInfo(pair);
  if (pairInfo) {
    return `${pairInfo.label} - ${pairInfo.description}`;
  }
  return pair;
}

/**
 * Get Twelve Data symbol format for API calls
 * @param pair - The trading pair in database format (e.g., "EURUSD")
 * @returns Twelve Data symbol format (e.g., "EUR/USD")
 */
export function getTwelveDataSymbol(pair: string): string {
  const pairInfo = getTradingPairInfo(pair);
  return pairInfo ? pairInfo.twelveDataSymbol : pair;
}

/**
 * Get TradingView symbol format for charts
 * @param pair - The trading pair in database format (e.g., "EURUSD")
 * @returns TradingView symbol format (e.g., "FX:EURUSD")
 */
export function getTradingViewSymbol(pair: string): string {
  const pairInfo = getTradingPairInfo(pair);
  return pairInfo ? pairInfo.tradingViewSymbol : pair;
}