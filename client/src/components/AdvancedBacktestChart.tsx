import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import TradingViewWidget from "@/components/TradingViewWidget";

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

export default function AdvancedBacktestChart({ 
  session, 
  onExit 
}: { 
  session: TradingSession; 
  onExit: () => void; 
}) {
  const [sessionTrades, setSessionTrades] = useState<Trade[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const { toast } = useToast();

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour12: false,
        timeZone: 'UTC'
      }) + ' (UTC+1)');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate current price updates (in real app, this would come from WebSocket)
  useEffect(() => {
    const mockPrices: Record<string, number> = {
      'EURUSD': 1.08267,
      'GBPUSD': 1.26543,
      'USDJPY': 152.681,
      'USDCHF': 0.87432,
      'AUDUSD': 0.65123,
      'USDCAD': 1.36789,
      'NZDUSD': 0.61234,
      'EURGBP': 0.85678,
      'EURJPY': 162.345,
      'GBPJPY': 189.123
    };

    setCurrentPrice(mockPrices[session.pair] || 1.0000);

    // Simulate small price movements
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 0.0001;
        return Math.max(prev + change, 0.0001);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [session.pair]);

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
      }
    };

    loadTrades();
  }, [session.id]);

  // Helper function to safely parse balance values
  const getBalance = (session: TradingSession, field: 'starting' | 'current'): number => {
    const fieldName = field === 'starting' ? 'startingBalance' : 'currentBalance';
    const altFieldName = field === 'starting' ? 'starting_balance' : 'current_balance';
    
    // Try the primary field name
    if (session[fieldName as keyof TradingSession]) {
      const parsed = parseFloat(session[fieldName as keyof TradingSession] as string);
      if (!isNaN(parsed)) return parsed;
    }
    
    // Try alternative field name (snake_case from database)
    if ((session as any)[altFieldName]) {
      const parsed = parseFloat((session as any)[altFieldName]);
      if (!isNaN(parsed)) return parsed;
    }
    
    // Default fallback
    return field === 'starting' ? 10000 : 10000;
  };

  const currentBalance = getBalance(session, 'current');
  const startingBalance = getBalance(session, 'starting');
  const pnl = currentBalance - startingBalance;

  // Debug logging to see what data we're getting
  console.log('Session data:', session);
  console.log('Current Balance:', currentBalance);
  console.log('Starting Balance:', startingBalance);

  return (
    <div className="w-full h-screen flex flex-col bg-[#131722] text-[#d1d4dc]">
      {/* Top Controls - Mobile Responsive */}
      <div className="flex-shrink-0 p-2 sm:p-2.5 bg-[#1e222d] flex items-center justify-between gap-2 sm:gap-4 border-b border-[#2a2e39]">
        <div className="flex items-center gap-1 sm:gap-2.5 min-w-0 flex-1">
          <div className="text-sm sm:text-base font-medium pr-2 sm:pr-4 border-r border-[#2a2e39] truncate">
            {session.pair}
          </div>
          <div className="hidden sm:flex text-sm text-green-400 items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Live TradingView Chart
          </div>
          <div className="sm:hidden text-xs text-green-400">
            Live
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2.5">
          <Button 
            onClick={onExit}
            className="bg-red-500 hover:bg-red-600 text-white border border-[#4e525e] rounded py-1.5 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Exit Session</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </div>

      {/* Chart Container - Full Screen */}
      <div className="flex-grow relative">
        <TradingViewWidget
          symbol={session.pair}
          interval="1h"
          theme="dark"
          autosize={true}
          hide_side_toolbar={false}
          hide_top_toolbar={false}
          allow_symbol_change={false}
          backgroundColor="#131722"
          gridColor="rgba(242, 242, 242, 0.06)"
        />
      </div>

      {/* Bottom Bar - Mobile Responsive */}
      <div className="flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 bg-[#1e222d] border-t border-[#2a2e39]">
        {/* Mobile Layout - Stacked */}
        <div className="sm:hidden">
          {/* Top row - Logo and News */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <BarChart3 className="w-4 h-4 text-white mr-1" />
              <span className="text-white font-medium text-xs">FlowdeX</span>
            </div>
            <a 
              href="https://www.tradingview.com/news/top-providers/tradingview/?utm_source=www.tradingview.com&utm_medium=widget_new&utm_campaign=timeline"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-xs text-blue-400"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              News
            </a>
          </div>
          
          {/* Bottom row - Trading info */}
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-3">
              <div>
                <span className="text-gray-400">{session.pair}:</span>
                <span className="font-mono text-white ml-1">
                  {currentPrice.toFixed(session.pair.includes('JPY') ? 3 : 5)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Bal:</span>
                <span className="text-white ml-1">${Math.round(currentBalance).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div>
                <span className="text-gray-400">P&L:</span>
                <span className={`ml-1 ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${pnl >= 0 ? '+' : ''}{pnl.toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Pos:</span>
                <span className="text-white ml-1">{sessionTrades.filter(t => t.status === 'open').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Single Row */}
        <div className="hidden sm:flex justify-between items-center">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-medium text-sm">FlowdeX</span>
          </div>

          {/* Center - Trading Info */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            {/* News Link */}
            <a 
              href="https://www.tradingview.com/news/top-providers/tradingview/?utm_source=www.tradingview.com&utm_medium=widget_new&utm_campaign=timeline"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              News
            </a>

            {/* Current Price */}
            <div className="flex items-center text-sm">
              <span className="text-gray-400 mr-2">{session.pair}:</span>
              <span className="font-mono text-white font-medium">
                {currentPrice.toFixed(session.pair.includes('JPY') ? 3 : 5)}
              </span>
            </div>

            {/* Balance */}
            <div className="text-sm">
              <span className="text-gray-400">Balance:</span>
              <span className="font-medium text-white ml-1">${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Open P&L */}
            <div className="text-sm">
              <span className="text-gray-400">Open Profit/Loss:</span>
              <span className={`font-medium ml-1 ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
              </span>
            </div>

            {/* Open Positions */}
            <div className="text-sm">
              <span className="text-gray-400">Open Positions:</span>
              <span className="font-medium text-white ml-1">{sessionTrades.filter(t => t.status === 'open').length}</span>
            </div>
          </div>

          {/* Right side - Time and Mode */}
          <div className="flex items-center space-x-4">
            {/* Current Time */}
            <div className="flex items-center text-xs text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              {currentTime}
            </div>

            {/* Mode Indicator */}
            <div className="text-xs">
              <span className="text-gray-400">Mode:</span>
              <span className="text-blue-400 ml-1 font-medium">Live Trading</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}