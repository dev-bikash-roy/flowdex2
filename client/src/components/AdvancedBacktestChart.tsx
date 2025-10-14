import { useState, useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  SkipForward,
  BarChart3,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { fetchChartData } from "@/lib/chartService"; // Import the chart service
import TwelveDataChart from "@/components/TwelveDataChart"; // Import TwelveDataChart

interface TradingSession {
  id: string;
  name: string;
  pair: string;
  startingBalance: string;
  currentBalance: string;
  startDate: string;
  description?: string;
  isActive: boolean;
}

interface Trade {
  id: string;
  sessionId: string;
  userId: string;
  pair: string;
  type: string;
  executionType: string;
  entryPrice: string;
  exitPrice: string | null;
  quantity: string;
  stopLoss: string | null;
  takeProfit: string | null;
  profitLoss: string | null;
  status: string;
  entryTime: string;
  exitTime: string | null;
  notes: string | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Chart data format for lightweight-charts
interface ChartDataPoint {
  time: Date | number; // lightweight-charts accepts Date objects or Unix timestamps
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export default function AdvancedBacktestChart({ 
  session, 
  onExit 
}: { 
  session: TradingSession; 
  onExit: () => void; 
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(250); // milliseconds
  const [indicator, setIndicator] = useState<"none" | "ma" | "rsi">("none");
  const [sessionTrades, setSessionTrades] = useState<Trade[]>([]);
  const [activeTrade, setActiveTrade] = useState<Trade | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [useTwelveDataChart, setUseTwelveDataChart] = useState(true); // New state for chart type
  
  const { toast } = useToast();
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load chart data
  useEffect(() => {
    const loadChartData = async () => {
      try {
        // Fetch real data using the chart service
        const response = await fetchChartData(session.pair, '1h', 1000);
        if (response && response.data) {
          // Convert to CandleData format
          const candleData = response.data.map((item: any) => ({
            time: item.time,
            open: parseFloat(item.open),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            close: parseFloat(item.close),
            volume: item.volume ? parseFloat(item.volume) : undefined
          }));
          setChartData(candleData);
          setCurrentIndex(Math.min(100, candleData.length));
        } else {
          // Fallback to mock data if API fails
          console.warn("Failed to fetch real chart data, using mock data");
          const mockData = generateMockData(session.pair, 1000);
          setChartData(mockData);
          setCurrentIndex(Math.min(100, mockData.length));
        }
      } catch (error) {
        console.error("Error loading chart data:", error);
        // Fallback to mock data if API fails
        const mockData = generateMockData(session.pair, 1000);
        setChartData(mockData);
        setCurrentIndex(Math.min(100, mockData.length));
        toast({
          title: "Notice",
          description: "Using simulated data for chart display.",
          variant: "default",
        });
      }
    };

    loadChartData();
  }, [session.pair, toast]);

  // Load session trades
  useEffect(() => {
    const loadTrades = async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('session_id', session.id)
          .order('entry_time', { ascending: true });
        
        if (error) {
          throw new Error(error.message);
        }
        
        setSessionTrades(data || []);
      } catch (error) {
        console.error("Error loading trades:", error);
        toast({
          title: "Error",
          description: "Failed to load trades. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadTrades();
  }, [session.id, toast]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const initChart = () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }

      // Add null check
      const container = chartContainerRef.current;
      if (!container) return;

      // Use the createChart function from lightweight-charts v4.1.3
      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: '#131722' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: '#2a2e39' },
          horzLines: { color: '#2a2e39' },
        },
        timeScale: { timeVisible: true },
        width: container.clientWidth,
        height: container.clientHeight,
      });

      // Store the chart reference
      chartRef.current = chart;

      // Handle window resize
      const resizeObserver = new ResizeObserver(entries => {
        if (entries.length === 0 || !chartRef.current || !chartContainerRef.current) return;
        const { width, height } = entries[0].contentRect;
        chartRef.current.applyOptions({ width, height });
      });

      if (container) {
        resizeObserver.observe(container);
      }

      return () => {
        resizeObserver.disconnect();
        chart.remove();
      };
    };

    initChart();
  }, [chartData]);

  // Update chart when data or index changes
  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    // Create candlestick series if it doesn't exist
    if (!candleSeriesRef.current) {
      try {
        // For lightweight-charts v4.1.3, use the correct API
        const chartObj = chartRef.current;
        
        // @ts-ignore
        const candleSeries = chartObj.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });
        candleSeriesRef.current = candleSeries;
        console.log('Successfully created candlestick series with v4.1.3 API');
      } catch (error) {
        console.error("Error creating candlestick series:", error);
        return;
      }
    }

    // Convert chartData to the format expected by lightweight-charts
    const visibleData = chartData.slice(0, currentIndex).map(item => ({
      time: new Date(item.time).getTime() / 1000, // Convert to Unix timestamp in seconds
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));

    if (candleSeriesRef.current) {
      // @ts-ignore
      candleSeriesRef.current.setData(visibleData);
    }

    // Update indicators with original data (for calculations)
    updateIndicators(chartData.slice(0, currentIndex));

    // Set proper visible range for scrolling chart
    if (chartRef.current && currentIndex > 0) {
      const startIndex = Math.max(0, currentIndex - 50); // Show last 50 candles
      const endIndex = currentIndex;
      
      if (startIndex < endIndex) {
        // Use Unix timestamps for setVisibleRange
        const startTime = new Date(chartData[startIndex].time).getTime() / 1000;
        const endTime = new Date(chartData[endIndex - 1].time).getTime() / 1000;
        
        // @ts-ignore
        chartRef.current.timeScale().setVisibleRange({
          from: startTime,
          to: endTime
        } as any);
      }
    }
  }, [chartData, currentIndex, indicator]);

  const updateIndicators = (data: CandleData[]) => {
    // Clear existing indicators
    if (maSeriesRef.current && chartRef.current) {
      try {
        chartRef.current.removeSeries(maSeriesRef.current);
        maSeriesRef.current = null;
      } catch (error) {
        console.error("Error removing MA series:", error);
      }
    }
    
    if (rsiSeriesRef.current && chartRef.current) {
      try {
        chartRef.current.removeSeries(rsiSeriesRef.current);
        rsiSeriesRef.current = null;
      } catch (error) {
        console.error("Error removing RSI series:", error);
      }
    }

    if (indicator === "ma") {
      const maData = calculateMA(20, data);
      if (maData.length > 0 && chartRef.current) {
        try {
          // For lightweight-charts v4.1.3, use the correct API
          // @ts-ignore
          const maSeries = chartRef.current.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
          });
          maSeries.setData(maData);
          maSeriesRef.current = maSeries;
        } catch (error) {
          console.error("Error creating MA series:", error);
        }
      }
    } else if (indicator === "rsi") {
      const rsiData = calculateRSI(14, data);
      if (rsiData.length > 0 && chartRef.current) {
        // Adjust chart height for RSI pane
        if (chartContainerRef.current) {
          chartRef.current.applyOptions({ height: (chartContainerRef.current.clientHeight || 500) * 0.7 });
        }
        
        try {
          // For lightweight-charts v4.1.3, use the correct API
          // @ts-ignore
          const rsiSeries = chartRef.current.addLineSeries({
            color: '#FFC107',
            lineWidth: 2,
          });
          
          // Set the height of the new pane
          rsiSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
          });
          
          rsiSeries.setData(rsiData);
          rsiSeriesRef.current = rsiSeries;
        } catch (error) {
          console.error("Error creating RSI series:", error);
        }
      }
    }
  };

  const calculateMA = (period: number, data: CandleData[]) => {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1)
        .reduce((acc, val) => acc + val.close, 0);
      result.push({
        time: data[i].time,
        value: sum / period,
      });
    }
    return result;
  };

  const calculateRSI = (period: number, data: CandleData[]) => {
    if (data.length < period + 1) return [];

    const gains = [];
    const losses = [];

    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const result = [];
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    result.push({
      time: data[period].time,
      value: 100 - (100 / (1 + avgGain / avgLoss)),
    });

    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      
      const rs = avgGain / avgLoss;
      result.push({
        time: data[i + 1].time,
        value: 100 - (100 / (1 + rs)),
      });
    }

    return result;
  };

  const generateMockData = (pair: string, count: number): CandleData[] => {
    const data: CandleData[] = [];
    let price = 100;
    const now = new Date();

    for (let i = count; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(now.getHours() - i);
      
      // Random walk for price
      const change = (Math.random() - 0.5) * 2;
      price += change;
      
      // Ensure positive prices
      price = Math.max(price, 1);
      
      const open = price;
      const close = price + (Math.random() - 0.5);
      const high = Math.max(open, close) + Math.random();
      const low = Math.min(open, close) - Math.random();
      const volume = Math.floor(Math.random() * 10000) + 1000;
      
      data.push({
        time: time.toISOString(), // Keep as ISO string for consistency
        open: parseFloat(open.toFixed(5)),
        high: parseFloat(high.toFixed(5)),
        low: parseFloat(low.toFixed(5)),
        close: parseFloat(close.toFixed(5)),
        volume: volume
      });
    }
    
    return data;
  };

  const startPlayback = () => {
    if (chartData.length === 0) return;
    
    setIsPlaying(true);
    
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }
    
    playbackIntervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex >= chartData.length - 1) {
          setIsPlaying(false);
          if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
            playbackIntervalRef.current = null;
          }
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, playbackSpeed);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  };

  const nextCandle = () => {
    if (currentIndex < chartData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      pausePlayback();
      startPlayback();
    }
  };

  const handleOpenPosition = () => {
    if (chartData.length > 0 && currentIndex > 0) {
      const currentPrice = chartData[currentIndex - 1]?.close || 0;
      setShowTradeModal(true);
    }
  };

  const executeTrade = async (type: 'buy' | 'sell') => {
    try {
      const currentPrice = chartData[currentIndex - 1]?.close || 0;
      
      const tradeData = {
        session_id: session.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        pair: session.pair,
        type,
        execution_type: 'market',
        entry_price: currentPrice.toString(),
        quantity: "0.01", // Default quantity
        stop_loss: stopLoss || null,
        take_profit: takeProfit || null,
        status: 'open',
        entry_time: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('trades')
        .insert(tradeData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Trade Executed",
        description: `Successfully executed ${type} trade at ${currentPrice.toFixed(5)}`,
      });

      // Refresh trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('session_id', session.id)
        .order('entry_time', { ascending: true });

      if (!tradesError) {
        setSessionTrades(tradesData || []);
      }

      setShowTradeModal(false);
      setTakeProfit("");
      setStopLoss("");
    } catch (error) {
      console.error("Error executing trade:", error);
      toast({
        title: "Error",
        description: "Failed to execute trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  const currentBalance = parseFloat(session.currentBalance);
  const startingBalance = parseFloat(session.startingBalance);
  const pnl = currentBalance - startingBalance;

  // Function to open fullscreen view
  const openFullscreen = () => {
    window.open(`/fullscreen-chart/${session.id}`, '_blank');
  };

  return (
    <div id="app-container" className="w-full h-screen flex flex-col bg-[#131722] text-[#d1d4dc]">
      {/* Top Controls */}
      <div className="top-controls flex-shrink-0 p-2.5 bg-[#1e222d] flex items-center justify-between gap-4 border-b border-[#2a2e39]">
        <div className="control-group flex items-center gap-2.5">
          <div id="ticker-display" className="ticker-display text-base font-medium pr-4 border-r border-[#2a2e39]">
            {session.pair}
          </div>
          <Button 
            id="play-button" 
            onClick={startPlayback}
            disabled={isPlaying || currentIndex >= chartData.length - 1}
            className="bg-[#2962FF] hover:bg-[#1e53e5] text-white border border-[#4e525e] rounded py-2 px-3 text-sm"
          >
            <Play className="w-4 h-4" />
          </Button>
          <Button 
            id="pause-button" 
            onClick={pausePlayback}
            disabled={!isPlaying}
            className="bg-[#2962FF] hover:bg-[#1e53e5] text-white border border-[#4e525e] rounded py-2 px-3 text-sm"
          >
            <Pause className="w-4 h-4" />
          </Button>
          <Button 
            id="next-candle-button" 
            onClick={nextCandle}
            disabled={currentIndex >= chartData.length - 1}
            className="bg-[#2962FF] hover:bg-[#1e53e5] text-white border border-[#4e525e] rounded py-2 px-3 text-sm"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <label htmlFor="speed-control" className="text-sm">Speed:</label>
          <select 
            id="speed-control"
            value={playbackSpeed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="bg-[#2962FF] text-white border border-[#4e525e] rounded py-2 px-3 text-sm"
          >
            <option value="500">1x</option>
            <option value="250">2x</option>
            <option value="100">5x</option>
            <option value="50">10x</option>
          </select>
        </div>
        <div className="control-group flex items-center gap-2.5">
          <label htmlFor="indicator-select" className="text-sm">Indicator:</label>
          <select 
            id="indicator-select"
            value={indicator}
            onChange={(e) => setIndicator(e.target.value as "none" | "ma" | "rsi")}
            className="bg-[#2962FF] text-white border border-[#4e525e] rounded py-2 px-3 text-sm"
          >
            <option value="none">None</option>
            <option value="ma">Moving Average</option>
            <option value="rsi">RSI</option>
          </select>
          <Button 
            id="open-position-button" 
            onClick={handleOpenPosition}
            className="bg-[#2962FF] hover:bg-[#1e53e5] text-white border border-[#4e525e] rounded py-2 px-3 text-sm"
          >
            Open Position
          </Button>
          <Button 
            id="chart-type-toggle" 
            onClick={() => setUseTwelveDataChart(!useTwelveDataChart)}
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white border border-[#4e525e] rounded py-2 px-3 text-sm"
          >
            {useTwelveDataChart ? "Standard Chart" : "TwelveData Chart"}
          </Button>
          <Button 
            id="fullscreen-button" 
            onClick={openFullscreen}
            className="bg-[#2962FF] hover:bg-[#1e53e5] text-white border border-[#4e525e] rounded py-2 px-3 text-sm"
          >
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Chart Container */}
      {useTwelveDataChart ? (
        <div className="flex-grow relative">
          <TwelveDataChart
            symbol={session.pair}
            interval="1h"
            height={500}
            onPriceClick={(price, time) => {
              console.log(`Price clicked: ${price} at ${time}`);
              // You can add trade execution logic here
            }}
          />
        </div>
      ) : (
        <div 
          id="chart-container" 
          ref={chartContainerRef} 
          className="flex-grow relative"
        />
      )}

      {/* Bottom Bar */}
      <div className="bottom-bar flex-shrink-0 p-1.5 bg-[#1e222d] flex justify-between items-center border-t border-[#2a2e39]">
        <div className="logo-container">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 text-white mr-2" />
            <span className="text-white font-medium">FlowdeX</span>
          </div>
        </div>
        <div className="bottom-bar-info flex">
          <span className="mr-5 text-sm">
            Balance: <span id="balance-display" className="font-medium">${currentBalance.toFixed(2)}</span>
          </span>
          <span className="text-sm">
            Open Profit/Loss: <span id="pnl-display" className={`font-medium ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
            </span>
          </span>
        </div>
        <Button 
          id="exit-session-button" 
          onClick={onExit}
          className="bg-red-500 hover:bg-red-600 text-white border border-[#4e525e] rounded py-1.5 px-3 text-sm"
        >
          Exit Session
        </Button>
      </div>

      {/* Trade Modal */}
      {showTradeModal && (
        <div 
          id="trade-modal-overlay" 
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
        >
          <div className="trade-modal bg-[#1e222d] p-5 rounded-lg w-[350px] shadow-lg">
            <div className="trade-modal-header flex justify-between items-center mb-5">
              <h2 className="text-lg m-0">Place a Trade</h2>
              <button 
                id="close-modal-button" 
                onClick={() => setShowTradeModal(false)}
                className="bg-none border-none text-xl text-[#d1d4dc] cursor-pointer text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="input-group mb-4">
              <label htmlFor="entry-price" className="block mb-1 text-xs text-[#b2b5be]">Entry Price</label>
              <input 
                type="number" 
                id="entry-price" 
                readOnly 
                value={chartData[currentIndex - 1]?.close.toFixed(5) || ''}
                className="w-full p-2 bg-[#131722] border border-[#2a2e39] rounded text-[#d1d4dc] box-border"
              />
            </div>
            <div className="input-row flex gap-2.5">
              <div className="input-group flex-1">
                <label htmlFor="take-profit" className="block mb-1 text-xs text-[#b2b5be]">Take Profit</label>
                <input 
                  type="number" 
                  id="take-profit" 
                  step="0.0001" 
                  placeholder="e.g., 0.6850" 
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full p-2 bg-[#131722] border border-[#2a2e39] rounded text-[#d1d4dc] box-border"
                />
              </div>
              <div className="input-group flex-1">
                <label htmlFor="stop-loss" className="block mb-1 text-xs text-[#b2b5be]">Stop Loss</label>
                <input 
                  type="number" 
                  id="stop-loss" 
                  step="0.0001" 
                  placeholder="e.g., 0.6750" 
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full p-2 bg-[#131722] border border-[#2a2e39] rounded text-[#d1d4dc] box-border"
                />
              </div>
            </div>
            <div className="trade-modal-actions flex justify-end gap-2.5 mt-5">
              <Button 
                id="buy-button" 
                onClick={() => executeTrade('buy')}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Buy
              </Button>
              <Button 
                id="sell-button" 
                onClick={() => executeTrade('sell')}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Sell
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}