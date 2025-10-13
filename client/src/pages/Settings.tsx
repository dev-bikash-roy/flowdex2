import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName((user as any)?.firstName || "");
      setLastName((user as any)?.lastName || "");
      setProfileImageUrl((user as any)?.profileImageUrl || "");
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Update user metadata in Supabase auth
      const { data, error } = await supabase.auth.updateUser({
        data: {
          firstName,
          lastName,
          profileImageUrl,
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({ 
        title: "Profile Updated", 
        description: "Your information has been saved." 
      });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["supabase", "user"] });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="page-settings">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="profileImageUrl">Profile Image URL</Label>
              <Input id="profileImageUrl" value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)} />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}