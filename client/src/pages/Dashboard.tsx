import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartLine, Percent, TrendingUp, ArrowRight, Activity, Target, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getUserPerformance } from "@/lib/supabaseService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [performance, setPerformance] = useState<any>(null);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [equityCurveData, setEquityCurveData] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isDemoMode) {
        toast({
          title: "Connection Restored",
          description: "Refreshing data...",
          variant: "default",
        });
        fetchData();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection Lost",
        description: "Using cached data",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isDemoMode]);

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

  // Mock data for fallback when API is unavailable
  const getMockPerformanceData = () => ({
    totalReturn: 15.67,
    winRate: 68.5,
    totalTrades: 247,
    bestTrade: 1250.00,
    worstTrade: -450.00,
    profitFactor: 1.85,
    maxDrawdown: 8.2
  });

  const getMockTradesData = () => [
    {
      id: '1',
      pair: 'EURUSD',
      type: 'buy',
      profit_loss: '125.50',
      entry_time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: 'closed'
    },
    {
      id: '2', 
      pair: 'GBPUSD',
      type: 'sell',
      profit_loss: '-75.25',
      entry_time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      status: 'closed'
    },
    {
      id: '3',
      pair: 'XAUUSD',
      type: 'buy', 
      profit_loss: '340.75',
      entry_time: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      status: 'closed'
    },
    {
      id: '4',
      pair: 'USDJPY',
      type: 'sell',
      profit_loss: '89.30',
      entry_time: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      status: 'closed'
    },
    {
      id: '5',
      pair: 'BTCUSD',
      type: 'buy',
      profit_loss: '-120.00',
      entry_time: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      status: 'closed'
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    let performanceData = null;
    let tradesData: any[] = [];
    let hasNetworkError = false;

    try {
      // Try to fetch performance data
      try {
        performanceData = await getUserPerformance();
      } catch (error: any) {
        console.error("Error fetching performance data:", error);
        if (error?.message?.includes('Failed to fetch') || error?.code === 'NETWORK_ERROR') {
          hasNetworkError = true;
        }
      }

      // Try to fetch trades data
      try {
        const { data, error: tradesError } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", user?.id)
          .order("entry_time", { ascending: false })
          .limit(10);

        if (tradesError) {
          console.error("Error fetching trades:", tradesError);
          if (tradesError.message?.includes('Failed to fetch')) {
            hasNetworkError = true;
          }
        } else {
          tradesData = data || [];
        }
      } catch (error: any) {
        console.error("Error fetching trades:", error);
        if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
          hasNetworkError = true;
        }
      }

      // Use mock data if network error or no data
      if (hasNetworkError || (!performanceData && tradesData.length === 0)) {
        console.log("Using mock data due to network issues or no data available");
        performanceData = getMockPerformanceData();
        tradesData = getMockTradesData();
        setIsDemoMode(true);
        
        // Show a subtle notification about offline mode
        if (!isOnline) {
          toast({
            title: "Offline Mode",
            description: "Showing sample data. Check your connection.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Demo Mode",
            description: "Showing sample data. Connect to see your real trading data.",
            variant: "default",
          });
        }
      } else {
        setIsDemoMode(false);
      }

      setPerformance(performanceData || getMockPerformanceData());
      setRecentTrades(tradesData);
      calculateEquityCurve(tradesData);

    } catch (error) {
      console.error("Critical error in fetchData:", error);
      // Fallback to mock data on any critical error
      setPerformance(getMockPerformanceData());
      setRecentTrades(getMockTradesData());
      calculateEquityCurve(getMockTradesData());
      
      toast({
        title: "Demo Mode",
        description: "Showing sample data. Please check your connection.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate sample chart data for better visualization
  const generateSampleChartData = () => {
    const data = [];
    let value = 10000;
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate realistic trading performance with some volatility
      const change = (Math.random() - 0.45) * 200; // Slight positive bias
      value += change;
      
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: Math.round(value),
        pnl: change,
        trade: "Sample Data"
      });
    }
    
    return data;
  };

  const calculateEquityCurve = (trades: any[]) => {
    if (!trades || trades.length === 0) {
      // Always show sample data for better UX
      setEquityCurveData(generateSampleChartData());
      return;
    }

    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
    );
    let cumulativePnL = 0;
    const equityData = sortedTrades.map((trade) => {
      const profitLoss = parseFloat(trade.profit_loss || "0");
      cumulativePnL += profitLoss;
      return {
        date: new Date(trade.entry_time).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: 10000 + cumulativePnL,
        pnl: profitLoss,
        trade: `${trade.pair} (${trade.type})`,
      };
    });

    // Add starting point if needed
    if (equityData.length > 0) {
      const firstDate = new Date(sortedTrades[0].entry_time);
      const formattedFirstDate = firstDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (equityData[0].date !== formattedFirstDate) {
        equityData.unshift({
          date: formattedFirstDate,
          value: 10000,
          pnl: 0,
          trade: "Starting Balance",
        });
      }
    }
    
    setEquityCurveData(equityData.length > 0 ? equityData : generateSampleChartData());
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const generateCalendarData = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const months = [];
    for (let i = 0; i < 4; i++) {
      const monthDate = new Date(currentYear, currentMonth + i, 1);
      const monthName = monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      const days = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const activity = Math.random();
        let level = 0;
        if (activity > 0.7) level = 3;
        else if (activity > 0.4) level = 2;
        else if (activity > 0.2) level = 1;
        days.push({ day, level });
      }
      months.push({ name: monthName, days });
    }
    return months;
  };

  const calendarData = generateCalendarData();

  // Slides
  const carouselSlides = [
    {
      id: 1,
      type: "greeting",
      content: {
        greeting: getGreeting(),
        name: user?.firstName || user?.email || "User",
      },
    },
    { id: 2, type: "discord", content: { text: "Join our Discord Community" } },
    { id: 3, type: "twitter", content: { text: "Follow us on X" } },
  ];

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  // Initialize chart with sample data
  useEffect(() => {
    if (equityCurveData.length === 0) {
      const generateSampleChartData = () => {
        const data = [];
        let value = 10000;
        const today = new Date();
        
        for (let i = 30; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          // Simulate realistic trading performance with some volatility
          const change = (Math.random() - 0.45) * 200; // Slight positive bias
          value += change;
          
          data.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            value: Math.round(value),
            pnl: change,
            trade: "Sample Data"
          });
        }
        
        return data;
      };
      
      setEquityCurveData(generateSampleChartData());
    }
  }, []);

  if (isLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <div className="flex-1 px-6 md:px-10 py-8">
          {/* Connection Status Indicator */}
          {(isDemoMode || !isOnline) && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-yellow-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  {!isOnline ? "Offline Mode" : "Demo Mode"}
                </p>
                <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
                  {!isOnline 
                    ? "You're offline. Showing cached data." 
                    : "Showing sample data. Check your database connection."
                  }
                </p>
              </div>
              {isDemoMode && isOnline && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={fetchData}
                  className="text-xs"
                >
                  Retry Connection
                </Button>
              )}
            </div>
          )}

          {/* --- ENHANCED CAROUSEL WITH BETTER CONTRAST --- */}
          <div className="mb-8">
            <div
              className="
                relative overflow-hidden rounded-3xl
                border border-white/20 
                bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-zinc-900/90
                backdrop-blur-sm
                shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]
              "
            >
              {/* Enhanced Accent shapes with better visibility */}
              <div className="pointer-events-none absolute -top-24 -left-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" />
              <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-indigo-400/15 blur-2xl" />
              
              {/* Semi-transparent overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30"></div>

              {/* Content / height & spacing - FIXED SPACING */}
              <div className="relative px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24 min-h-[400px] md:min-h-[480px] text-white">
                {/* Slides */}
                <div className="relative h-full flex items-center justify-center">
                  {carouselSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                    >
                      {slide.type === "greeting" ? (
                        <div className="w-full max-w-4xl mx-auto text-center space-y-6">
                          <p className="text-sm tracking-wide text-zinc-400 uppercase font-medium">{slide.content.greeting}</p>
                          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">{slide.content.name}</h2>
                          <p className="text-xl sm:text-2xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                            Welcome back to your trading dashboard
                          </p>

                          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4">
                            <Button
                              variant="secondary"
                              className="bg-white/10 text-white border-white/20 hover:bg-white/15 backdrop-blur-sm px-6 py-3 text-base"
                            >
                              Continue with your last session
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                              className="bg-teal-400 hover:bg-teal-300 text-teal-900 px-8 py-3 text-base font-semibold"
                              onClick={() => (window.location.href = "/backtest")}
                            >
                              Let&apos;s Go
                            </Button>
                          </div>
                        </div>
                      ) : slide.type === "discord" ? (
                        <div className="w-full max-w-3xl mx-auto text-center space-y-8">
                          <h2 className="text-3xl sm:text-4xl font-bold mb-6">{slide.content.text}</h2>
                          <a
                            href="#"
                            className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-sm text-lg border border-white/15"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            Connect on Discord
                          </a>
                        </div>
                      ) : (
                        <div className="w-full max-w-3xl mx-auto text-center space-y-8">
                          <h2 className="text-3xl sm:text-4xl font-bold mb-6">{slide.content.text}</h2>
                          <a
                            href="#"
                            className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-sm text-lg border border-white/15"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            Follow on X
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Navigation dots - FIXED POSITIONING */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                  {carouselSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-4 w-4 rounded-full transition-all duration-300 ${index === currentSlide
                        ? "bg-white ring-2 ring-white/30 scale-110"
                        : "bg-white/40 hover:bg-white/60"
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - REMOVED BORDERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Percent className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {performance?.totalReturn?.toFixed(2) || "0.00"}%
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Your Best Return (%)</p>
                  <p className="text-3xl font-bold">1000000</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-0 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {performance?.winRate?.toFixed(0) || "0"}%
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Your Best Win Rate (%)</p>
                  <p className="text-3xl font-bold text-primary">1000000</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <Activity className="h-6 w-6 text-foreground" />
                  </div>
                  <span className="text-2xl font-bold">
                    {performance?.totalTrades?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Total Trades</p>
                  <p className="text-lg text-muted-foreground">This month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <ChartLine className="h-6 w-6 text-foreground" />
                  </div>
                  <span className="text-2xl font-bold text-green-500">
                    ${performance?.bestTrade?.toLocaleString() || "0.00"}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Best Trade</p>
                  <p className="text-lg text-muted-foreground">All time</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart - REMOVED BORDER */}
          <Card className="bg-card border-0 shadow-soft mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Performance Overview</CardTitle>
                <Select defaultValue="30">
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={equityCurveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "var(--shadow-medium)",
                      }}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, "Portfolio Value"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 4, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity & Calendar - REMOVED BORDERS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTrades && recentTrades.length > 0 ? (
                    recentTrades.slice(0, 5).map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${parseFloat(trade.profit_loss || "0") > 0
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                              }`}
                          >
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{trade.pair}</p>
                            <p className="text-xs text-muted-foreground capitalize">{trade.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold text-sm ${parseFloat(trade.profit_loss || "0") > 0 ? "text-green-500" : "text-red-500"
                              }`}
                          >
                            {parseFloat(trade.profit_loss || "0") > 0 ? "+" : ""}$
                            {parseFloat(trade.profit_loss || "0").toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No recent trades</p>
                      <p className="text-xs mt-1">Start trading to see activity here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-card border-0 shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    You have backtested {performance?.totalTrades || 0} trades so far
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {calendarData.map((month, monthIndex) => (
                    <div key={monthIndex} className="space-y-3">
                      <h3 className="text-sm font-medium text-center text-muted-foreground">{month.name}</h3>
                      <div className="grid grid-cols-7 gap-1 text-xs">
                        {["M", "T", "W", "T", "F", "S", "S"].map((day, dayIndex) => (
                          <div
                            key={`${day}-${dayIndex}`}
                            className="text-center text-muted-foreground font-medium h-6 flex items-center justify-center"
                          >
                            {day}
                          </div>
                        ))}
                        {month.days.map((day, dayIndex) => {
                          let bgColor = "bg-muted/30";
                          if (day.level === 3) bgColor = "bg-primary";
                          else if (day.level === 2) bgColor = "bg-primary/70";
                          else if (day.level === 1) bgColor = "bg-primary/40";
                          return (
                            <div
                              key={dayIndex}
                              className={`h-6 w-6 rounded flex items-center justify-center text-xs font-medium transition-colors ${bgColor} ${day.level > 0 ? "text-white" : "text-muted-foreground"
                                }`}
                              title={`${day.day} - Activity level: ${day.level}`}
                            >
                              {day.day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
