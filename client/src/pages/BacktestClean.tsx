import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchChartData } from "@/lib/chartService";
import { executeTrade, fetchTrades } from "@/lib/tradeService";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import CreateSessionModal from "@/components/CreateSessionModal";
import TradingViewChart from "@/components/charts/TradingViewChart";
import AdvancedBacktestChart from "@/components/AdvancedBacktestChart";
import { Play, Pause, RotateCcw, Plus, BarChart3, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useParams } from "wouter";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(50);
  const [isLoadingPlayback, setIsLoadingPlayback] = useState(false);
  const [sessions, setSessions] = useState<TradingSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [useAdvancedChart, setUseAdvancedChart] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const params = useParams();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
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
  useEffect(() => {
    const loadSessions = async () => {
      if (!isAuthenticated || isLoading) return;
      
      setSessionsLoading(true);
      try {
        console.log("Loading sessions from Supabase...");
        const { data, error } = await supabase
          .from('trading_sessions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error loading sessions from Supabase:", error);
          throw new Error(error.message);
        }
        
        console.log("Loaded sessions from Supabase:", data);
        
        // Convert to frontend format
        const formattedSessions = data.map(session => ({
          ...session,
          startingBalance: session.starting_balance?.toString() || "0",
          currentBalance: session.current_balance?.toString() || "0",
          startDate: session.start_date,
          isActive: session.is_active
        }));
        
        console.log("Formatted sessions:", formattedSessions);
        setSessions(formattedSessions);
        
        // If there's a session ID in the URL, auto-select that session
        if (params.id) {
          const session = formattedSessions.find(s => s.id === params.id);
          if (session) {
            handleSessionSelect(session);
          }
        }
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
    
    loadSessions();
  }, [isAuthenticated, isLoading, toast, params.id]);

  const deleteSession = async (sessionId: string) => {
    try {
      console.log("Deleting session:", sessionId);
      const { error } = await supabase
        .from('trading_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) {
        console.error("Error deleting session:", error);
        throw new Error(error.message);
      }
      
      console.log("Session deleted successfully");
      toast({
        title: "Session Deleted",
        description: "Trading session has been deleted successfully.",
      });
      
      // Reload sessions
      const { data, error: reloadError } = await supabase
        .from('trading_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (reloadError) {
        console.error("Error reloading sessions:", reloadError);
      } else {
        console.log("Reloaded sessions:", data);
        const formattedSessions = data.map(session => ({
          ...session,
          startingBalance: session.starting_balance?.toString() || "0",
          currentBalance: session.current_balance?.toString() || "0",
          startDate: session.start_date,
          isActive: session.is_active
        }));
        setSessions(formattedSessions);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
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
      // Reset playback when new data is loaded
      setCurrentTimeIndex(0);
      setIsPlaying(false);
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
    
    // Enable advanced chart when selecting a session
    setUseAdvancedChart(true);
  };

  const handleExitSession = () => {
    setSelectedSession(null);
    setUseAdvancedChart(false);
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

  // Playback functions
  const startPlayback = () => {
    if (chartData.length === 0) return;
    
    setIsPlaying(true);
    setIsLoadingPlayback(true);
    
    // Simulate loading time for preloader
    setTimeout(() => {
      setIsLoadingPlayback(false);
      
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
      
      playbackIntervalRef.current = setInterval(() => {
        setCurrentTimeIndex(prevIndex => {
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
      }, 1000 / playbackSpeed);
    }, 1500); // 1.5 second loading simulation
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  };

  const resetPlayback = () => {
    pausePlayback();
    setCurrentTimeIndex(0);
  };

  const skipBack = () => {
    setCurrentTimeIndex(prev => Math.max(0, prev - 10));
  };

  const skipForward = () => {
    setCurrentTimeIndex(prev => Math.min(chartData.length - 1, prev + 10));
  };

  const formatTime = (index: number) => {
    if (chartData.length === 0 || index >= chartData.length) return "00:00";
    const date = new Date(chartData[index].time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  if (isLoading || sessionsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If we're using the advanced chart and have a selected session, show the advanced chart
  if (useAdvancedChart && selectedSession) {
    return (
      <AdvancedBacktestChart 
        session={selectedSession} 
        onExit={handleExitSession} 
      />
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
                    onClick={handleExitSession}
                  >
                    Back to Sessions
                  </Button>
                  <Button 
                    onClick={() => setUseAdvancedChart(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Advanced Chart
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingChart ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : isLoadingPlayback ? (
                <div className="h-96 flex flex-col items-center justify-center">
                  <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                  <p className="text-lg">Loading playback...</p>
                  <p className="text-muted-foreground">Preparing historical data for replay</p>
                </div>
              ) : chartData.length > 0 ? (
                <>
                  <TradingViewChart 
                    data={chartData.slice(0, currentTimeIndex + 1)} 
                    pair={selectedSession.pair} 
                    height={500}
                    onTrade={handleTrade}
                  />
                  
                  {/* Playback Controls */}
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={skipBack}
                          disabled={currentTimeIndex === 0}
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={isPlaying ? pausePlayback : startPlayback}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={skipForward}
                          disabled={currentTimeIndex >= chartData.length - 1}
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={resetPlayback}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <Slider 
                          value={[volume]} 
                          onValueChange={(value) => setVolume(value[0])}
                          max={100} 
                          step={1} 
                          className="w-24"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Slider 
                        value={[currentTimeIndex]} 
                        onValueChange={handleSliderChange}
                        max={Math.max(1, chartData.length - 1)} 
                        step={1} 
                        className="flex-1"
                      />
                      <div className="text-sm text-muted-foreground min-w-[80px] text-right">
                        {formatTime(currentTimeIndex)} / {formatTime(chartData.length - 1)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm text-muted-foreground">
                        Playback Speed: {playbackSpeed}x
                      </div>
                      <div className="flex space-x-1">
                        {[0.5, 1, 2, 4].map(speed => (
                          <Button
                            key={speed}
                            size="sm"
                            variant={playbackSpeed === speed ? "default" : "outline"}
                            onClick={() => setPlaybackSpeed(speed)}
                            className="text-xs px-2"
                          >
                            {speed}x
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
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
          
          {sessions.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-muted-foreground">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Trading Sessions Yet</h3>
                <p className="mb-6">Create your first backtesting session to get started</p>
                <Button 
                  onClick={() => setCreateModalOpen(true)}
                  data-testid="button-create-first-session"
                >
                  Create Your First