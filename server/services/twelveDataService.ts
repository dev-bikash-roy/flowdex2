import twelvedata from 'twelvedata';

// Initialize TwelveData client lazily
let td: any = null;
let initialized = false;

function initializeTwelveData() {
  if (initialized) return td;
  
  initialized = true;
  
  // Debug logging
  console.log('TWELVEDATA_API_KEY from env:', process.env.TWELVEDATA_API_KEY ? 'Present' : 'Missing');
  console.log('TWELVEDATA_API_KEY length:', process.env.TWELVEDATA_API_KEY?.length);

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
  
  return td;
}

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
 * Fetch time series data
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
  const client = initializeTwelveData();
  if (!client) {
    throw new Error('TwelveData service is not available - API key not provided or client failed to initialize');
  }

  try {
    console.log(`Fetching time series for ${symbol} with interval ${interval}`);
    
    const response = await client.timeSeries({
      symbol: symbol,
      interval: interval,
      outputsize: outputsize,
      format: 'JSON'
    });

    console.log('TwelveData API response received');
    
    if (response.status === 'error') {
      console.error('TwelveData API error:', response);
      return {
        status: 'error',
        message: response.message || 'Unknown error from TwelveData API',
        code: response.code
      };
    }

    return {
      meta: response.meta,
      values: response.values,
      status: 'ok'
    };
  } catch (error) {
    console.error('Error fetching time series data:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Fetch real-time price data
 * @param symbol Trading pair symbol
 * @returns Promise with real-time price data
 */
export async function getPrice(symbol: string): Promise<any> {
  const client = initializeTwelveData();
  if (!client) {
    throw new Error('TwelveData service is not available - API key not provided or client failed to initialize');
  }

  try {
    console.log(`Fetching price for ${symbol}`);
    const response = await client.price({
      symbol: symbol,
      format: 'JSON'
    });
    
    console.log('TwelveData price response received');
    return response;
  } catch (error) {
    console.error('Error fetching price data:', error);
    throw error;
  }
}

/**
 * Fetch multiple symbols' real-time prices
 * @param symbols Array of trading pair symbols
 * @returns Promise with real-time price data for all symbols
 */
export async function getPriceMulti(symbols: string[]): Promise<any> {
  const client = initializeTwelveData();
  if (!client) {
    throw new Error('TwelveData service is not available - API key not provided or client failed to initialize');
  }

  try {
    console.log(`Fetching prices for multiple symbols:`, symbols);
    const response = await client.price({
      symbol: symbols.join(','),
      format: 'JSON'
    });
    
    console.log('TwelveData multi-price response received');
    return response;
  } catch (error) {
    console.error('Error fetching multi-price data:', error);
    throw error;
  }
}
