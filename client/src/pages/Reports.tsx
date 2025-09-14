import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Clock, Calendar, FileText, Download } from "lucide-react";

export default function Reports() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1");
  const [selectedSession, setSelectedSession] = useState("all");
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
        window.location.href = "/api/login";
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
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/trading-sessions"],
    retry: false,
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

  // Mock time-based data for demonstration
  const timeBasedData = [
    { time: "00:00", totalTrades: 7, netProfits: 3165.28, winRate: 29, wlBe: "2W-5L" },
    { time: "01:00", totalTrades: 4, netProfits: -296.84, winRate: 50, wlBe: "2W-2L" },
    { time: "19:00", totalTrades: 1, netProfits: 3233.25, winRate: 100, wlBe: "1W-0L" },
  ];

  return (
    <div className="p-6 space-y-8" data-testid="page-reports">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-2">Comprehensive trading performance analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-[200px]" data-testid="select-session">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              {sessions.map((session: any) => (
                <SelectItem key={session.id} value={session.id}>
                  {session.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="time" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="time" data-testid="tab-time">Time</TabsTrigger>
          <TabsTrigger value="day" data-testid="tab-day">Day</TabsTrigger>
          <TabsTrigger value="month" data-testid="tab-month">Month</TabsTrigger>
          <TabsTrigger value="symbol" data-testid="tab-symbol">Symbol</TabsTrigger>
          <TabsTrigger value="tags" data-testid="tab-tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="time" className="space-y-6">
          <div className="flex items-center space-x-4">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[150px]" data-testid="select-time-interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="24">1 day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* P&L By Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>P&L By Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium mb-2">P&L Distribution Chart</p>
                    <p className="text-sm">Profit and loss by time periods</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trade Distribution By Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Trade Distribution By Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium mb-2">Trade Volume Chart</p>
                    <p className="text-sm">Number of trades by time periods</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-success/10 border-success/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success" data-testid="text-best-time">19:00</p>
                  <p className="text-sm text-muted-foreground">Best Time</p>
                  <p className="text-lg font-medium text-success">$3233.25</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive" data-testid="text-worst-time">01:00</p>
                  <p className="text-sm text-muted-foreground">Worst Time</p>
                  <p className="text-lg font-medium text-destructive">-$296.84</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary" data-testid="text-most-trades">00:00</p>
                  <p className="text-sm text-muted-foreground">Most Trades</p>
                  <p className="text-lg font-medium">7 Trades</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-warning/10 border-warning/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning" data-testid="text-least-trades">19:00</p>
                  <p className="text-sm text-muted-foreground">Least Trades</p>
                  <p className="text-lg font-medium">1 Trades</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overview Table */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className="flex items-center justify-end">
                <Button variant="link" className="text-sm" data-testid="button-show-all-intervals">
                  Show all intervals
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Time</th>
                      <th className="text-right py-3 px-4 font-medium">Total Trades</th>
                      <th className="text-right py-3 px-4 font-medium">Net Profits</th>
                      <th className="text-right py-3 px-4 font-medium">Win Rate</th>
                      <th className="text-right py-3 px-4 font-medium">W-L-BE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeBasedData.map((row, index) => (
                      <tr key={row.time} className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium" data-testid={`text-time-${index}`}>
                          {row.time}
                        </td>
                        <td className="text-right py-3 px-4" data-testid={`text-total-trades-${index}`}>
                          {row.totalTrades}
                        </td>
                        <td className={`text-right py-3 px-4 font-medium ${
                          row.netProfits >= 0 ? 'text-success' : 'text-destructive'
                        }`} data-testid={`text-net-profits-${index}`}>
                          {row.netProfits >= 0 ? '+' : ''}${row.netProfits.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4" data-testid={`text-win-rate-${index}`}>
                          {row.winRate}%
                        </td>
                        <td className="text-right py-3 px-4" data-testid={`text-wl-be-${index}`}>
                          {row.wlBe}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Daily Performance Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium mb-2">Daily Performance Chart</p>
                  <p className="text-sm">Performance breakdown by day of week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Monthly Performance Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium mb-2">Monthly Performance Chart</p>
                  <p className="text-sm">Performance breakdown by month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symbol" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Symbol Performance Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium mb-2">Symbol Performance Chart</p>
                  <p className="text-sm">Performance breakdown by trading symbol</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Tag Performance Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium mb-2">Strategy Tag Performance</p>
                  <p className="text-sm">Performance breakdown by strategy tags</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
