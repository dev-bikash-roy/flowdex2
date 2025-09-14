import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreateSessionModal from "@/components/CreateSessionModal";
import { Play, Pause, RotateCcw, Plus } from "lucide-react";

export default function Backtest() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
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
        window.location.href = "/api/login";
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
          window.location.href = "/api/login";
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
                Create Your First Session
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session: any, index: number) => (
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
                        variant="outline"
                        className="flex-1"
                        data-testid={`button-play-session-${index}`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {session.isActive ? 'Resume' : 'Start'}
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

      <CreateSessionModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
    </div>
  );
}
