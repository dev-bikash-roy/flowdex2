import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Rewind, 
  FastForward,
  Square,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign
} from 'lucide-react';
import { marketDataService, CandleData } from '@/services/marketDataService';
import { getTwelveDataSymbol } from '@/utils/tradingPairUtils';

interface BacktestEngineProps {
  symbol: string;
  startingBalance: number;
  onBalanceChange?: (balance: number) => void;
  onTradeExecuted?: (trade: any) => void;
}

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: number;
  pnl?: number;
  status: 'open' | 'closed';
}

interface BacktestState {
  isPlaying: boolean;
  currentIndex: number;
  speed: number; // 1x, 2x, 5x, 10x
  balance: number;
  trades: Trade[];
  currentCandle: CandleData | null;
  historicalData: CandleData[];
  startTime: number;
  endTime: number;
}

const SPEED_OPTIONS = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 5, label: '5x' },
  { value: 10, label: '10x' },
];

export default function BacktestEngine({ 
  symbol, 
  startingBalance, 
  onBalanceChange,
  onTradeExecuted 
}: BacktestEngineProps) {
  const [state, setState] = useState<BacktestState>({
    isPlaying: false,
    currentIndex: 0,
    speed: 1,
    balance: startingBalance,
    trades: [],
    currentCandle: null,
    historicalData: [],
    startTime: 0,
    endTime: 0,
  });

  const [loading, setLoading] = useState(false);
  const [tradeAmount, setTradeAmount] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load historical data
  const loadHistoricalData = useCallback(async () => {
    setLoading(true);
    try {
      const twelveDataSymbol = getTwelveDataSymbol(symbol);
      const data = await marketDataService.getChartData(twelveDataSymbol, '1h', 1000);
      
      if (data && data.length > 0) {
        const sortedData = data.sort((a, b) => a.time - b.time);
        setState(prev => ({
          ...prev,
          historicalData: sortedData,
          startTime: sortedData[0].time,
          endTime: sortedData[sortedData.length - 1].time,
          currentCandle: sortedData[0],
          currentIndex: 0,
        }));
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // Initialize data on mount
  useEffect(() => {
    loadHistoricalData();
  }, [loadHistoricalData]);

  // Playback control
  const startPlayback = useCallback(() => {
    if (intervalRef.current) return;

    const baseInterval = 1000; // 1 second base
    const interval = baseInterval / state.speed;

    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.currentIndex >= prev.historicalData.length - 1) {
          // End of data reached
          return { ...prev, isPlaying: false };
        }

        const nextIndex = prev.currentIndex + 1;
        const nextCandle = prev.historicalData[nextIndex];

        return {
          ...prev,
          currentIndex: nextIndex,
          currentCandle: nextCandle,
        };
      });
    }, interval);

    setState(prev => ({ ...prev, isPlaying: true }));
  }, [state.speed]);

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resetPlayback = useCallback(() => {
    stopPlayback();
    setState(prev => ({
      ...prev,
      currentIndex: 0,
      currentCandle: prev.historicalData[0] || null,
      balance: startingBalance,
      trades: [],
    }));
  }, [startingBalance, stopPlayback]);

  const stepForward = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex >= prev.historicalData.length - 1) return prev;
      
      const nextIndex = prev.currentIndex + 1;
      return {
        ...prev,
        currentIndex: nextIndex,
        currentCandle: prev.historicalData[nextIndex],
      };
    });
  }, []);

  const stepBackward = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex <= 0) return prev;
      
      const prevIndex = prev.currentIndex - 1;
      return {
        ...prev,
        currentIndex: prevIndex,
        currentCandle: prev.historicalData[prevIndex],
      };
    });
  }, []);

  const jumpToPosition = useCallback((position: number) => {
    const index = Math.floor((position / 100) * (state.historicalData.length - 1));
    setState(prev => ({
      ...prev,
      currentIndex: index,
      currentCandle: prev.historicalData[index] || null,
    }));
  }, [state.historicalData.length]);

  const executeTrade = useCallback((type: 'buy' | 'sell') => {
    if (!state.currentCandle) return;

    const trade: Trade = {
      id: Date.now().toString(),
      type,
      price: state.currentCandle.close,
      quantity: tradeAmount / state.currentCandle.close,
      timestamp: state.currentCandle.time,
      status: 'open',
    };

    setState(prev => ({
      ...prev,
      trades: [...prev.trades, trade],
    }));

    onTradeExecuted?.(trade);
  }, [state.currentCandle, tradeAmount, onTradeExecuted]);

  // Calculate P&L
  const calculatePnL = useCallback(() => {
    if (!state.currentCandle) return 0;

    return state.trades.reduce((total, trade) => {
      if (trade.status === 'closed') return total + (trade.pnl || 0);
      
      // Calculate unrealized P&L for open trades
      const currentPrice = state.currentCandle!.close;
      const priceDiff = trade.type === 'buy' 
        ? currentPrice - trade.price 
        : trade.price - currentPrice;
      
      return total + (priceDiff * trade.quantity);
    }, 0);
  }, [state.currentCandle, state.trades]);

  const currentPnL = calculatePnL();
  const currentBalance = state.balance + currentPnL;

  // Update parent component with balance changes
  useEffect(() => {
    onBalanceChange?.(currentBalance);
  }, [currentBalance, onBalanceChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
            <span className="ml-3 text-white">Loading historical data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = state.historicalData.length > 0 
    ? (state.currentIndex / (state.historicalData.length - 1)) * 100 
    : 0;

  return (
    <div className="space-y-4">
      {/* Current Market Info */}
      <Card className="border-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Market Replay - {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.currentCandle && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <div className="text-xs text-slate-400">Time</div>
                <div className="text-white font-mono">
                  {new Date(state.currentCandle.time * 1000).toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <div className="text-xs text-slate-400">Price</div>
                <div className="text-white font-mono text-lg">
                  ${state.currentCandle.close.toFixed(5)}
                </div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <div className="text-xs text-slate-400">Balance</div>
                <div className="text-white font-mono text-lg">
                  ${currentBalance.toFixed(2)}
                </div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <div className="text-xs text-slate-400">P&L</div>
                <div className={`font-mono text-lg ${currentPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {currentPnL >= 0 ? '+' : ''}${currentPnL.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Scrubber */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progress: {progress.toFixed(1)}%</span>
              <span>
                {state.currentIndex + 1} / {state.historicalData.length} candles
              </span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={([value]) => jumpToPosition(value)}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetPlayback}
              className="text-white border-slate-600 hover:bg-slate-700"
            >
              <Square className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={stepBackward}
              disabled={state.currentIndex <= 0}
              className="text-white border-slate-600 hover:bg-slate-700"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, speed: Math.max(1, prev.speed / 2) }))}
              className="text-white border-slate-600 hover:bg-slate-700"
            >
              <Rewind className="w-4 h-4" />
            </Button>

            <Button
              onClick={state.isPlaying ? stopPlayback : startPlayback}
              disabled={state.currentIndex >= state.historicalData.length - 1}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6"
            >
              {state.isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, speed: Math.min(10, prev.speed * 2) }))}
              className="text-white border-slate-600 hover:bg-slate-700"
            >
              <FastForward className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={stepForward}
              disabled={state.currentIndex >= state.historicalData.length - 1}
              className="text-white border-slate-600 hover:bg-slate-700"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-slate-400">Speed:</span>
            {SPEED_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={state.speed === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, speed: option.value }))}
                className={state.speed === option.value 
                  ? "bg-cyan-600 text-white" 
                  : "text-white border-slate-600 hover:bg-slate-700"
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Panel */}
      <Card className="border-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Trade Execution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm text-slate-400">Trade Amount ($)</label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Number(e.target.value))}
                className="w-full p-2 bg-slate-800/50 border border-slate-600 rounded text-white"
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => executeTrade('buy')}
                disabled={!state.currentCandle}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Buy
              </Button>
              <Button
                onClick={() => executeTrade('sell')}
                disabled={!state.currentCandle}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Sell
              </Button>
            </div>
          </div>

          {/* Open Trades */}
          {state.trades.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Open Trades</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {state.trades.filter(t => t.status === 'open').map((trade) => (
                  <div key={trade.id} className="flex justify-between items-center p-2 bg-slate-800/30 rounded text-sm">
                    <span className={trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                      {trade.type.toUpperCase()} {trade.quantity.toFixed(4)}
                    </span>
                    <span className="text-white">@${trade.price.toFixed(5)}</span>
                    <span className="text-slate-400">
                      {new Date(trade.timestamp * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}