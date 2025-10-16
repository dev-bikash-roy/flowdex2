import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  height?: string | number;
  width?: string | number;
  autosize?: boolean;
  hide_side_toolbar?: boolean;
  hide_top_toolbar?: boolean;
  style?: string;
  locale?: string;
  timezone?: string;
  backgroundColor?: string;
  gridColor?: string;
  allow_symbol_change?: boolean;
  save_image?: boolean;
  calendar?: boolean;
  hide_legend?: boolean;
  hide_volume?: boolean;
  studies?: string[];
  onSymbolChange?: (symbol: string) => void;
  onPriceClick?: (price: number, time: string) => void;
}

function TradingViewWidget({
  symbol = "EURUSD",
  interval = "1h",
  theme = "dark",
  height = "100%",
  width = "100%",
  autosize = true,
  hide_side_toolbar = true,
  hide_top_toolbar = false,
  style = "1",
  locale = "en",
  timezone = "Etc/UTC",
  backgroundColor = "#0F0F0F",
  gridColor = "rgba(242, 242, 242, 0.06)",
  allow_symbol_change = true,
  save_image = true,
  calendar = false,
  hide_legend = false,
  hide_volume = false,
  studies = [],
  onSymbolChange
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  
  // Import and use the symbol mapping utility
  const getTradingViewSymbol = (inputSymbol: string): string => {
    // Import dynamically to avoid SSR issues
    try {
      const { getTradingViewSymbol: getSymbol } = require('@/utils/tradingPairUtils');
      return getSymbol(inputSymbol);
    } catch (error) {
      console.warn('Could not load symbol mapping, using fallback');
      // Fallback mapping for common symbols
      const fallbackMap: Record<string, string> = {
        'EURUSD': 'FX:EURUSD',
        'GBPUSD': 'FX:GBPUSD',
        'USDJPY': 'FX:USDJPY',
        'XAUUSD': 'TVC:GOLD',
        'XAGUSD': 'TVC:SILVER',
        'GER40': 'TVC:DAX',
        'BTCUSD': 'BINANCE:BTCUSDT',
        'ETHUSD': 'BINANCE:ETHUSDT'
      };
      return fallbackMap[inputSymbol] || inputSymbol;
    }
  };

  // Convert our symbol format to TradingView format
  const convertSymbolToTradingView = (inputSymbol: string): string => {
    return getTradingViewSymbol(inputSymbol);
  };

  // Convert interval to TradingView format
  const convertInterval = (inputInterval: string): string => {
    const intervalMap: Record<string, string> = {
      '1min': '1',
      '5min': '5',
      '15min': '15',
      '30min': '30',
      '1h': '60',
      '4h': '240',
      '1day': 'D',
      '1week': 'W',
      '1month': 'M'
    };

    return intervalMap[inputInterval] || inputInterval;
  };

  useEffect(() => {
    if (!container.current) return;

    // Clear previous widget
    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    const config = {
      allow_symbol_change,
      calendar,
      details: false,
      hide_side_toolbar,
      hide_top_toolbar,
      hide_legend,
      hide_volume,
      hotlist: false,
      interval: convertInterval(interval),
      locale,
      save_image,
      style,
      symbol: convertSymbolToTradingView(symbol),
      theme,
      timezone,
      backgroundColor,
      gridColor,
      watchlist: [],
      withdateranges: false,
      compareSymbols: [],
      studies,
      autosize,
      width: autosize ? undefined : width,
      height: autosize ? undefined : height
    };

    script.innerHTML = JSON.stringify(config);
    
    // Add event listener for symbol changes if callback provided
    if (onSymbolChange) {
      (window as any).tradingViewSymbolChangeCallback = onSymbolChange;
    }

    container.current.appendChild(script);

    return () => {
      // Cleanup
      if ((window as any).tradingViewSymbolChangeCallback) {
        delete (window as any).tradingViewSymbolChangeCallback;
      }
    };
  }, [
    symbol, 
    interval, 
    theme, 
    height, 
    width, 
    autosize, 
    hide_side_toolbar, 
    hide_top_toolbar, 
    style, 
    locale, 
    timezone, 
    backgroundColor, 
    gridColor, 
    allow_symbol_change, 
    save_image, 
    calendar, 
    hide_legend, 
    hide_volume, 
    studies, 
    onSymbolChange
  ]);

  return (
    <div 
      className="tradingview-widget-container" 
      ref={container} 
      style={{ 
        height: autosize ? "100%" : height, 
        width: autosize ? "100%" : width,
        position: 'relative'
      }}
    >
      <div 
        className="tradingview-widget-container__widget" 
        style={{ 
          height: "calc(100% - 32px)", 
          width: "100%" 
        }}
      />
      <div 
        className="tradingview-widget-copyright"
        style={{
          fontSize: '11px',
          color: '#888',
          textAlign: 'center',
          padding: '4px 0'
        }}
      >
        <a 
          href={`https://www.tradingview.com/symbols/${convertSymbolToTradingView(symbol).replace(':', '-')}/`}
          rel="noopener nofollow" 
          target="_blank"
          style={{ color: '#2196F3', textDecoration: 'none' }}
        >
          <span>{symbol} chart</span>
        </a>
        <span style={{ color: '#888' }}> by TradingView</span>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);