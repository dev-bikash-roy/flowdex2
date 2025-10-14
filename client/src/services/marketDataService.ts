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
   * Get chart data using the chart-data API endpoint
   */
  async getChartData(symbol: string, interval: string = '1h', limit: number = 100): Promise<CandleData[]> {
    try {
      console.log(`Fetching chart data for ${symbol} with interval ${interval} and limit ${limit}`);
      
      // Import the chart service to use the proper authentication
      const { fetchChartData } = await import('@/lib/chartService');
      const response = await fetchChartData(symbol, interval, limit);
      
      if (response && response.data && Array.isArray(response.data)) {
        // Convert the chart service format to CandleData format
        const candleData: CandleData[] = response.data.map((item: any) => ({
          time: new Date(item.time).getTime() / 1000, // Convert to timestamp
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: item.volume ? parseFloat(item.volume) : 0
        }));
        
        console.log(`Successfully converted ${candleData.length} candles`);
        return candleData;
      } else {
        throw new Error('Invalid response format from chart API');
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
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