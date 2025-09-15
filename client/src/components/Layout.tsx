import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        // Clear the user data from React Query cache
        queryClient.setQueryData(["/api/auth/user"], null);
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        
        toast({
          title: "Success",
          description: "Logged out successfully",
        });
        
        // Redirect to login page
        window.location.href = "/login";
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Logout failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold">FlowdeX</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <i className="fas fa-circle text-success w-2"></i>
                <span>Live Data Connected</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                <i className="fas fa-crown text-warning w-4"></i>
                <span className="text-sm font-medium">Pro Plan</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-medium text-sm">
                      {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {(user as any)?.firstName ? `${(user as any)?.firstName} ${(user as any)?.lastName}` : (user as any)?.email}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
