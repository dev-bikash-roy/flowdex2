import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLine, Play, BarChart3, BookOpen, Shield, Zap } from "lucide-react";

export default function Landing() {
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">X</span>
            </div>
            <span className="text-xl font-bold">FlowdeX</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Direct link to /login instead of JavaScript handler */}
            <Button variant="ghost" asChild>
              <a href="/login">Sign In</a>
            </Button>
            <Button onClick={handleSignUp}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-2xl">X</span>
              </div>
              <span className="text-4xl font-bold">FlowdeX</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Professional Trading Journal & Backtesting Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Master your trading with comprehensive backtesting, detailed performance analytics, 
              and intelligent journal insights. Trade smarter, not harder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleSignUp}
                className="text-lg px-8 py-4"
                data-testid="button-get-started"
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleLearnMore}
                className="text-lg px-8 py-4"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Excel</h2>
          <p className="text-xl text-muted-foreground">
            Powerful tools designed for serious traders
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Chart Replay & Backtesting</CardTitle>
              <CardDescription>
                Test your strategies with historical data and interactive chart replay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• TradingView integration</li>
                <li>• Multiple timeframes</li>
                <li>• Real market conditions</li>
                <li>• Strategy validation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mb-4">
                <ChartLine className="w-6 h-6 text-success" />
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Deep insights into your trading performance with detailed metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Win rate analysis</li>
                <li>• Profit factor calculation</li>
                <li>• Drawdown tracking</li>
                <li>• Risk assessment</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-warning" />
              </div>
              <CardTitle>Intelligent Journaling</CardTitle>
              <CardDescription>
                Automatic trade logging with smart insights and pattern recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Auto trade capture</li>
                <li>• Custom tags & notes</li>
                <li>• Screenshot uploads</li>
                <li>• Pattern analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>Performance Reports</CardTitle>
              <CardDescription>
                Comprehensive reports to track your progress and identify improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Monthly summaries</li>
                <li>• Strategy comparisons</li>
                <li>• Export capabilities</li>
                <li>• Custom timeframes</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription>
                Enterprise-grade security with reliable data backup and sync
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Encrypted data storage</li>
                <li>• Automatic backups</li>
                <li>• Multi-device sync</li>
                <li>• 99.9% uptime</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Optimized for speed with real-time updates and instant analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time data feeds</li>
                <li>• Instant calculations</li>
                <li>• Fast chart rendering</li>
                <li>• Responsive interface</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of traders who have improved their performance with FlowdeX
            </p>
            <Button 
              size="lg" 
              onClick={handleSignUp}
              className="text-lg px-8 py-4"
              data-testid="button-start-trading"
            >
              Start Trading Smarter Today
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">X</span>
            </div>
            <span className="text-2xl font-bold">FlowdeX</span>
          </div>
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 FlowdeX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}