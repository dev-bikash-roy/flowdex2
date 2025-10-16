/**
 * Utility functions for formatting trading pairs
 */

export interface TradingPairInfo {
  value: string;
  label: string;
  description: string;
}

export const tradingPairs: TradingPairInfo[] = [
  { value: "EURUSD", label: "EUR/USD", description: "Euro vs US Dollar" },
  { value: "GBPUSD", label: "GBP/USD", description: "British Pound vs US Dollar" },
  { value: "USDJPY", label: "USD/JPY", description: "US Dollar vs Japanese Yen" },
  { value: "USDCHF", label: "USD/CHF", description: "US Dollar vs Swiss Franc" },
  { value: "AUDUSD", label: "AUD/USD", description: "Australian Dollar vs US Dollar" },
  { value: "USDCAD", label: "USD/CAD", description: "US Dollar vs Canadian Dollar" },
  { value: "NZDUSD", label: "NZD/USD", description: "New Zealand Dollar vs US Dollar" },
  { value: "EURGBP", label: "EUR/GBP", description: "Euro vs British Pound" },
  { value: "EURJPY", label: "EUR/JPY", description: "Euro vs Japanese Yen" },
  { value: "GBPJPY", label: "GBP/JPY", description: "British Pound vs Japanese Yen" },
  { value: "XAUUSD", label: "XAU/USD", description: "Gold vs US Dollar" },
  { value: "XAGUSD", label: "XAG/USD", description: "Silver vs US Dollar" },
  { value: "BTCUSD", label: "BTC/USD", description: "Bitcoin vs US Dollar" },
  { value: "ETHUSD", label: "ETH/USD", description: "Ethereum vs US Dollar" },
  { value: "US30", label: "US30", description: "Dow Jones Industrial Average" },
  { value: "NAS100", label: "NAS100", description: "NASDAQ 100 Index" },
  { value: "SPX500", label: "SPX500", description: "S&P 500 Index" },
  { value: "GER40", label: "GER40", description: "DAX 40 Index (Germany)" },
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