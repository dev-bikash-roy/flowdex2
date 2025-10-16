/**
 * Utility functions for formatting trading pairs
 */

export interface TradingPairInfo {
  value: string;
  label: string;
  description: string;
}

export const tradingPairs: TradingPairInfo[] = [
  { value: "EUR/USD", label: "EUR/USD", description: "Euro vs US Dollar" },
  { value: "GBP/USD", label: "GBP/USD", description: "British Pound vs US Dollar" },
  { value: "USD/JPY", label: "USD/JPY", description: "US Dollar vs Japanese Yen" },
  { value: "USD/CHF", label: "USD/CHF", description: "US Dollar vs Swiss Franc" },
  { value: "AUD/USD", label: "AUD/USD", description: "Australian Dollar vs US Dollar" },
  { value: "USD/CAD", label: "USD/CAD", description: "US Dollar vs Canadian Dollar" },
  { value: "NZD/USD", label: "NZD/USD", description: "New Zealand Dollar vs US Dollar" },
  { value: "EUR/GBP", label: "EUR/GBP", description: "Euro vs British Pound" },
  { value: "EUR/JPY", label: "EUR/JPY", description: "Euro vs Japanese Yen" },
  { value: "GBP/JPY", label: "GBP/JPY", description: "British Pound vs Japanese Yen" },
  { value: "XAU/USD", label: "XAU/USD", description: "Gold vs US Dollar" },
  { value: "XAG/USD", label: "XAG/USD", description: "Silver vs US Dollar" },
  { value: "BTC/USD", label: "BTC/USD", description: "Bitcoin vs US Dollar" },
  { value: "ETH/USD", label: "ETH/USD", description: "Ethereum vs US Dollar" },
  { value: "DAX", label: "DAX", description: "DAX Index (Germany)" },
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