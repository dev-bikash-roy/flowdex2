import { useLocation } from "wouter";
import { ChartLine, Play, BarChart3, TrendingUp, BookOpen, NotebookPen, FileText, Settings, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { href: "/", icon: ChartLine, label: "Dashboard" },
  { href: "/backtest", icon: Play, label: "Backtest" },
  { href: "/trades", icon: TrendingUp, label: "Trades" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/notebook", icon: NotebookPen, label: "Notebook" },
  { href: "/reports", icon: FileText, label: "Reports" },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Also sign out from Supabase client to update frontend state
        await supabase.auth.signOut();
        
        toast({
          title: "Success",
          description: "Logged out successfully",
        });
        
        // Redirect to login page
        window.location.href = "/login";
      } else {
        toast({
          title: "Error",
          description: data.message || "Logout failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (href: string) => {
    setLocation(href);
    onClose?.(); // Close mobile sidebar after navigation
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full" data-testid="sidebar">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/logo/flowdex-logo.png"
                alt="FlowdeX"
                className="w-8 h-8 object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <span className="text-xl font-semibold">FlowdeX</span>
          </div>
          {/* Mobile Close Button */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Actions */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <button 
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-success text-white font-medium hover:bg-opacity-90 transition-all"
            data-testid="button-start-live"
          >
            <Play className="w-4 h-4" />
            <span>Start Live Trading</span>
          </button>
          <button
            onClick={() => handleNavigation('/settings')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}