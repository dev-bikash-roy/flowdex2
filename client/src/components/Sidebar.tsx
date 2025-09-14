import { useLocation } from "wouter";
import { ChartLine, Play, BarChart3, TrendingUp, BookOpen, FileText, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", icon: ChartLine, label: "Dashboard" },
  { href: "/backtest", icon: Play, label: "Backtest" },
  { href: "/trades", icon: TrendingUp, label: "Trades" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/reports", icon: FileText, label: "Reports" },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">X</span>
          </div>
          <span className="text-xl font-semibold">FlowdeX</span>
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
                onClick={() => setLocation(item.href)}
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
