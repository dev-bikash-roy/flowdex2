import { apiRequest } from './queryClient';

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
    const response = await apiRequest(
      'GET',
      `/api/chart-data?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw new Error(`Failed to fetch chart data: ${error}`);
  }
}

/**
 * Fetch real-time price for a specific trading pair
 * @param symbol Trading pair symbol
 * @returns Promise with current price data
 */
export async function fetchCurrentPrice(symbol: string): Promise<any> {
  try {
    const response = await apiRequest(
      'GET',
      `/api/price?symbol=${symbol}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current price:', error);
    throw new Error(`Failed to fetch current price: ${error}`);
  }
}