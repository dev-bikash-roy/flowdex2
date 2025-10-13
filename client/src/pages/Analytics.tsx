import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Percent, DollarSign, Info } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [performance, setPerformance] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

    if (isAuthenticated && user) {
      fetchData();
    }
  }, [isAuthenticated, isLoading, user]);

  const calculateAnalytics = (tradesData: any[]) => {
    if (!tradesData || tradesData.length === 0) {
      return {
        total_trades: 0,
        win_rate: 0,
        profit_factor: 0,
        max_drawdown: 0,
        total_pnl: 0,
        winning_trades: 0,
        losing_trades: 0,
        avg_win: 0,
        avg_loss: 0
      };
    }

    const closedTrades = tradesData.filter(trade => trade.status === 'closed' && trade.profit_loss !== null);
    const totalTrades = closedTrades.length;

    if (totalTrades === 0) {
      return {
        total_trades: 0,
        win_rate: 0,
        profit_factor: 0,
        max_drawdown: 0,
        total_pnl: 0,
        winning_trades: 0,
        losing_trades: 0,
        avg_win: 0,
        avg_loss: 0
      };
    }

    const winningTrades = closedTrades.filter(trade => parseFloat(trade.profit_loss) > 0);
    const losingTrades = closedTrades.filter(trade => parseFloat(trade.profit_loss) < 0);

    const totalWins = winningTrades.length;
    const totalLosses = losingTrades.length;
    const winRate = (totalWins / totalTrades) * 100;

    const totalProfit = winningTrades.reduce((sum, trade) => sum + parseFloat(trade.profit_loss), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + parseFloat(trade.profit_loss), 0));
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0;

    const totalPnl = closedTrades.reduce((sum, trade) => sum + parseFloat(trade.profit_loss), 0);
    const avgWin = totalWins > 0 ? totalProfit / totalWins : 0;
    const avgLoss = totalLosses > 0 ? totalLoss / totalLosses : 0;

    // Calculate max drawdown (simplified)
    let runningPnl = 0;
    let peak = 0;
    let maxDrawdown = 0;

    closedTrades.sort((a, b) => new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime());

    for (const trade of closedTrades) {
      runningPnl += parseFloat(trade.profit_loss);
      if (runningPnl > peak) {
        peak = runningPnl;
      }
      const drawdown = ((peak - runningPnl) / Math.max(peak, 1)) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      total_trades: totalTrades,
      win_rate: winRate,
      profit_factor: profitFactor,
      max_drawdown: maxDrawdown,
      total_pnl: totalPnl,
      winning_trades: totalWins,
      losing_trades: totalLosses,
      avg_win: avgWin,
      avg_loss: avgLoss
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch trades and calculate analytics from them
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user?.id)
        .order('entry_time', { ascending: false });

      if (tradesError) {
        console.error('Error fetching trades:', tradesError);
        toast({
          title: "Error",
          description: "Failed to load trades data",
          variant: "destructive",
        });
        // Set empty data to prevent crashes
        setTrades([]);
        setPerformance(calculateAnalytics([]));
      } else {
        const trades = tradesData || [];
        setTrades(trades);
        // Calculate analytics from trades data
        const analytics = calculateAnalytics(trades);
        setPerformance(analytics);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
      // Set empty data to prevent crashes
      setTrades([]);
      setPerformance(calculateAnalytics([]));
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-analytics">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <Select defaultValue="100000">
          <SelectTrigger className="w-[120px]" data-testid="select-analytics-timeframe">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="100000">100000</SelectItem>
            <SelectItem value="50000">50000</SelectItem>
            <SelectItem value="25000">25000</SelectItem>
            <SelectItem value="10000">10000</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Performance Indicators - TradersCasa Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Balance */}
        <Card className="bg-card border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Account Balance</span>
                <Info className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="w-8 h-8 bg-cyan-500/20 rounded flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-cyan-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground" data-testid="text-account-balance">
                ${(100000 + (performance?.total_pnl || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-green-500">2.57%</p>
            </div>
          </CardContent>
        </Card>

        {/* Net P&L */}
        <Card className="bg-card border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Net P&L</span>
                <Info className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="w-8 h-8 bg-cyan-500/20 rounded flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-cyan-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground" data-testid="text-net-pnl">
                ${(performance?.total_pnl || 2572.28).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-green-500">2.57%</p>
            </div>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card className="bg-card border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <Info className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="w-8 h-8 bg-cyan-500/20 rounded flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground" data-testid="text-win-rate">
                {(performance?.win_rate || 66.67).toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground">2W/1L/0B</p>
            </div>
          </CardContent>
        </Card>

        {/* Average Profit/Loss */}
        <Card className="bg-card border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Average Profit/Loss</span>
                <Info className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="w-8 h-8 bg-cyan-500/20 rounded flex items-center justify-center">
                <Percent className="w-4 h-4 text-cyan-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground" data-testid="text-avg-profit-loss">
                ${(performance?.avg_win || 643.07).toFixed(2)}
              </p>
              <p className="text-xs text-green-500">0.64%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* P&L By Time Chart - TradersCasa Style */}
      <Card className="bg-card border border-border">
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">P&L By Time</h3>
          </div>

          {performance?.total_trades === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">No Trading Data Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start trading or import your trades to see detailed analytics and performance insights.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => window.location.href = '/backtest'}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Start Backtesting
                  </button>
                  <button
                    onClick={() => window.location.href = '/trades'}
                    className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Add Trades
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-80 relative">
              {/* Chart Area */}
              <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/20 rounded-lg">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4 text-xs text-muted-foreground">
                  <span>$3600</span>
                  <span>$2700</span>
                  <span>$1800</span>
                  <span>$900</span>
                  <span>$0</span>
                </div>

                {/* Chart content */}
                <div className="ml-12 mr-4 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0">
                    {[0, 25, 50, 75, 100].map((percent) => (
                      <div
                        key={percent}
                        className="absolute w-full border-t border-muted/30"
                        style={{ top: `${percent}%` }}
                      />
                    ))}
                  </div>

                  {/* P&L Line Chart */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="pnlGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Area under the curve */}
                    <path
                      d="M 0 80 L 20 70 L 40 60 L 60 50 L 80 40 L 100 30 L 100 100 L 0 100 Z"
                      fill="url(#pnlGradient)"
                    />

                    {/* P&L line */}
                    <path
                      d="M 0 80 L 20 70 L 40 60 L 60 50 L 80 40 L 100 30"
                      stroke="rgb(34, 197, 94)"
                      strokeWidth="2"
                      fill="none"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-12 right-4 flex justify-between text-xs text-muted-foreground pb-2">
                  <span>30</span>
                  <span>8/1/2025</span>
                  <span></span>
                  <span></span>
                  <span>8/4/2025</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}