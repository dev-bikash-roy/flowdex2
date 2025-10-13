import twelvedata from 'twelvedata';

// Debug logging
console.log('TWELVEDATA_API_KEY from env:', process.env.TWELVEDATA_API_KEY ? 'Present' : 'Missing');
console.log('TWELVEDATA_API_KEY length:', process.env.TWELVEDATA_API_KEY?.length);

// Initialize TwelveData client only if API key is provided
let td: any = null;
if (process.env.TWELVEDATA_API_KEY) {
  try {
    console.log('Initializing TwelveData client with key:', process.env.TWELVEDATA_API_KEY.substring(0, 8) + '...');
    td = twelvedata({
      key: process.env.TWELVEDATA_API_KEY,
      timezone: 'UTC'
    });
    console.log('TwelveData client initialized successfully');
  } catch (error) {
    console.error('Error initializing TwelveData client:', error);
    td = null;
  }
} else {
  console.log('TWELVEDATA_API_KEY not provided, TwelveData service will not be available');
}

// Completely disable TwelveData service since we're not using it
console.log('TwelveData service is disabled - not importing twelvedata package');

// Export dummy interfaces and functions
export interface TimeSeriesData {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface TimeSeriesResponse {
  meta?: {
    symbol: string;
    interval: string;
    currency: string;
    exchange: string;
    mic_code: string;
    type: string;
  };
  values?: TimeSeriesData[];
  status: string;
  message?: string;
  code?: string;
}

/**
 * Fetch time series data - dummy implementation since TwelveData is disabled
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
  console.log('TwelveData service is disabled - getTimeSeries not available');
  throw new Error('TwelveData service is disabled - API key not provided or client failed to initialize');
}

/**
 * Fetch real-time price data - dummy implementation since TwelveData is disabled
 * @param symbol Trading pair symbol
 * @returns Promise with real-time price data
 */
export async function getPrice(symbol: string): Promise<any> {
  console.log('TwelveData service is disabled - getPrice not available');
  throw new Error('TwelveData service is disabled - API key not provided or client failed to initialize');
}

/**
 * Fetch multiple symbols' real-time prices - dummy implementation since TwelveData is disabled
 * @param symbols Array of trading pair symbols
 * @returns Promise with real-time price data for all symbols
 */
export async function getPriceMulti(symbols: string[]): Promise<any> {
  console.log('TwelveData service is disabled - getPriceMulti not available');
  throw new Error('TwelveData service is disabled - API key not provided or client failed to initialize');
}
