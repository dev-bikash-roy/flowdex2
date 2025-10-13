import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function Trades() {
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('trading_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_date', { ascending: false });
      
      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        toast({
          title: "Error",
          description: "Failed to load trading sessions",
          variant: "destructive",
        });
      } else {
        setSessions(sessionsData || []);
      }
      
      // Fetch trades
      let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', user?.id)
        .order('entry_time', { ascending: false });
      
      if (selectedSession !== "all") {
        query = query.eq('session_id', selectedSession);
      }
      
      const { data: tradesData, error: tradesError } = await query;
      
      if (tradesError) {
        console.error('Error fetching trades:', tradesError);
        toast({
          title: "Error",
          description: "Failed to load trades",
          variant: "destructive",
        });
      } else {
        setTrades(tradesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchData();
    }
  }, [selectedSession, isAuthenticated, user]);

  if (isLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="page-trades">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Trades</h1>
          <p className="text-muted-foreground mt-2">Track and analyze your trading history</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-[200px]" data-testid="select-session-filter">
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Trading History</span>
            <span className="text-sm font-normal text-muted-foreground" data-testid="text-total-trades">
              {trades.length} trades
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Trades Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start trading in a session to see your trades here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pair</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Trade Type</TableHead>
                    <TableHead>Execution Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Entry Price</TableHead>
                    <TableHead>Stop Loss</TableHead>
                    <TableHead>Take Profit</TableHead>
                    <TableHead>Profit/Loss</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade: any, index: number) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium" data-testid={`text-trade-pair-${index}`}>
                        {trade.pair}
                      </TableCell>
                      <TableCell data-testid={`text-trade-start-date-${index}`}>
                        {new Date(trade.entry_time).toLocaleDateString('en-US', {
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell data-testid={`text-trade-end-date-${index}`}>
                        {trade.exit_time 
                          ? new Date(trade.exit_time).toLocaleDateString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'
                        }
                      </TableCell>
                      <TableCell data-testid={`text-trade-type-${index}`}>
                        <Badge 
                          variant={trade.type === 'buy' ? 'default' : 'secondary'}
                          className={trade.type === 'buy' ? 'bg-success text-white' : 'bg-destructive text-white'}
                        >
                          {trade.type}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-trade-execution-${index}`}>
                        <Badge variant="outline">
                          {trade.execution_type}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-trade-status-${index}`}>
                        <Badge 
                          variant={trade.status === 'closed' ? 'default' : 'outline'}
                          className={
                            trade.status === 'closed' 
                              ? 'bg-muted text-foreground' 
                              : trade.status === 'open'
                              ? 'border-success text-success'
                              : 'border-muted text-muted-foreground'
                          }
                        >
                          {trade.status}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-trade-entry-price-${index}`}>
                        {parseFloat(trade.entry_price).toFixed(5)}
                      </TableCell>
                      <TableCell data-testid={`text-trade-stop-loss-${index}`}>
                        {trade.stop_loss ? parseFloat(trade.stop_loss).toFixed(5) : '-'}
                      </TableCell>
                      <TableCell data-testid={`text-trade-take-profit-${index}`}>
                        {trade.take_profit ? parseFloat(trade.take_profit).toFixed(5) : '-'}
                      </TableCell>
                      <TableCell data-testid={`text-trade-pnl-${index}`}>
                        {trade.profit_loss ? (
                          <span className={`font-medium flex items-center ${
                            parseFloat(trade.profit_loss) >= 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {parseFloat(trade.profit_loss) >= 0 ? (
                              <TrendingUp className="w-4 h-4 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 mr-1" />
                            )}
                            {parseFloat(trade.profit_loss) >= 0 ? '+' : ''}${trade.profit_loss}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell data-testid={`text-trade-tags-${index}`}>
                        <div className="flex flex-wrap gap-1">
                          {trade.tags && trade.tags.length > 0 ? (
                            trade.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                          {trade.tags && trade.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{trade.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          data-testid={`button-add-tag-${index}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}