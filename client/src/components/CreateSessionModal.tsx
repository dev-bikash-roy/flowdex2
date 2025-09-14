import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  const queryClient = useQueryClient();

  const createSessionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/trading-sessions", {
        name: data.name,
        startingBalance: data.startingBalance,
        pair: data.pair,
        startDate: new Date(data.startDate),
        description: data.description,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Session Created",
        description: "Your new trading session has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trading-sessions"] });
      onOpenChange(false);
      setFormData({
        name: "",
        startingBalance: "10000",
        pair: "",
        startDate: new Date().toISOString().split('T')[0],
        description: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pair) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createSessionMutation.mutate(formData);
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
              disabled={createSessionMutation.isPending}
              data-testid="button-create-session"
            >
              {createSessionMutation.isPending ? "Creating..." : "Create Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
