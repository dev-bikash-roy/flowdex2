import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartLine,
  Play,
  BarChart3,
  Shield,
  Zap,
  TrendingUp,
  Target,
  Brain,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Logo, LogoIcon } from "@/components/Logo";

export default function Landing() {
  // DEBUG: Log to confirm this component is rendering
  console.log('🚀 LANDING PAGE IS RENDERING - This should show in console if Landing.tsx is being used');
  
  // Always use /login for localhost development
  const isLocalhost = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '5000';

  console.log('Frontend Environment detection:', {
    hostname: window.location.hostname,
    port: window.location.port,
    isLocalhost
  });

  const handleSignUp = () => {
    console.log('Sign up button clicked');
    // Redirect to the sign-up page
    window.location.href = "/signup";
  };

  const handleLearnMore = () => {
    console.log('Learn more button clicked');
    // Scroll to the features section
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Enhanced Professional Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 lg:px-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          {/* Enhanced Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="cursor-pointer" onClick={() => window.location.href = "/"}>
              <Logo size="md" variant="white" showText={true} className="hover:scale-105 transition-transform duration-300" />
            </div>
          </div>

          {/* Navigation Links - Hidden on mobile, shown on desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/80 hover:text-white hover:text-primary transition-colors duration-200 font-medium">
              Features
            </a>
            <a href="/pricing" className="text-white/80 hover:text-white hover:text-primary transition-colors duration-200 font-medium">
              Pricing
            </a>
            <a href="/about" className="text-white/80 hover:text-white hover:text-primary transition-colors duration-200 font-medium">
              About
            </a>
          </nav>

          {/* Authentication Buttons */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium" 
              onClick={() => window.location.href = "/login"}
            >
              Sign In
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleSignUp} 
              className="shadow-lg hover:shadow-primary/25 font-semibold px-6 py-2 transform hover:scale-105 transition-all duration-200"
            >
              Start Free
            </Button>
          </div>

          {/* Mobile Menu Button - Shown on mobile only */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        {/* Enhanced Background with Multiple Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/98 to-background/95"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-secondary/8"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30"></div>

        {/* Advanced Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-full blur-3xl animate-pulse opacity-60"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-secondary/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000 opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Trading Chart Visual Elements */}
        <div className="absolute top-20 right-20 opacity-20">
          <svg width="120" height="80" viewBox="0 0 120 80" className="text-primary">
            <path d="M10 60 L30 40 L50 45 L70 25 L90 30 L110 15" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="30" cy="40" r="3" fill="currentColor" />
            <circle cx="70" cy="25" r="3" fill="currentColor" />
            <circle cx="110" cy="15" r="3" fill="currentColor" />
          </svg>
        </div>
        
        <div className="absolute bottom-32 left-20 opacity-15">
          <svg width="100" height="60" viewBox="0 0 100 60" className="text-secondary">
            <rect x="10" y="40" width="8" height="15" fill="currentColor" opacity="0.7" />
            <rect x="25" y="30" width="8" height="25" fill="currentColor" opacity="0.8" />
            <rect x="40" y="35" width="8" height="20" fill="currentColor" opacity="0.6" />
            <rect x="55" y="20" width="8" height="35" fill="currentColor" opacity="0.9" />
            <rect x="70" y="25" width="8" height="30" fill="currentColor" opacity="0.7" />
          </svg>
        </div>

        <div className="absolute top-1/3 right-1/3 opacity-10">
          <svg width="80" height="80" viewBox="0 0 80 80" className="text-accent">
            <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="40" cy="40" r="25" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
            <circle cx="40" cy="40" r="15" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
            <path d="M40 5 L45 35 L40 40 L35 35 Z" fill="currentColor" opacity="0.6" />
          </svg>
        </div>

        {/* Additional Chart Elements */}
        <div className="absolute top-1/4 left-10 opacity-10">
          <svg width="60" height="40" viewBox="0 0 60 40" className="text-primary">
            <path d="M5 35 Q15 25 25 30 T45 20 T55 15" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="absolute bottom-1/4 right-10 opacity-15">
          <svg width="90" height="50" viewBox="0 0 90 50" className="text-secondary">
            <path d="M10 40 L20 35 L30 42 L40 30 L50 35 L60 25 L70 30 L80 20" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M10 40 L20 35 L30 42 L40 30 L50 35 L60 25 L70 30 L80 20 L80 45 L10 45 Z" fill="currentColor" opacity="0.1" />
          </svg>
        </div>

        {/* Floating Data Points */}
        <div className="absolute top-20 left-1/4 w-4 h-4 bg-primary/60 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-1/4 w-3 h-3 bg-secondary/60 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-20 w-2 h-2 bg-accent/60 rounded-full animate-pulse delay-2000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 backdrop-blur-sm mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Professional Trading Platform</span>
              <Star className="w-4 h-4 text-secondary" />
            </div>

            {/* Enhanced FlowdeX Branding */}
            <div className="flex items-center justify-center mb-16">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="transform hover:scale-110 hover:rotate-3 transition-all duration-500">
                    <LogoIcon size="xl" variant="gradient" className="w-20 h-20" />
                  </div>
                </div>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent leading-none mb-3">
                  FlowdeX
                </h1>
                <p className="text-primary/90 text-lg font-semibold tracking-widest uppercase">Elite Trading Suite</p>
              </div>
            </div>

            {/* Enhanced Headline */}
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-12 leading-[0.9] tracking-tight">
              <span className="block bg-gradient-to-r from-white via-white to-white/95 bg-clip-text text-transparent">
                Transform Your
              </span>
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Trading Journey
              </span>
              <span className="block bg-gradient-to-r from-white/90 via-white to-white/85 bg-clip-text text-transparent">
                Into Mastery
              </span>
            </h2>

            {/* Enhanced Description */}
            <p className="text-2xl md:text-3xl text-muted-foreground/90 mb-8 max-w-5xl mx-auto leading-relaxed font-light">
              Elevate your trading performance with
              <span className="text-primary font-semibold"> AI-powered analytics</span>,
              <span className="text-secondary font-semibold"> advanced backtesting</span>,
              and <span className="text-accent font-semibold">intelligent insights</span>
            </p>

            <p className="text-lg text-muted-foreground/70 mb-16 max-w-3xl mx-auto">
              Join elite traders who've transformed their strategies with data-driven precision and professional-grade tools
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20">
              <Button
                size="lg"
                variant="gradient"
                onClick={handleSignUp}
                className="text-2xl px-16 py-8 h-auto font-bold shadow-2xl hover:shadow-primary/30 transform hover:scale-105 transition-all duration-300 group"
                data-testid="button-get-started"
              >
                <Sparkles className="w-6 h-6 mr-3 group-hover:animate-spin" />
                Start Trading Elite
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="glass"
                onClick={handleLearnMore}
                className="text-xl px-12 py-8 h-auto font-semibold border-2 border-white/20 hover:border-primary/40 group"
                data-testid="button-learn-more"
              >
                <Play className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Enhanced Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-lg font-semibold text-white">Free Forever Plan</span>
                <span className="text-sm text-muted-foreground text-center">Start trading with full features, no hidden costs</span>
              </div>
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <span className="text-lg font-semibold text-white">Bank-Grade Security</span>
                <span className="text-sm text-muted-foreground text-center">Your data protected with enterprise encryption</span>
              </div>
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/30 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-lg font-semibold text-white">Instant Setup</span>
                <span className="text-sm text-muted-foreground text-center">Get started in under 60 seconds</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative py-32 bg-gradient-to-b from-background to-background/95">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-secondary/3"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-32 bg-gradient-to-b from-primary/50 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Professional Features</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
              Everything You Need
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                To Dominate Markets
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground/80 max-w-3xl mx-auto">
              Professional-grade tools trusted by elite traders worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Enhanced */}
            <Card variant="glass" hover="glow" className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3">Chart Replay & Backtesting</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master your strategies with time-travel trading and comprehensive backtesting suite
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">TradingView Pro integration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Multi-timeframe analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Real market conditions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Strategy validation engine</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 - Enhanced */}
            <Card variant="glass" hover="glow" className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-success/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ChartLine className="w-8 h-8 text-success" />
                </div>
                <CardTitle className="text-2xl mb-3">AI-Powered Analytics</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Deep performance insights with machine learning-driven pattern recognition
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Advanced win rate analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Profit factor optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Risk-adjusted returns</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Predictive modeling</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 - Enhanced */}
            <Card variant="glass" hover="glow" className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-warning/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-warning" />
                </div>
                <CardTitle className="text-2xl mb-3">Intelligent Journaling</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Smart trade logging with automated insights and behavioral analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-warning flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Auto trade capture</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-warning flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Emotion tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-warning flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Pattern recognition</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-warning flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Smart recommendations</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 - Enhanced */}
            <Card variant="glass" hover="glow" className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-destructive/20 to-destructive/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl mb-3">Executive Reports</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Professional-grade reporting with institutional-quality metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Custom dashboards</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Strategy comparisons</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">PDF export suite</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Automated scheduling</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 5 - Enhanced */}
            <Card variant="glass" hover="glow" className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl mb-3">Enterprise Security</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Bank-grade security with zero-knowledge architecture
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">End-to-end encryption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">SOC 2 compliance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Multi-device sync</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">99.99% uptime SLA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 6 - Enhanced */}
            <Card variant="glass" hover="glow" className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl mb-3">Lightning Performance</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Optimized for speed with real-time processing and instant insights
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Sub-second response</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Real-time data feeds</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Optimized algorithms</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Edge computing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Social Proof & Testimonials Section */}
      <div className="relative py-32 bg-gradient-to-b from-background/95 to-background border-y border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-secondary/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6">
              <Star className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">Trusted Worldwide</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
              Join Elite Traders
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Who Trust FlowdeX
              </span>
            </h2>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                10K+
              </div>
              <div className="text-sm text-muted-foreground">Active Traders</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent mb-2">
                $2.5B+
              </div>
              <div className="text-sm text-muted-foreground">Volume Analyzed</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-warning to-warning/80 bg-clip-text text-transparent mb-2">
                4.9★
              </div>
              <div className="text-sm text-muted-foreground">User Rating</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent mb-2">
                99.9%
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="glass" className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "FlowdeX transformed my trading completely. The backtesting features helped me identify profitable patterns I never noticed before."
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">MK</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Michael K.</div>
                  <div className="text-xs text-muted-foreground">Day Trader</div>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "The AI analytics are incredible. I've improved my win rate by 40% since switching to FlowdeX. Best investment I've made."
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">SR</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Sarah R.</div>
                  <div className="text-xs text-muted-foreground">Swing Trader</div>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "Professional-grade tools that actually work. The journaling features helped me eliminate emotional trading mistakes."
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-warning to-warning/80 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">DJ</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">David J.</div>
                  <div className="text-xs text-muted-foreground">Prop Trader</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="relative py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-y border-white/10">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 backdrop-blur-sm mb-8">
              <Star className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold text-primary">Join Elite Traders</span>
              <Star className="w-5 h-5 text-secondary" />
            </div>

            <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                Ready to Dominate
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                The Markets?
              </span>
            </h2>

            <p className="text-2xl text-muted-foreground/90 mb-6 max-w-4xl mx-auto leading-relaxed">
              Join <span className="text-primary font-bold">10,000+</span> professional traders who've transformed their performance
            </p>

            <p className="text-lg text-muted-foreground/70 mb-12 max-w-3xl mx-auto">
              Start your journey to trading mastery with the most advanced platform available
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button
                size="lg"
                variant="gradient"
                onClick={handleSignUp}
                className="text-2xl px-16 py-8 h-auto font-bold shadow-2xl hover:shadow-primary/30 transform hover:scale-105 transition-all duration-300 group"
                data-testid="button-start-trading"
              >
                <Sparkles className="w-6 h-6 mr-3 group-hover:animate-spin" />
                Start Your Elite Journey
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-muted-foreground/60">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full border-2 border-background"></div>
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-full border-2 border-background"></div>
                  <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full border-2 border-background"></div>
                </div>
                <span className="text-sm ml-2">Trusted by 10,000+ traders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="relative bg-gradient-to-b from-background to-card border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-secondary/3"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Enhanced Logo */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Logo size="lg" variant="gradient" showText={true} />
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap justify-center gap-8 mb-8 text-muted-foreground">
              <a href="/about" className="hover:text-primary transition-colors">About</a>
              <a href="/pricing" className="hover:text-primary transition-colors">Pricing</a>
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="mailto:support@flowdex.com" className="hover:text-primary transition-colors">Support</a>
            </div>

            {/* Copyright */}
            <div className="text-center text-muted-foreground/60 border-t border-white/5 pt-8">
              <p>&copy; 2025 FlowdeX. All rights reserved. Built for elite traders worldwide.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}