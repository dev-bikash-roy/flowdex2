import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { fetchChartData } from "@/lib/chartService";
import { executeTrade, fetchTrades } from "@/lib/tradeService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreateSessionModal from "@/components/CreateSessionModal";
import TradingViewChart from "@/components/charts/TradingViewChart";
import { Play, Pause, RotateCcw, Plus, BarChart3 } from "lucide-react";

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

export default function Backtest() {
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
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/trading-sessions"],
    retry: false,
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("DELETE", `/api/trading-sessions/${sessionId}`);
    },
    onSuccess: () => {
      toast({
        title: "Session Deleted",
        description: "Trading session has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trading-sessions"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
    },
  });

  const handleDeleteSession = (sessionId: string) => {
    if (confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      deleteSessionMutation.mutate(sessionId);
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
          className="flex items-center space-x-2"
          data-testid="button-new-session"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </Button>
      </div>

      {selectedSession ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>{selectedSession.name} - {selectedSession.pair}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedSession.startDate).toLocaleDateString()}
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
                    onClick={() => setSelectedSession(null)}
                  >
                    Back to Sessions
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
            <Card className="lg:col-span-2">
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
            <Card>
              <CardHeader>
                <CardTitle>Position Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Current Balance</div>
                    <div className="text-2xl font-bold">${parseFloat(selectedSession.currentBalance).toFixed(2)}</div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Open Positions</div>
                    <div className="text-2xl font-bold">
                      {sessionTrades.filter(t => t.status === 'open').length}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Session P&L</div>
                    <div className={`text-2xl font-bold ${
                      parseFloat(selectedSession.currentBalance) >= parseFloat(selectedSession.startingBalance) 
                        ? 'text-success' 
                        : 'text-destructive'
                    }`}>
                      {parseFloat(selectedSession.currentBalance) >= parseFloat(selectedSession.startingBalance) ? '+' : ''}
                      ${(parseFloat(selectedSession.currentBalance) - parseFloat(selectedSession.startingBalance)).toFixed(2)}
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
            <Card className="p-12 text-center">
              <div className="text-muted-foreground">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Trading Sessions Yet</h3>
                <p className="mb-6">Create your first backtesting session to get started</p>
                <Button 
                  onClick={() => setCreateModalOpen(true)}
                  data-testid="button-create-first-session"
                >
                  Create Your First Session
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(sessions as TradingSession[]).map((session: TradingSession, index: number) => (
                <Card key={session.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg" data-testid={`text-session-name-${index}`}>
                          {session.name}
                        </CardTitle>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span data-testid={`text-session-pair-${index}`}>
                            Pair: {session.pair}
                          </span>
                          <span data-testid={`text-session-balance-${index}`}>
                            Balance: ${parseFloat(session.currentBalance).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1" data-testid={`text-session-date-${index}`}>
                          Date: {new Date(session.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${session.isActive ? 'bg-success' : 'bg-muted'}`}></div>
                        <span className="text-sm text-muted-foreground">
                          {session.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {session.description && (
                        <p className="text-sm text-muted-foreground" data-testid={`text-session-description-${index}`}>
                          {session.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>Starting Balance:</span>
                        <span className="font-medium" data-testid={`text-session-starting-balance-${index}`}>
                          ${parseFloat(session.startingBalance).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>P&L:</span>
                        <span className={`font-medium ${
                          parseFloat(session.currentBalance) >= parseFloat(session.startingBalance) 
                            ? 'text-success' 
                            : 'text-destructive'
                        }`} data-testid={`text-session-pnl-${index}`}>
                          {parseFloat(session.currentBalance) >= parseFloat(session.startingBalance) ? '+' : ''}
                          ${(parseFloat(session.currentBalance) - parseFloat(session.startingBalance)).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-3 border-t border-border">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleSessionSelect(session)}
                          data-testid={`button-play-session-${index}`}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          View Chart
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          data-testid={`button-pause-session-${index}`}
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          data-testid={`button-reset-session-${index}`}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteSession(session.id)}
                          disabled={deleteSessionMutation.isPending}
                          data-testid={`button-delete-session-${index}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <CreateSessionModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
    </div>
  );
}