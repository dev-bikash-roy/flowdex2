import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Target, Timer } from "lucide-react";

export default function Analytics() {
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
    },
  });

  const { data: trades = [] } = useQuery({
    queryKey: ["/api/trades"],
    retry: false,
  });

  if (isLoading || performanceLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" data-testid="page-analytics">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">Deep insights into your trading performance</p>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[200px]" data-testid="select-analytics-timeframe">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="365">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold" data-testid="text-total-trades">
                  {performance?.totalTrades || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-success" data-testid="text-win-rate">
                  {performance?.winRate?.toFixed(1) || '0.0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Factor</p>
                <p className="text-2xl font-bold text-warning" data-testid="text-profit-factor">
                  {performance?.profitFactor?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
                <Timer className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Hold Time</p>
                <p className="text-2xl font-bold" data-testid="text-avg-hold-time">
                  2.4h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve */}
        <Card>
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium mb-2">Equity Curve Chart</p>
                <p className="text-sm">Performance over time visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drawdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Drawdown Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-destructive" />
                <p className="text-lg font-medium mb-2">Drawdown Chart</p>
                <p className="text-sm">Risk analysis and peak-to-trough tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['December', 'November', 'October', 'September'].map((month, index) => (
                <div key={month} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">{month}</span>
                  <span className={`font-bold ${
                    index % 2 === 0 ? 'text-success' : 'text-destructive'
                  }`} data-testid={`text-monthly-pnl-${index}`}>
                    {index % 2 === 0 ? '+' : '-'}${(Math.random() * 5000).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Asset Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD'].map((asset, index) => (
                <div key={asset} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">{asset}</span>
                  <div className="text-right">
                    <span className={`font-bold ${
                      index % 2 === 0 ? 'text-success' : 'text-destructive'
                    }`} data-testid={`text-asset-pnl-${index}`}>
                      {index % 2 === 0 ? '+' : '-'}${(Math.random() * 2000).toFixed(0)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(Math.random() * 20) + 5} trades
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strategy Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Strategy Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Breakout', 'Scalping', 'Trend Following', 'Mean Reversion'].map((strategy, index) => (
                <div key={strategy} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">{strategy}</span>
                  <div className="text-right">
                    <span className={`font-bold ${
                      index % 3 === 0 ? 'text-success' : 'text-destructive'
                    }`} data-testid={`text-strategy-pnl-${index}`}>
                      {index % 3 === 0 ? '+' : '-'}${(Math.random() * 1500).toFixed(0)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(Math.random() * 15) + 3} trades
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive" data-testid="text-max-drawdown">
                -{performance?.maxDrawdown?.toFixed(1) || '0.0'}%
              </p>
              <p className="text-sm text-muted-foreground">Max Drawdown</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" data-testid="text-sharpe-ratio">
                1.24
              </p>
              <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" data-testid="text-sortino-ratio">
                1.67
              </p>
              <p className="text-sm text-muted-foreground">Sortino Ratio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" data-testid="text-calmar-ratio">
                0.89
              </p>
              <p className="text-sm text-muted-foreground">Calmar Ratio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
