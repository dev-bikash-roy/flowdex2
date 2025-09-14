import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";

export default function Trades() {
  const [selectedSession, setSelectedSession] = useState<string>("all");
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

  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/trading-sessions"],
    retry: false,
  });

  const { data: trades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ["/api/trades", selectedSession !== "all" ? selectedSession : undefined],
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

  if (isLoading || tradesLoading) {
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
                        {new Date(trade.entryTime).toLocaleDateString('en-US', {
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell data-testid={`text-trade-end-date-${index}`}>
                        {trade.exitTime 
                          ? new Date(trade.exitTime).toLocaleDateString('en-US', {
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
                          {trade.executionType}
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
                        {parseFloat(trade.entryPrice).toFixed(5)}
                      </TableCell>
                      <TableCell data-testid={`text-trade-stop-loss-${index}`}>
                        {trade.stopLoss ? parseFloat(trade.stopLoss).toFixed(5) : '-'}
                      </TableCell>
                      <TableCell data-testid={`text-trade-take-profit-${index}`}>
                        {trade.takeProfit ? parseFloat(trade.takeProfit).toFixed(5) : '-'}
                      </TableCell>
                      <TableCell data-testid={`text-trade-pnl-${index}`}>
                        {trade.profitLoss ? (
                          <span className={`font-medium flex items-center ${
                            parseFloat(trade.profitLoss) >= 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {parseFloat(trade.profitLoss) >= 0 ? (
                              <TrendingUp className="w-4 h-4 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 mr-1" />
                            )}
                            {parseFloat(trade.profitLoss) >= 0 ? '+' : ''}${trade.profitLoss}
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
