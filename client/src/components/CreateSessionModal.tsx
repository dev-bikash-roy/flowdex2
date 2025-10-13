import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";

interface CreateSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionCreated?: () => void; // Add callback to refresh sessions
}

// Twelve Data supported instruments for backtesting
const tradingPairs = [
  // Major FX Pairs - Display format with slash, store as compact format
  { display: "EUR/USD", value: "EURUSD" },
  { display: "GBP/USD", value: "GBPUSD" },
  { display: "USD/JPY", value: "USDJPY" },
  { display: "USD/CHF", value: "USDCHF" },
  { display: "AUD/USD", value: "AUDUSD" },
  { display: "USD/CAD", value: "USDCAD" },
  { display: "NZD/USD", value: "NZDUSD" },
  { display: "EUR/GBP", value: "EURGBP" },
  { display: "EUR/JPY", value: "EURJPY" },
  { display: "GBP/JPY", value: "GBPJPY" },
  // German DAX Index
  { display: "GER40", value: "GER40" },
  { display: "DAX", value: "DAX" }
];

export default function CreateSessionModal({ open, onOpenChange, onSessionCreated }: CreateSessionModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    startingBalance: "10000",
    pair: "",
    startDate: new Date().toISOString().split('T')[0],
    description: "",
  });

  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.pair) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check if user is authenticated
      if (isLoading) {
        toast({
          title: "Loading",
          description: "Please wait while we verify your authentication.",
        });
        return;
      }
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a session.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Creating session for user:", user);
      console.log("User ID:", user.id);
      
      // Validate user ID is a proper UUID
      if (!user.id || typeof user.id !== 'string') {
        toast({
          title: "Authentication Error",
          description: "Invalid user ID. Please log out and log back in.",
          variant: "destructive",
        });
        return;
      }
      
      // Create session in Supabase with proper snake_case field names
      const sessionData = {
        name: formData.name,
        starting_balance: formData.startingBalance,
        current_balance: formData.startingBalance, // Initialize current balance to starting balance
        pair: formData.pair,
        start_date: new Date(formData.startDate).toISOString(),
        description: formData.description,
        user_id: user.id,
        is_active: true,
      };
      
      console.log("Session data to insert:", sessionData);
      
      const { data, error } = await supabase
        .from('trading_sessions')
        .insert(sessionData)
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error:", error);
        toast({
          title: "Database Error",
          description: `Failed to create session: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Session created successfully:", data);
      
      toast({
        title: "Session Created",
        description: "Your new trading session has been created successfully.",
      });
      
      // Trigger refresh of sessions list
      if (onSessionCreated) {
        onSessionCreated();
      }
      
      // Close modal and reset form
      onOpenChange(false);
      setFormData({
        name: "",
        startingBalance: "10000",
        pair: "",
        startDate: new Date().toISOString().split('T')[0],
        description: "",
      });
    } catch (error: any) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700" data-testid="modal-create-session">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 p-6 pb-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold text-white mb-2">
                    Create New Trading Session
                  </DialogTitle>
                  <DialogDescription className="text-blue-100 text-base">
                    Set up a new session to analyze market data and test your trading strategies
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  data-testid="button-close-modal"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>
        
        {/* Form content */}
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-200 flex items-center">
                Session Name
                <span className="text-red-400 ml-1">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., EUR/USD Scalping Strategy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                data-testid="input-session-name"
              />
            </div>
            
            {/* Two column layout for balance and pair */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startingBalance" className="text-sm font-semibold text-slate-200">
                  Starting Balance
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <Input
                    id="startingBalance"
                    type="number"
                    value={formData.startingBalance}
                    onChange={(e) => setFormData({ ...formData, startingBalance: e.target.value })}
                    className="bg-slate-800/50 border-slate-600 text-white pl-8 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                    data-testid="input-starting-balance"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pair" className="text-sm font-semibold text-slate-200 flex items-center">
                  Trading Pair
                  <span className="text-red-400 ml-1">*</span>
                </Label>
                <Select 
                  value={formData.pair} 
                  onValueChange={(value) => setFormData({ ...formData, pair: value })}
                >
                  <SelectTrigger 
                    className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                    data-testid="select-trading-pair"
                  >
                    <SelectValue placeholder="Select trading pair..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {tradingPairs.map((pair) => (
                      <SelectItem 
                        key={pair.value} 
                        value={pair.value}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{pair.display}</span>
                          <span className="text-xs text-slate-400">
                            {pair.value.includes('USD') ? 'Major' : 'Index'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-semibold text-slate-200">
                Session Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                data-testid="input-start-date"
              />
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-200">
                Description <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your trading strategy, goals, or notes for this session..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 resize-none min-h-[100px]"
                data-testid="textarea-description"
              />
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-4 pt-6 border-t border-slate-700">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading || !formData.name || !formData.pair}
                data-testid="button-create-session"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Session"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}