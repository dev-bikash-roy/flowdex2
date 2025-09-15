import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface TradingViewChartProps {
  data: ChartData[];
  pair: string;
  width?: number;
  height?: number;
  onTrade?: (price: number, time: string) => void;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  data,
  pair,
  width = 800,
  height = 500,
  onTrade,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [isBuyMode, setIsBuyMode] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.7)',
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.1)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.1)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(197, 203, 206, 0.2)',
      },
      crosshair: {
        mode: 0, // Normal mode
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.2)',
      },
    });

    chartRef.current = chart;

    // Create candlestick series
    const candlestickSeries: any = (chart as any).addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    seriesRef.current = candlestickSeries;

    // Format data for lightweight-charts
    const formattedData = data.map(d => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(formattedData);

    // Add click handler for trading
    chart.subscribeClick((param: any) => {
      if (!onTrade || !seriesRef.current) return;
      
      const seriesData = param.seriesData.get(seriesRef.current);
      if (seriesData && typeof seriesData === 'object' && 'close' in seriesData) {
        const price = (seriesData as { close: number }).close;
        const time = param.time as string;
        onTrade(price, time);
      }
    });

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, width, height, onTrade]);

  const handleTrade = () => {
    if (!seriesRef.current || !chartRef.current) return;
    
    // Get the last price from the chart
    const seriesData = seriesRef.current.data();
    if (seriesData.length > 0) {
      const lastCandle = seriesData[seriesData.length - 1];
      if (typeof lastCandle === 'object' && 'close' in lastCandle) {
        const price = (lastCandle as { close: number }).close;
        const time = new Date().toISOString();
        onTrade?.(price, time);
      }
    }
  };

  return (
    <div className="relative">
      <div className="tradingview-chart-container" ref={chartContainerRef} />
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          className={`px-3 py-1 rounded text-sm font-medium ${
            isBuyMode 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setIsBuyMode(true)}
        >
          Buy
        </button>
        <button
          className={`px-3 py-1 rounded text-sm font-medium ${
            !isBuyMode 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setIsBuyMode(false)}
        >
          Sell
        </button>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
          onClick={handleTrade}
        >
          Trade at Market
        </button>
      </div>
    </div>
  );
};

export default TradingViewChart;