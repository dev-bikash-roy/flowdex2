import { config } from 'dotenv';
config();

const TWELVE_DATA_API_KEY = process.env.TWELVEDATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

export interface CandleData {
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
    exchange_timezone: string;
    exchange: string;
    mic_code: string;
    type: string;
  };
  values: CandleData[];
  status: string;
}

// Supported instruments for backtesting
export const SUPPORTED_INSTRUMENTS = {
  // Major FX Pairs (using Twelve Data format)
  'EURUSD': { symbol: 'EUR/USD', twelveDataSymbol: 'EUR/USD', type: 'forex', exchange: 'FX' },
  'GBPUSD': { symbol: 'GBP/USD', twelveDataSymbol: 'GBP/USD', type: 'forex', exchange: 'FX' },
  'USDJPY': { symbol: 'USD/JPY', twelveDataSymbol: 'USD/JPY', type: 'forex', exchange: 'FX' },
  'USDCHF': { symbol: 'USD/CHF', twelveDataSymbol: 'USD/CHF', type: 'forex', exchange: 'FX' },
  'AUDUSD': { symbol: 'AUD/USD', twelveDataSymbol: 'AUD/USD', type: 'forex', exchange: 'FX' },
  'USDCAD': { symbol: 'USD/CAD', twelveDataSymbol: 'USD/CAD', type: 'forex', exchange: 'FX' },
  'NZDUSD': { symbol: 'NZD/USD', twelveDataSymbol: 'NZD/USD', type: 'forex', exchange: 'FX' },
  'EURGBP': { symbol: 'EUR/GBP', twelveDataSymbol: 'EUR/GBP', type: 'forex', exchange: 'FX' },
  'EURJPY': { symbol: 'EUR/JPY', twelveDataSymbol: 'EUR/JPY', type: 'forex', exchange: 'FX' },
  'GBPJPY': { symbol: 'GBP/JPY', twelveDataSymbol: 'GBP/JPY', type: 'forex', exchange: 'FX' },
  
  // German DAX Index
  'GER40': { symbol: 'DAX', twelveDataSymbol: 'DAX', type: 'index', exchange: 'XETRA' },
  'DAX': { symbol: 'DAX', twelveDataSymbol: 'DAX', type: 'index', exchange: 'XETRA' }
};

export class TwelveDataService {
  private apiKey: string;

  constructor() {
    console.log('Initializing TwelveDataService...');
    console.log('TWELVE_DATA_API_KEY exists:', !!TWELVE_DATA_API_KEY);
    console.log('TWELVE_DATA_API_KEY length:', TWELVE_DATA_API_KEY?.length);
    
    if (!TWELVE_DATA_API_KEY) {
      throw new Error('TWELVEDATA_API_KEY is not configured');
    }
    this.apiKey = TWELVE_DATA_API_KEY;
    console.log('TwelveDataService initialized successfully');
  }

  /**
   * Convert our internal symbol format to Twelve Data format
   */
  private mapSymbolToTwelveData(symbol: string): string {
    console.log(`Mapping symbol: ${symbol}`);
    
    // Direct mapping from our supported instruments
    const instrument = SUPPORTED_INSTRUMENTS[symbol as keyof typeof SUPPORTED_INSTRUMENTS];
    if (instrument && instrument.twelveDataSymbol) {
      console.log(`Found direct mapping: ${symbol} -> ${instrument.twelveDataSymbol}`);
      return instrument.twelveDataSymbol;
    }
    
    // If no mapping found, try to convert common formats
    if (symbol.length === 6 && !symbol.includes('/')) {
      // Convert EURUSD to EUR/USD
      const converted = `${symbol.slice(0, 3)}/${symbol.slice(3)}`;
      console.log(`Auto-converted: ${symbol} -> ${converted}`);
      return converted;
    }
    
    // Handle already formatted symbols
    if (symbol.includes('/')) {
      console.log(`Symbol already formatted: ${symbol}`);
      return symbol;
    }
    
    console.log(`No conversion needed: ${symbol}`);
    return symbol;
  }

  /**
   * Get time series data for a symbol
   */
  async getTimeSeries(
    symbol: string,
    interval: string = '1h',
    outputsize: number = 5000,
    startDate?: string,
    endDate?: string
  ): Promise<TimeSeriesResponse> {
    try {
      const twelveDataSymbol = this.mapSymbolToTwelveData(symbol);
      console.log(`Mapping symbol: ${symbol} -> ${twelveDataSymbol}`);
      
      const params = new URLSearchParams({
        symbol: twelveDataSymbol,
        interval: interval,
        outputsize: outputsize.toString(),
        apikey: this.apiKey,
        format: 'JSON',
        order: 'ASC' // Oldest first for backtesting
      });

      if (startDate) {
        params.append('start_date', startDate);
      }
      if (endDate) {
        params.append('end_date', endDate);
      }

      const url = `${BASE_URL}/time_series?${params.toString()}`;
      console.log('Fetching from Twelve Data:', url.replace(this.apiKey, 'API_KEY_HIDDEN'));

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Twelve Data API HTTP error: ${response.status} ${response.statusText}`);
        console.error(`Error response body: ${errorText}`);
        throw new Error(`Twelve Data API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Twelve Data API response:', JSON.stringify(data, null, 2));

      if (data.status === 'error') {
        console.error(`Twelve Data API returned error: ${data.message}`);
        throw new Error(`Twelve Data error: ${data.message || 'Unknown error'}`);
      }

      if (!data.values || !Array.isArray(data.values)) {
        console.error('Invalid response structure from Twelve Data:', data);
        throw new Error('Invalid response structure: missing or invalid values array');
      }

      console.log(`Successfully fetched ${data.values.length} data points from Twelve Data`);
      return data;
    } catch (error) {
      console.error('Error fetching time series data:', error);
      throw error;
    }
  }

  /**
   * Get real-time quote for a symbol
   */
  async getQuote(symbol: string) {
    try {
      const twelveDataSymbol = this.mapSymbolToTwelveData(symbol);
      console.log(`Getting quote for: ${symbol} -> ${twelveDataSymbol}`);
      
      const params = new URLSearchParams({
        symbol: twelveDataSymbol,
        apikey: this.apiKey
      });

      const url = `${BASE_URL}/quote?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Twelve Data API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(`Twelve Data error: ${data.message || 'Unknown error'}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching quote data:', error);
      throw error;
    }
  }

  /**
   * Get available symbols
   */
  getSupportedInstruments() {
    return SUPPORTED_INSTRUMENTS;
  }

  /**
   * Convert Twelve Data candles to our internal format
   */
  formatCandlesForChart(data: TimeSeriesResponse) {
    if (!data.values || !Array.isArray(data.values)) {
      return [];
    }

    return data.values.map(candle => ({
      time: Math.floor(new Date(candle.datetime).getTime() / 1000), // Convert to Unix timestamp
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      volume: parseFloat(candle.volume || '0')
    }));
  }

  /**
   * Get historical data for backtesting
   */
  async getHistoricalDataForBacktest(
    symbol: string,
    interval: string = '1h',
    startDate: string,
    endDate: string
  ) {
    try {
      const data = await this.getTimeSeries(symbol, interval, 5000, startDate, endDate);
      return this.formatCandlesForChart(data);
    } catch (error) {
      console.error('Error getting historical data for backtest:', error);
      throw error;
    }
  }
}

export const twelveDataService = new TwelveDataService();