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
}

const tradingPairs = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  "AUDUSD",
  "USDCAD",
  "NZDUSD",
  "XAUUSD",
  "XAGUSD",
  "BTCUSD",
  "ETHUSD",
  "US30",
  "NAS100",
  "SPX500",
];

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
      <DialogContent className="sm:max-w-[425px]" data-testid="modal-create-session">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Create New Session
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Create a new backtesting session to test your trading strategies.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Session Name *</Label>
            <Input
              id="name"
              placeholder="Enter session name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="input-session-name"
            />
          </div>
          
          <div>
            <Label htmlFor="startingBalance">Starting Balance</Label>
            <Input
              id="startingBalance"
              type="number"
              value={formData.startingBalance}
              onChange={(e) => setFormData({ ...formData, startingBalance: e.target.value })}
              data-testid="input-starting-balance"
            />
          </div>
          
          <div>
            <Label htmlFor="pair">Trading Pair *</Label>
            <Select 
              value={formData.pair} 
              onValueChange={(value) => setFormData({ ...formData, pair: value })}
            >
              <SelectTrigger data-testid="select-trading-pair">
                <SelectValue placeholder="Select pair..." />
              </SelectTrigger>
              <SelectContent>
                {tradingPairs.map((pair) => (
                  <SelectItem key={pair} value={pair}>
                    {pair}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              data-testid="input-start-date"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Session description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-24 resize-none"
              data-testid="textarea-description"
            />
          </div>
          
          <div className="flex items-center space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
              data-testid="button-create-session"
            >
              {isLoading ? "Loading..." : "Create Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}