import { supabase } from './supabaseClient';

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartDataResponse {
  data: ChartDataPoint[];
  symbol: string;
  interval: string;
}

/**
 * Generate mock chart data for testing
 * @param symbol Trading pair symbol
 * @param interval Time interval
 * @param count Number of data points
 * @returns Mock chart data
 */
function generateMockChartData(symbol: string, interval: string, count: number = 100): ChartDataResponse {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  
  // Generate mock price data
  let basePrice = 100;
  for (let i = count; i >= 0; i--) {
    const time = new Date(now);
    
    // Adjust time based on interval
    switch (interval) {
      case '1min':
        time.setMinutes(now.getMinutes() - i);
        break;
      case '5min':
        time.setMinutes(now.getMinutes() - i * 5);
        break;
      case '15min':
        time.setMinutes(now.getMinutes() - i * 15);
        break;
      case '30min':
        time.setMinutes(now.getMinutes() - i * 30);
        break;
      case '1h':
        time.setHours(now.getHours() - i);
        break;
      case '4h':
        time.setHours(now.getHours() - i * 4);
        break;
      case '1day':
        time.setDate(now.getDate() - i);
        break;
      default:
        time.setHours(now.getHours() - i);
    }
    
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
}

/**
 * Fetch chart data for a specific trading pair and interval
 * @param symbol Trading pair symbol (e.g., 'EURUSD')
 * @param interval Time interval (e.g., '1min', '5min', '1h', '1day')
 * @param limit Number of data points to fetch
 * @returns Promise with chart data
 */
export async function fetchChartData(
  symbol: string,
  interval: string,
  limit: number = 100
): Promise<ChartDataResponse> {
  try {
    console.log(`Fetching chart data for ${symbol} with interval ${interval}`);
    
    // Try to fetch from the backend API first
    const response = await fetch(`/api/chart-data?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}:`, errorText);
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Received chart data with ${data.data?.length || 0} points`);
    
    // Validate the response structure
    if (!data || !Array.isArray(data.data)) {
      console.warn('Invalid data structure received from API, using mock data');
      return generateMockChartData(symbol, interval, limit);
    }
    
    // Validate that we have data points
    if (data.data.length === 0) {
      console.warn('No data points received from API, using mock data');
      return generateMockChartData(symbol, interval, limit);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching chart data, using mock data:', error);
    // Fallback to mock data
    return generateMockChartData(symbol, interval, limit);
  }
}

/**
 * Fetch real-time price for a specific trading pair
 * @param symbol Trading pair symbol
 * @returns Promise with current price data
 */
export async function fetchCurrentPrice(symbol: string): Promise<any> {
  try {
    // Try to fetch from the backend API first
    const response = await fetch(`/api/price?symbol=${encodeURIComponent(symbol)}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current price, using mock data:', error);
    // Fallback to mock data
    return {
      symbol,
      price: (100 + (Math.random() - 0.5) * 10).toFixed(5),
      timestamp: new Date().toISOString()
    };
  }
}