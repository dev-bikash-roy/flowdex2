import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft } from "lucide-react";
import TradingViewWidget from "@/components/TradingViewWidget";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { formatTradingPair } from "@/utils/tradingPairUtils";

interface TradingSession {
  id: string;
  name: string;
  pair: string;
  startingBalance?: string;
  currentBalance?: string;
  starting_balance?: number | string;
  current_balance?: number | string;
  startDate: string;
  start_date?: string;
  description?: string;
  isActive?: boolean;
  is_active?: boolean;
}

export default function FullscreenChart() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [session, setSession] = useState<TradingSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to safely parse session balance values
  const getSessionBalance = (sessionData: any, field: 'starting' | 'current'): number => {
    const altFieldName = field === 'starting' ? 'starting_balance' : 'current_balance';
    
    const altValue = sessionData[altFieldName];
    if (altValue !== undefined && altValue !== null) {
      const parsed = typeof altValue === 'number' ? altValue : parseFloat(String(altValue));
      if (!isNaN(parsed)) return parsed;
    }
    
    return field === 'starting' ? 10000 : 10000;
  };

  useEffect(() => {
    if (sessionId && user) {
      fetchSession();
    }
  }, [sessionId, user]);

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching session:', error);
        return;
      }

      if (data) {
        const startingBalance = getSessionBalance(data, 'starting');
        const currentBalance = getSessionBalance(data, 'current');
        
        // Ensure we have valid balance values
        const finalStartingBalance = startingBalance > 0 ? startingBalance : 10000;
        const finalCurrentBalance = currentBalance > 0 ? currentBalance : finalStartingBalance;
        
        setSession({
          id: data.id,
          name: data.name,
          pair: data.pair,
          startingBalance: finalStartingBalance.toString(),
          currentBalance: finalCurrentBalance.toString(),
          startDate: data.start_date,
          description: data.description,
          isActive: data.is_active
        });
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLocation('/backtest');
  };

  const handleGoBack = () => {
    if (sessionId) {
      setLocation(`/backtest/session/${sessionId}`);
    } else {
      setLocation('/backtest');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0F0F0F]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0F0F0F] text-white">
        <div className="text-center">
          <h2 className="text-xl mb-4">Session not found</h2>
          <Button onClick={handleClose}>Go Back to Backtest</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0F0F0F] flex flex-col">
      {/* Top Bar */}
      <div className="flex-shrink-0 bg-[#1e222d] border-b border-[#2a2e39] p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleGoBack}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#2a2e39]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Session
          </Button>
          <div className="text-white">
            <h1 className="text-lg font-semibold">{session.name}</h1>
            <p className="text-sm text-gray-400">{formatTradingPair(session.pair)} • Full Screen Chart</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-white text-sm">
            Balance: <span className="font-medium">${parseFloat(session.currentBalance).toFixed(2)}</span>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#2a2e39]"
          >
            <X className="w-4 h-4" />
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
          backgroundColor="#0F0F0F"
          gridColor="rgba(242, 242, 242, 0.06)"
          studies={[]}
        />
      </div>
    </div>
  );
}