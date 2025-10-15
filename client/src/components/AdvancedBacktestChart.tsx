import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  BarChart3,
  X,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import TradingViewWidget from "@/components/TradingViewWidget";
import { formatTradingPair } from "@/utils/tradingPairUtils";

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
  const [currentBalance, setCurrentBalance] = useState(parseFloat(session.currentBalance || '0'));
  const [pnl, setPnl] = useState(0);
  
  const { toast } = useToast();

  // Load session trades
  useEffect(() => {
    const loadSessionTrades = async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('session_id', session.id)
          .order('entry_time', { ascending: false });

        if (error) {
          console.error('Error loading trades:', error);
          return;
        }

        setSessionTrades(data || []);
        
        // Calculate current PnL from open trades
        const openTrades = data?.filter(trade => trade.status === 'open') || [];
        const totalPnl = openTrades.reduce((sum, trade) => {
          return sum + (parseFloat(trade.profit_loss || '0'));
        }, 0);
        setPnl(totalPnl);
        
      } catch (error) {
        console.error('Error loading session trades:', error);
      }
    };

    loadSessionTrades();
  }, [session.id]);

  const openFullscreen = () => {
    window.open(`/fullscreen-chart/${session.id}`, '_blank');
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#131722] text-[#d1d4dc]">
      {/* Top Controls */}
      <div className="flex-shrink-0 p-3 bg-[#1e222d] flex items-center justify-between gap-4 border-b border-[#2a2e39]">
        <div className="flex items-center gap-4">
          <div className="text-base font-medium pr-4 border-r border-[#2a2e39]">
            {formatTradingPair(session.pair)}
          </div>
          <div className="text-sm text-gray-400">
            {session.name}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={openFullscreen}
            className="bg-[#2962FF] hover:bg-[#1e53e5] text-white border border-[#4e525e] rounded py-2 px-3 text-sm"
          >
            Fullscreen
          </Button>
          <Button 
            onClick={onExit}
            className="bg-red-500 hover:bg-red-600 text-white border border-[#4e525e] rounded py-2 px-3 text-sm"
          >
            <X className="w-4 h-4 mr-1" />
            Exit
          </Button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative">
        <TradingViewWidget
          symbol={session.pair}
          interval="1h"
          theme="dark"
          autosize={true}
          hide_side_toolbar={false}
          hide_top_toolbar={false}
          allow_symbol_change={true}
          save_image={true}
          calendar={false}
          hide_legend={false}
          hide_volume={false}
          backgroundColor="#131722"
          gridColor="rgba(242, 242, 242, 0.06)"
          studies={[]}
        />
      </div>

      {/* Bottom Bar */}
      <div className="flex-shrink-0 p-3 bg-[#1e222d] flex justify-between items-center border-t border-[#2a2e39]">
        <div className="flex items-center gap-4">
          <BarChart3 className="w-6 h-6 text-white" />
          <span className="text-white font-medium">FlowdeX</span>
        </div>
        
        <div className="flex items-center gap-6">
          <span className="text-sm">
            Balance: <span className="font-medium">${currentBalance.toFixed(2)}</span>
          </span>
          <span className="text-sm">
            Open P&L: <span className={`font-medium ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
            </span>
          </span>
          <span className="text-sm">
            Trades: <span className="font-medium">{sessionTrades.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
}