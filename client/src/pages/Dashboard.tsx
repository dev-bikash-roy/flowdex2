import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartLine, Percent, TrendingUp, TrendingDown, Calendar } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/analytics/performance"],
    retry: false,
  });

  const { data: recentTrades = [] } = useQuery({
    queryKey: ["/api/trades"],
    retry: false,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/trading-sessions"],
    retry: false,
  });

  const activeSessions = sessions.filter((session: any) => session.isActive);
  const recentTradesLimited = recentTrades.slice(0, 3);

  if (isLoading || performanceLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" data-testid="page-dashboard">
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <ChartLine className="text-primary w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-success">
                +{performance?.totalReturn?.toFixed(1) || '0.0'}%
              </span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">Total Return</h3>
            <p className="text-3xl font-bold mt-2" data-testid="text-total-return">
              ${performance?.totalReturn?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                <Percent className="text-success w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-success">
                {performance?.winRate?.toFixed(1) || '0.0'}%
              </span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">Win Rate</h3>
            <p className="text-3xl font-bold mt-2" data-testid="text-winning-trades">
              {performance?.winningTrades || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              out of {performance?.totalTrades || 0} trades
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-warning w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-warning">
                {performance?.profitFactor?.toFixed(1) || '0.0'}
              </span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">Profit Factor</h3>
            <p className="text-3xl font-bold mt-2" data-testid="text-gross-profit">
              ${(performance?.averageWin * performance?.winningTrades)?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Gross Profit</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-destructive w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-destructive">
                -{performance?.maxDrawdown?.toFixed(1) || '0.0'}%
              </span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">Max Drawdown</h3>
            <p className="text-3xl font-bold mt-2" data-testid="text-max-drawdown">
              ${performance?.maxDrawdown?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Peak-to-trough</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Equity Curve</CardTitle>
              <Select defaultValue="30">
                <SelectTrigger className="w-[140px]" data-testid="select-timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="365">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ChartLine className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium mb-2">Interactive Equity Curve</p>
                <p className="text-sm">Real-time performance visualization with TradingView integration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTradesLimited.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No recent trades</p>
                </div>
              ) : (
                recentTradesLimited.map((trade: any, index: number) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        parseFloat(trade.profitLoss || '0') > 0 
                          ? 'bg-success/20' 
                          : 'bg-destructive/20'
                      }`}>
                        {parseFloat(trade.profitLoss || '0') > 0 ? (
                          <TrendingUp className="w-4 h-4 text-success" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-trade-pair-${index}`}>
                          {trade.pair}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid={`text-trade-type-${index}`}>
                          {trade.type} • {new Date(trade.entryTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${
                        parseFloat(trade.profitLoss || '0') > 0 ? 'text-success' : 'text-destructive'
                      }`} data-testid={`text-trade-pnl-${index}`}>
                        {parseFloat(trade.profitLoss || '0') > 0 ? '+' : ''}${trade.profitLoss || '0.00'}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-trade-price-${index}`}>
                        {trade.entryPrice}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4" data-testid="button-view-all-trades">
              View All Trades
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Win/Loss Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Winning Trades</span>
                <span className="font-bold text-success" data-testid="text-winning-count">
                  {performance?.winningTrades || 0} ({performance?.winRate?.toFixed(1) || '0.0'}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full" 
                  style={{ width: `${performance?.winRate || 0}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Losing Trades</span>
                <span className="font-bold text-destructive" data-testid="text-losing-count">
                  {(performance?.totalTrades || 0) - (performance?.winningTrades || 0)} ({(100 - (performance?.winRate || 0)).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-destructive h-2 rounded-full" 
                  style={{ width: `${100 - (performance?.winRate || 0)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best/Worst Trades */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Extremes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Best Trade</p>
                  <p className="text-xs text-muted-foreground">Single trade</p>
                </div>
                <span className="font-bold text-success" data-testid="text-best-trade">
                  +${performance?.bestTrade?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Worst Trade</p>
                  <p className="text-xs text-muted-foreground">Single trade</p>
                </div>
                <span className="font-bold text-destructive" data-testid="text-worst-trade">
                  ${performance?.worstTrade?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-sm">Average Win</p>
                  <p className="text-xs text-muted-foreground">Per winning trade</p>
                </div>
                <span className="font-bold text-success" data-testid="text-average-win">
                  +${performance?.averageWin?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-sm">Average Loss</p>
                  <p className="text-xs text-muted-foreground">Per losing trade</p>
                </div>
                <span className="font-bold text-destructive" data-testid="text-average-loss">
                  -${performance?.averageLoss?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No active sessions</p>
                </div>
              ) : (
                activeSessions.slice(0, 2).map((session: any, index: number) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div>
                      <p className="font-medium text-sm" data-testid={`text-session-name-${index}`}>
                        {session.name}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-session-pair-${index}`}>
                        {session.pair} • {new Date(session.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-primary text-sm" data-testid={`text-session-balance-${index}`}>
                        ${session.currentBalance}
                      </span>
                      <p className="text-xs text-muted-foreground">Balance</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button className="w-full mt-4" data-testid="button-new-session">
              + New Session
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Trading Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trading Activity Calendar</CardTitle>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-muted rounded-full"></div>
                <span className="text-muted-foreground">No Trades</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-muted-foreground">Profitable Day</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span className="text-muted-foreground">Loss Day</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center">
            {/* Calendar Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar Days - Generate for current month */}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const isToday = day === new Date().getDate();
              const hasData = Math.random() > 0.7; // Random for demo
              const isProfitable = Math.random() > 0.4;
              
              return (
                <div 
                  key={day}
                  className={`h-12 w-12 flex items-center justify-center text-sm rounded-lg transition-colors cursor-pointer ${
                    isToday 
                      ? 'bg-primary text-primary-foreground font-bold border-2 border-primary shadow-lg'
                      : hasData
                        ? isProfitable
                          ? 'bg-success text-white hover:bg-success/90'
                          : 'bg-destructive text-white hover:bg-destructive/90'
                        : 'bg-muted hover:bg-muted/80'
                  }`}
                  data-testid={`calendar-day-${day}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
