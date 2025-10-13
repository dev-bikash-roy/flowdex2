import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Menu, X } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Logout failed",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Logged out successfully",
        });
        
        // Redirect to login page
        window.location.href = "/login";
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
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Slide from left */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-background z-50 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Hamburger Menu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-1"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <h1 className="text-xl lg:text-2xl font-semibold">FlowdeX</h1>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <i className="fas fa-circle text-success w-2"></i>
                <span>Live Data Connected</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                <i className="fas fa-crown text-warning w-4"></i>
                <span className="text-sm font-medium">Pro Plan</span>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-medium text-xs lg:text-sm">
                      {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium truncate max-w-32 lg:max-w-none">
                    {(user as any)?.firstName ? `${(user as any)?.firstName} ${(user as any)?.lastName}` : (user as any)?.email}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs px-2 lg:px-3"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">Exit</span>
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