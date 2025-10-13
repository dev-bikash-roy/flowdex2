import React, { useEffect, useRef, memo, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { marketDataService } from '@/services/marketDataService';
import { useToast } from '@/hooks/use-toast';

interface TwelveDataChartProps {
  symbol: string;
  interval?: string;
  height?: number;
  onPriceClick?: (price: number, time: string) => void;
}

interface ChartData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

function TwelveDataChart({
  symbol,
  interval = '1h',
  height = 500,
  onPriceClick
}: TwelveDataChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: '#0F0F0F' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: 'rgba(242, 242, 242, 0.06)' },
        horzLines: { color: 'rgba(242, 242, 242, 0.06)' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.4)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.4)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Handle clicks
    if (onPriceClick) {
      chart.subscribeClick((param) => {
        if (param.time && param.point) {
          const price = candlestickSeries.coordinateToPrice(param.point.y);
          if (price !== null) {
            onPriceClick(price, param.time.toString());
          }
        }
      });
    }

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [height, onPriceClick]);

  // Load data when symbol or interval changes
  useEffect(() => {
    const loadData = async () => {
      if (!seriesRef.current || !symbol) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log(`Loading chart data for ${symbol} with interval ${interval}`);
        
        // Get data from Twelve Data API
        const data = await marketDataService.getChartData(symbol, interval, 1000);
        
        if (!data || data.length === 0) {
          throw new Error('No data received from API');
        }

        // Convert data to lightweight-charts format
        const chartData: ChartData[] = data.map(candle => ({
          time: candle.time as Time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume
        }));

        // Sort by time to ensure proper order
        chartData.sort((a, b) => (a.time as number) - (b.time as number));

        console.log(`Loaded ${chartData.length} candles for ${symbol}`);
        
        // Set data to series
        seriesRef.current.setData(chartData);

        // Fit content to show all data
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }

      } catch (error) {
        console.error('Error loading chart data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load chart data';
        setError(errorMessage);
        
        toast({
          title: "Chart Error",
          description: `Failed to load data for ${symbol}: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [symbol, interval, toast]);

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-900 text-white rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ Chart Error</div>
          <div className="text-sm text-gray-400">{error}</div>
          <div className="text-xs text-gray-500 mt-2">
            Symbol: {symbol} | Interval: {interval}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10 rounded-lg"
        >
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
            <div className="text-sm">Loading {symbol} data...</div>
          </div>
        </div>
      )}
      
      <div 
        ref={chartContainerRef} 
        className="rounded-lg overflow-hidden"
        style={{ height }}
      />
      
      {/* Chart info */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {symbol} • {interval} • Twelve Data
      </div>
    </div>
  );
}

export default memo(TwelveDataChart);