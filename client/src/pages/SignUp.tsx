import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, User, TrendingUp, ArrowLeft, Eye, EyeOff, Check, X, Shield } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { toast } = useToast();

  // Password strength calculation
  useEffect(() => {
    const calculateStrength = (pwd: string) => {
      let strength = 0;
      if (pwd.length >= 8) strength += 1;
      if (/[a-z]/.test(pwd)) strength += 1;
      if (/[A-Z]/.test(pwd)) strength += 1;
      if (/[0-9]/.test(pwd)) strength += 1;
      if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
      return strength;
    };
    setPasswordStrength(calculateStrength(password));
  }, [password]);

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength < 3) {
      toast({
        title: "Weak Password",
        description: "Please create a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Success",
          description: "Account created successfully. Please check your email to confirm your account.",
        });
        // Redirect to login page
        window.location.href = "/login";
      } else {
        toast({
          title: "Error",
          description: "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
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
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/8 via-transparent to-primary/8"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-r from-secondary/15 to-primary/15 rounded-full blur-3xl animate-pulse opacity-60"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-l from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse delay-1000 opacity-40"></div>
      
      {/* Trading Chart Background Elements */}
      <div className="absolute top-10 left-20 opacity-10">
        <svg width="100" height="60" viewBox="0 0 100 60" className="text-secondary">
          <rect x="10" y="40" width="8" height="15" fill="currentColor" opacity="0.7" />
          <rect x="25" y="30" width="8" height="25" fill="currentColor" opacity="0.8" />
          <rect x="40" y="35" width="8" height="20" fill="currentColor" opacity="0.6" />
          <rect x="55" y="20" width="8" height="35" fill="currentColor" opacity="0.9" />
          <rect x="70" y="25" width="8" height="30" fill="currentColor" opacity="0.7" />
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
      
      <Card variant="glass" className="w-full max-w-lg relative z-10 backdrop-blur-2xl border-white/20">
        <CardHeader className="text-center pb-6">
          {/* Enhanced FlowdeX Branding */}
          <div className="flex items-center justify-center mb-8">
            <Logo size="lg" variant="gradient" showText={true} />
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent mb-3">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground/90">
            Join 10,000+ elite traders worldwide
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-8">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-white/90 font-medium">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  variant="glass"
                  icon={<User className="w-4 h-4" />}
                  className="h-12 text-base"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-white/90 font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  variant="glass"
                  icon={<User className="w-4 h-4" />}
                  className="h-12 text-base"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
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

            {/* Password Field with Strength Indicator */}
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
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="glass"
                icon={<Lock className="w-4 h-4" />}
                className="h-12 text-base"
                required
              />
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Password strength:</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength <= 2 ? 'text-red-400' :
                      passwordStrength <= 3 ? 'text-yellow-400' :
                      passwordStrength <= 4 ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          i < passwordStrength ? getStrengthColor(passwordStrength) : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      {password.length >= 8 ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-400" />
                      )}
                      <span>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/[A-Z]/.test(password) ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-400" />
                      )}
                      <span>Uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/[0-9]/.test(password) ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-400" />
                      )}
                      <span>Number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirmPassword" className="text-white/90 font-medium">Confirm Password</Label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-primary/80 hover:text-primary text-sm font-medium transition-colors"
                >
                  {showConfirmPassword ? (
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
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="glass"
                icon={<Lock className="w-4 h-4" />}
                className="h-12 text-base"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <X className="w-3 h-3" />
                  <span>Passwords do not match</span>
                </div>
              )}
              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-3 h-3" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <a href="/terms" target="_blank" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-6 px-8 pb-8">
            <Button 
              type="submit" 
              variant="gradient"
              className="w-full text-lg py-6 font-semibold shadow-xl hover:shadow-secondary/25 transform hover:scale-[1.02] transition-all duration-200" 
              disabled={loading || !acceptTerms || passwordStrength < 3}
              loading={loading}
            >
              {loading ? "Creating account..." : "Create Your FlowdeX Account"}
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

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="glass"
              className="w-full py-6 font-medium border-white/20 hover:border-secondary/40 transition-all duration-200"
              onClick={() => {
                toast({
                  title: "Google Sign Up",
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

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>Your data is protected with bank-grade encryption</span>
            </div>

            {/* Sign In Link */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Already have an account?{" "}
                <a 
                  href="/login" 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline"
                >
                  Sign in to FlowdeX
                </a>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}