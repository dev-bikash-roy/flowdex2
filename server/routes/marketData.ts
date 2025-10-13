import { Router } from 'express';
import { twelveDataService } from '../services/twelveDataService.js';

const router = Router();

/**
 * GET /api/market-data/instruments
 * Get list of supported instruments
 */
router.get('/instruments', async (req, res) => {
  try {
    const instruments = twelveDataService.getSupportedInstruments();
    res.json({
      success: true,
      data: instruments
    });
  } catch (error: any) {
    console.error('Error getting instruments:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get instruments'
    });
  }
});

/**
 * GET /api/market-data/candles/:symbol
 * Get historical candle data for a symbol
 */
router.get('/candles/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { 
      interval = '1h', 
      outputsize = '1000',
      start_date,
      end_date 
    } = req.query;

    console.log('Fetching candles for:', symbol, { interval, outputsize, start_date, end_date });

    const data = await twelveDataService.getTimeSeries(
      symbol,
      interval as string,
      parseInt(outputsize as string),
      start_date as string,
      end_date as string
    );

    const formattedCandles = twelveDataService.formatCandlesForChart(data);

    res.json({
      success: true,
      data: {
        symbol: symbol,
        interval: interval,
        candles: formattedCandles,
        meta: data.meta
      }
    });
  } catch (error: any) {
    console.error('Error fetching candles:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch candle data'
    });
  }
});

/**
 * GET /api/market-data/quote/:symbol
 * Get real-time quote for a symbol
 */
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const quote = await twelveDataService.getQuote(symbol);

    res.json({
      success: true,
      data: quote
    });
  } catch (error: any) {
    console.error('Error fetching quote:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch quote'
    });
  }
});

/**
 * GET /api/market-data/backtest-data/:symbol
 * Get historical data specifically formatted for backtesting
 */
router.get('/backtest-data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { 
      interval = '1h',
      start_date,
      end_date 
    } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date and end_date are required for backtesting'
      });
    }

    console.log('Fetching backtest data for:', symbol, { interval, start_date, end_date });

    const candles = await twelveDataService.getHistoricalDataForBacktest(
      symbol,
      interval as string,
      start_date as string,
      end_date as string
    );

    res.json({
      success: true,
      data: {
        symbol: symbol,
        interval: interval,
        start_date: start_date,
        end_date: end_date,
        candles: candles,
        count: candles.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching backtest data:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch backtest data'
    });
  }
});

export default router;