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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" data-testid="modal-create-session">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center justify-between text-xl font-semibold">
            Create New Session
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Create a new backtesting session to test your trading strategies.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Session Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter session name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-11"
              data-testid="input-session-name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startingBalance" className="text-sm font-medium">
                Starting Balance
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="startingBalance"
                  type="number"
                  value={formData.startingBalance}
                  onChange={(e) => setFormData({ ...formData, startingBalance: e.target.value })}
                  className="h-11 pl-8"
                  data-testid="input-starting-balance"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="h-11"
                data-testid="input-start-date"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pair" className="text-sm font-medium">
              Trading Pair *
            </Label>
            <Select 
              value={formData.pair} 
              onValueChange={(value) => setFormData({ ...formData, pair: value })}
            >
              <SelectTrigger className="h-11" data-testid="select-trading-pair">
                <SelectValue placeholder="Select trading pair..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {tradingPairs.map((pair) => (
                  <SelectItem key={pair.value} value={pair.value} className="py-3">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{pair.label}</span>
                      <span className="text-xs text-muted-foreground">{pair.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add a description for your trading session..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-20 resize-none"
              data-testid="textarea-description"
            />
          </div>
          
          <div className="flex items-center space-x-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-11"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-11 bg-primary hover:bg-primary/90"
              disabled={isLoading}
              data-testid="button-create-session"
            >
              {isLoading ? "Creating..." : "Create Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}