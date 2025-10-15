import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { fetchChartData } from "@/lib/chartService";
import { executeTrade, fetchTrades } from "@/lib/tradeService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreateSessionModal from "@/components/CreateSessionModal";
import TradingViewChart from "@/components/charts/TradingViewChart";

import { Play, Pause, RotateCcw, Plus, BarChart3 } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient"; // Add Supabase import
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

export default function Backtest() {
  // Helper function to safely parse session balance values
  const getSessionBalance = (session: TradingSession, field: 'starting' | 'current'): number => {
    const fieldName = field === 'starting' ? 'startingBalance' : 'currentBalance';
    const altFieldName = field === 'starting' ? 'starting_balance' : 'current_balance';
    
    // Try alternative field name first (snake_case from database)
    const altValue = (session as any)[altFieldName];
    if (altValue !== undefined && altValue !== null) {
      const parsed = typeof altValue === 'number' ? altValue : parseFloat(String(altValue));
      if (!isNaN(parsed)) return parsed;
    }
    
    // Try the primary field name
    const primaryValue = session[fieldName as keyof TradingSession];
    if (primaryValue !== undefined && primaryValue !== null) {
      const parsed = typeof primaryValue === 'number' ? primaryValue : parseFloat(String(primaryValue));
      if (!isNaN(parsed)) return parsed;
    }
    
    // Default fallback
    return field === 'starting' ? 10000 : 10000;
  };

  const [, setLocation] = useLocation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TradingSession | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState("1h");
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [positionSize, setPositionSize] = useState("0.01");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [notes, setNotes] = useState("");
  const [sessionTrades, setSessionTrades] = useState<Trade[]>([]);

  const [sessions, setSessions] = useState<TradingSession[]>([]); // Add state for sessions
  const [sessionsLoading, setSessionsLoading] = useState(false); // Add loading state
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const params = useParams();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Load sessions from Supabase
  const loadSessions = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('Cannot load sessions - not authenticated or no user ID');
      return;
    }

    console.log('Loading sessions for user:', user.id);
    setSessionsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('trading_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }


      setSessions(data || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSessions();
    }
  }, [isAuthenticated, user, toast]);

  // Auto-select session based on URL parameter
  useEffect(() => {
    if (params.id && sessions.length > 0 && !selectedSession) {
      const session = sessions.find((s: TradingSession) => s.id === params.id);
      if (session) {
        setSelectedSession(session);
        loadChartData(session.pair, timeframe);
        loadSessionTrades(session.id);
      }
    }
  }, [params.id, sessions, selectedSession, timeframe]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/backtest/session/')) {
        const sessionId = path.split('/').pop();
        if (sessionId && sessions.length > 0) {
          const session = sessions.find((s: TradingSession) => s.id === sessionId);
          if (session) {
            setSelectedSession(session);
            loadChartData(session.pair, timeframe);
            loadSessionTrades(session.id);
          }
        }
      } else if (path === '/backtest') {
        setSelectedSession(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [sessions, timeframe]);

  // Delete session function using Supabase directly
  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('trading_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Session Deleted",
        description: "Trading session has been deleted successfully.",
      });

      // Refresh sessions
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error: unknown) {
      if (error instanceof Error && isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      deleteSession(sessionId);
    }
  };

  const loadChartData = async (symbol: string, interval: string) => {
    if (!symbol) return;

    setIsLoadingChart(true);
    try {
      const data = await fetchChartData(symbol, interval, 100);
      setChartData(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chart data. Please try again.",
        variant: "destructive",
      });
      console.error("Error loading chart data:", error);
    } finally {
      setIsLoadingChart(false);
    }
  };

  const loadSessionTrades = async (sessionId: string) => {
    try {
      const trades = await fetchTrades(sessionId);
      setSessionTrades(trades);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load session trades. Please try again.",
        variant: "destructive",
      });
      console.error("Error loading session trades:", error);
    }
  };

  const handleSessionSelect = (session: any) => {
    setSelectedSession(session);
    loadChartData(session.pair, timeframe);
    loadSessionTrades(session.id);

    // Update URL to include session ID
    window.history.pushState({}, '', `/backtest/session/${session.id}`);
  };

  // New function to handle play button click - navigate to fullscreen chart
  const handlePlaySession = (session: any) => {
    // Navigate to fullscreen chart
    setLocation(`/fullscreen-chart/${session.id}`);
  };

  const handleExitSession = () => {
    setSelectedSession(null);
    setChartData([]);
    setSessionTrades([]);
    // Update URL to remove session ID
    window.history.pushState({}, '', '/backtest');
  };

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    if (selectedSession) {
      loadChartData(selectedSession.pair, value);
    }
  };

  const handleTradeExecution = async (type: 'buy' | 'sell') => {
    if (!selectedSession) return;

    try {
      const tradeData = {
        sessionId: selectedSession.id,
        pair: selectedSession.pair,
        type,
        executionType: 'market' as const,
        entryPrice: parseFloat(chartData[chartData.length - 1].close),
        quantity: parseFloat(positionSize),
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        notes: notes || undefined,
      };

      const trade = await executeTrade(tradeData);

      toast({
        title: "Trade Executed",
        description: `Successfully executed ${type} trade for ${positionSize} ${selectedSession.pair}`,
      });

      // Refresh trades
      loadSessionTrades(selectedSession.id);

      // Reset form
      setStopLoss("");
      setTakeProfit("");
      setNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute trade. Please try again.",
        variant: "destructive",
      });
      console.error("Error executing trade:", error);
    }
  };

  const handleTrade = (price: number, time: string) => {
    toast({
      title: "Price Clicked",
      description: `Clicked price: ${price.toFixed(5)} at ${new Date(time).toLocaleString()}`,
    });
  };



  if (isLoading || sessionsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="page-backtest">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Backtest</h1>
          <p className="text-muted-foreground mt-2">Test your trading strategies with historical data</p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
          data-testid="button-new-session"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </Button>
      </div>

      {selectedSession ? (
        <div className="space-y-6">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>{selectedSession.name} - {formatTradingPair(selectedSession.pair)}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedSession.startDate ? new Date(selectedSession.startDate).toLocaleDateString() : 'Invalid Date'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={timeframe} onValueChange={handleTimeframeChange}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1min">1 Minute</SelectItem>
                      <SelectItem value="5min">5 Minutes</SelectItem>
                      <SelectItem value="15min">15 Minutes</SelectItem>
                      <SelectItem value="30min">30 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="4h">4 Hours</SelectItem>
                      <SelectItem value="1day">1 Day</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={handleExitSession}
                  >
                    Back to Sessions
                  </Button>

                  <Button
                    onClick={() => window.open(`/fullscreen-chart/${selectedSession.id}`, '_blank')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Fullscreen Chart
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingChart ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : chartData.length > 0 ? (
                <TradingViewChart
                  data={chartData}
                  pair={selectedSession.pair}
                  height={500}
                  onTrade={handleTrade}
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trade Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Trade Execution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Position Size</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded bg-background"
                        placeholder="0.01"
                        value={positionSize}
                        onChange={(e) => setPositionSize(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Stop Loss</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded bg-background"
                        placeholder="0.00"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Take Profit</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded bg-background"
                        placeholder="0.00"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded bg-background"
                        placeholder="Trade notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleTradeExecution('buy')}
                    >
                      Buy at Market
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleTradeExecution('sell')}
                    >
                      Sell at Market
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Position Info */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Position Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Current Balance</div>
                    <div className="text-2xl font-bold">
                      ${getSessionBalance(selectedSession, 'current').toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Open Positions</div>
                    <div className="text-2xl font-bold">
                      {sessionTrades.filter(t => t.status === 'open').length}
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Session P&L</div>
                    <div className={`text-2xl font-bold ${(parseFloat(selectedSession.currentBalance) || 0) >= (parseFloat(selectedSession.startingBalance) || 0) ? 'text-success' : 'text-destructive'}`}>
                      {(() => {
                        const currentBalance = parseFloat(selectedSession.currentBalance) || 0;
                        const startingBalance = parseFloat(selectedSession.startingBalance) || 0;
                        const pnl = currentBalance - startingBalance;
                        return `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`;
                      })()}
                    </div>
                  </div>

                  {/* Recent Trades */}
                  <div>
                    <h3 className="font-medium mb-2">Recent Trades</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {sessionTrades.slice(0, 5).map((trade) => (
                        <div key={trade.id} className="p-2 bg-muted rounded text-sm">
                          <div className="flex justify-between">
                            <span className={trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                              {trade.type.toUpperCase()}
                            </span>
                            <span>{parseFloat(trade.quantity).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>{trade.pair}</span>
                            <span>{parseFloat(trade.entryPrice).toFixed(5)}</span>
                          </div>
                        </div>
                      ))}
                      {sessionTrades.length === 0 && (
                        <p className="text-muted-foreground text-sm">No trades yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Sessions</h2>

          {(sessions as TradingSession[]).length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-soft">
              <div className="text-muted-foreground">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Trading Sessions Yet</h3>
                <p className="mb-6">Create your first backtesting session to get started</p>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
                  data-testid="button-create-first-session"
                >
                  Create Your First Session
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(sessions as TradingSession[]).map((session: TradingSession, index: number) => {
                // Use helper function for robust parsing
                const startingBalance = getSessionBalance(session, 'starting');
                const currentBalance = getSessionBalance(session, 'current');
                const pnl = currentBalance - startingBalance;
                


                return (
                  <Card key={session.id} className="relative border-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 shadow-2xl hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-500/30">
                    <CardHeader className="relative overflow-hidden">
                      {/* Glowing gradient overlay */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-lg shadow-cyan-500/50"></div>
                      
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent" data-testid={`text-session-name-${index}`}>
                            {session.name}
                          </CardTitle>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-300">
                            <span data-testid={`text-session-pair-${index}`}>
                              Pair: {formatTradingPair(session.pair)}
                            </span>
                            <span data-testid={`text-session-balance-${index}`}>
                              Balance: ${currentBalance.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1" data-testid={`text-session-date-${index}`}>
                            Date: {session.startDate ? new Date(session.startDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Invalid Date'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full shadow-sm ${session.isActive ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-green-200' : 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-gray-200'}`}></div>
                          <span className={`text-sm font-medium px-3 py-1 rounded-full text-xs shadow-lg ${session.isActive ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30' : 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-400 border border-gray-500/30'}`}>
                            {session.isActive ? 'Active' : 'Paused'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {session.description && (
                          <p className="text-sm text-slate-300" data-testid={`text-session-description-${index}`}>
                            {session.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-slate-300">
                          <span>Starting Balance:</span>
                          <span className="font-medium text-white" data-testid={`text-session-starting-balance-${index}`}>
                            ${startingBalance.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-300">
                          <span>P&L:</span>
                          <span className={`font-bold px-3 py-1 rounded-lg text-sm shadow-lg ${pnl >= 0 ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30' : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/30'}`} data-testid={`text-session-pnl-${index}`}>
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 pt-3 border-t border-slate-600/50">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
                            onClick={() => handlePlaySession(session)}
                            data-testid={`button-play-session-${index}`}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            View Chart
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500/50 text-slate-300 hover:text-white transition-all duration-200"
                            data-testid={`button-pause-session-${index}`}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500/50 text-slate-300 hover:text-white transition-all duration-200"
                            data-testid={`button-reset-session-${index}`}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300"
                            onClick={() => handleDeleteSession(session.id)}
                            data-testid={`button-delete-session-${index}`}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <CreateSessionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSessionCreated={loadSessions}
      />
    </div>
  );
}