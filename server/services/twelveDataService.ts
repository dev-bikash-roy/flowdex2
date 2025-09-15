import twelvedata from 'twelvedata';

// Validate that API key is provided
if (!process.env.TWELVEDATA_API_KEY) {
  throw new Error('TWELVEDATA_API_KEY environment variable is required');
}

// Initialize TwelveData client
const td = twelvedata({
  key: process.env.TWELVEDATA_API_KEY,
  timezone: 'UTC'
});

export interface TimeSeriesData {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface TimeSeriesResponse {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange: string;
    mic_code: string;
    type: string;
  };
  values: TimeSeriesData[];
  status: string;
}

/**
 * Fetch time series data from TwelveData API
 * @param symbol Trading pair symbol (e.g., 'EURUSD', 'BTCUSD')
 * @param interval Time interval (e.g., '1min', '5min', '1h', '1day')
 * @param outputsize Number of data points to return (default: 30)
 * @returns Promise with time series data
 */
export async function getTimeSeries(
  symbol: string,
  interval: string,
  outputsize: number = 30
): Promise<TimeSeriesResponse> {
  try {
    const response = await td.timeSeries({
      symbol,
      interval,
      outputsize,
      format: 'json'
    });
    
    return response as TimeSeriesResponse;
  } catch (error) {
    console.error('Error fetching time series data:', error);
    throw new Error(`Failed to fetch time series data: ${error}`);
  }
}

/**
 * Fetch real-time price data from TwelveData API
 * @param symbol Trading pair symbol
 * @returns Promise with real-time price data
 */
export async function getPrice(symbol: string): Promise<any> {
  try {
    const response = await td.price({
      symbol,
      format: 'json'
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching price data:', error);
    throw new Error(`Failed to fetch price data: ${error}`);
  }
}

/**
 * Fetch multiple symbols' real-time prices
 * @param symbols Array of trading pair symbols
 * @returns Promise with real-time price data for all symbols
 */
export async function getPriceMulti(symbols: string[]): Promise<any> {
  try {
    const response = await td.price({
      symbol: symbols.join(','),
      format: 'json'
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching multi-price data:', error);
    throw new Error(`Failed to fetch multi-price data: ${error}`);
  }
}