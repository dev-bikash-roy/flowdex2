import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, TrendingUp, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        // Redirect to home page after successful login
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Enhanced Background with Trading Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/98 to-background/95"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-secondary/8"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-full blur-3xl animate-pulse opacity-60"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-secondary/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000 opacity-40"></div>
      
      {/* Trading Chart Background Elements */}
      <div className="absolute top-10 right-20 opacity-10">
        <svg width="120" height="80" viewBox="0 0 120 80" className="text-primary">
          <path d="M10 60 L30 40 L50 45 L70 25 L90 30 L110 15" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="30" cy="40" r="3" fill="currentColor" />
          <circle cx="70" cy="25" r="3" fill="currentColor" />
          <circle cx="110" cy="15" r="3" fill="currentColor" />
        </svg>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-8 left-8 z-20">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.location.href = "/"}
          className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <Card variant="glass" className="w-full max-w-md relative z-10 backdrop-blur-2xl border-white/20">
        <CardHeader className="text-center pb-8">
          {/* Enhanced FlowdeX Branding */}
          <div className="flex items-center justify-center mb-8">
            <Logo size="lg" variant="gradient" showText={true} />
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent mb-3">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground/90">
            Sign in to your elite trading account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-8">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-white/90 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="glass"
                icon={<Mail className="w-4 h-4" />}
                className="h-12 text-base"
                required
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/90 font-medium">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-primary/80 hover:text-primary text-sm font-medium transition-colors"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-4 h-4 inline mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 inline mr-1" />
                      Show
                    </>
                  )}
                </button>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="glass"
                icon={<Lock className="w-4 h-4" />}
                className="h-12 text-base"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a 
                href="#" 
                className="text-sm text-primary/80 hover:text-primary font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  toast({
                    title: "Password Reset",
                    description: "Password reset functionality coming soon!",
                  });
                }}
              >
                Forgot your password?
              </a>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-6 px-8 pb-8">
            <Button
              type="submit"
              variant="gradient"
              className="w-full text-lg py-6 font-semibold shadow-xl hover:shadow-primary/25 transform hover:scale-[1.02] transition-all duration-200"
              disabled={loading}
              loading={loading}
            >
              {loading ? "Signing in..." : "Sign In to FlowdeX"}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="glass"
              className="w-full py-6 font-medium border-white/20 hover:border-primary/40 transition-all duration-200"
              onClick={() => {
                toast({
                  title: "Google Sign In",
                  description: "Google authentication coming soon!",
                });
              }}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Don't have an account?{" "}
                <a 
                  href="/signup" 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline"
                >
                  Create your free account
                </a>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}