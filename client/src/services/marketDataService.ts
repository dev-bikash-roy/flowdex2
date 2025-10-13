// Market Data Service for interacting with Twelve Data API

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataResponse {
  success: boolean;
  data?: {
    symbol: string;
    interval: string;
    candles: CandleData[];
    meta?: any;
  };
  error?: string;
}

export interface InstrumentInfo {
  symbol: string;
  type: 'forex' | 'index';
  exchange: string;
}

export interface InstrumentsResponse {
  success: boolean;
  data?: Record<string, InstrumentInfo>;
  error?: string;
}

class MarketDataService {
  private baseUrl = '/api/market-data';

  /**
   * Get list of supported instruments
   */
  async getSupportedInstruments(): Promise<InstrumentsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/instruments`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching instruments:', error);
      return {
        success: false,
        error: 'Failed to fetch instruments'
      };
    }
  }

  /**
   * Get historical candle data for a symbol
   */
  async getCandles(
    symbol: string,
    interval: string = '1h',
    outputsize: number = 1000,
    startDate?: string,
    endDate?: string
  ): Promise<MarketDataResponse> {
    try {
      const params = new URLSearchParams({
        interval,
        outputsize: outputsize.toString()
      });

      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`${this.baseUrl}/candles/${symbol}?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching candles:', error);
      return {
        success: false,
        error: 'Failed to fetch candle data'
      };
    }
  }

  /**
   * Get real-time quote for a symbol
   */
  async getQuote(symbol: string) {
    try {
      const response = await fetch(`${this.baseUrl}/quote/${symbol}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching quote:', error);
      return {
        success: false,
        error: 'Failed to fetch quote'
      };
    }
  }

  /**
   * Get historical data for backtesting
   */
  async getBacktestData(
    symbol: string,
    interval: string = '1h',
    startDate: string,
    endDate: string
  ): Promise<MarketDataResponse> {
    try {
      const params = new URLSearchParams({
        interval,
        start_date: startDate,
        end_date: endDate
      });

      const response = await fetch(`${this.baseUrl}/backtest-data/${symbol}?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching backtest data:', error);
      return {
        success: false,
        error: 'Failed to fetch backtest data'
      };
    }
  }

  /**
   * Get chart data using Twelve Data API
   */
  async getChartData(symbol: string, interval: string = '1h', limit: number = 100): Promise<CandleData[]> {
    try {
      console.log(`Fetching chart data for ${symbol} with interval ${interval} and limit ${limit}`);
      
      // Use the new market data API endpoint
      const params = new URLSearchParams({
        interval,
        outputsize: limit.toString()
      });

      const response = await fetch(`${this.baseUrl}/candles/${symbol}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data?.candles) {
        console.log(`Successfully fetched ${data.data.candles.length} candles from Twelve Data`);
        return data.data.candles;
      } else {
        throw new Error(data.error || 'Invalid response format from Twelve Data API');
      }
    } catch (error) {
      console.error('Error fetching chart data from Twelve Data:', error);
      
      // Fallback to legacy endpoint if available
      try {
        console.log('Trying legacy chart-data endpoint...');
        const params = new URLSearchParams({
          symbol,
          interval,
          limit: limit.toString()
        });

        const response = await fetch(`/api/chart-data?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Legacy API HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle legacy format
        if (Array.isArray(data)) {
          return data;
        } else if (data.data && Array.isArray(data.data)) {
          return data.data;
        } else {
          throw new Error('Invalid legacy response format');
        }
      } catch (legacyError) {
        console.error('Legacy endpoint also failed:', legacyError);
        throw error; // Throw original error
      }
    }
  }

  /**
   * Format date for API requests (YYYY-MM-DD format)
   */
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get date range for backtesting (e.g., last 30 days)
   */
  getDateRange(days: number = 30): { startDate: string; endDate: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return {
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate)
    };
  }
}

export const marketDataService = new MarketDataService();