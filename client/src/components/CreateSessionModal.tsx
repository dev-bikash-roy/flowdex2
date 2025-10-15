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
import { tradingPairs } from "@/utils/tradingPairUtils";

interface CreateSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}



export default function CreateSessionModal({ open, onOpenChange }: CreateSessionModalProps) {
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
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[95vh] overflow-y-auto p-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50" data-testid="modal-create-session">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-6 pb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Session</h2>
              <p className="text-cyan-100/90 text-sm">
                Create a new backtesting session to test your trading strategies.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-10 w-10 p-0 text-white hover:bg-white/20 rounded-full"
              data-testid="button-close-modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-8 bg-slate-900/95 backdrop-blur-sm max-h-[calc(95vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Session Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-white font-medium text-base">
                Session Name
              </Label>
              <Input
                id="name"
                placeholder="Session Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-14 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 text-base focus:border-cyan-400 focus:ring-cyan-400/20"
                data-testid="input-session-name"
              />
            </div>

            {/* Balance and Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <Label htmlFor="startingBalance" className="text-white font-medium text-base">
                  Starting Balance
                </Label>
                <Input
                  id="startingBalance"
                  type="number"
                  value={formData.startingBalance}
                  onChange={(e) => setFormData({ ...formData, startingBalance: e.target.value })}
                  className="h-14 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 text-base focus:border-cyan-400 focus:ring-cyan-400/20"
                  data-testid="input-starting-balance"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="startDate" className="text-white font-medium text-base">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="h-14 bg-slate-800/50 border-slate-600/50 text-white text-base focus:border-cyan-400 focus:ring-cyan-400/20"
                  data-testid="input-start-date"
                />
              </div>
            </div>

            {/* Trading Pair */}
            <div className="space-y-3">
              <Label htmlFor="pair" className="text-white font-medium text-base">
                Pair
              </Label>
              <Select 
                value={formData.pair} 
                onValueChange={(value) => setFormData({ ...formData, pair: value })}
              >
                <SelectTrigger className="h-14 bg-slate-800/50 border-slate-600/50 text-white text-base focus:border-cyan-400 focus:ring-cyan-400/20" data-testid="select-trading-pair">
                  <SelectValue placeholder="Select pair..." className="text-slate-400" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 max-h-[300px]">
                  {tradingPairs.map((pair) => (
                    <SelectItem 
                      key={pair.value} 
                      value={pair.value} 
                      className="py-4 text-white hover:bg-slate-700 focus:bg-slate-700"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-white">{pair.label}</span>
                        <span className="text-xs text-slate-400">{pair.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-white font-medium text-base">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Session Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-24 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 text-base resize-none focus:border-cyan-400 focus:ring-cyan-400/20"
                data-testid="textarea-description"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pt-8 border-t border-slate-700/50">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-14 bg-transparent border-slate-600 text-white hover:bg-slate-800/50 hover:border-slate-500 text-base font-medium"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium text-base shadow-lg shadow-cyan-500/25"
                disabled={isLoading}
                data-testid="button-create-session"
              >
                {isLoading ? "Creating..." : "Create Session"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}