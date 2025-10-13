import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  ArrowLeft,
  Users,
  Target,
  Award,
  Globe,
  Zap,
  Shield,
  Heart,
  Star,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { Logo } from "@/components/Logo";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
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
          <div className="flex items-center space-x-4">
            <div className="cursor-pointer" onClick={() => window.location.href = "/"}>
              <Logo size="sm" variant="white" showText={true} />
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20">
        {/* Hero Section */}
        <div className="relative py-32 bg-gradient-to-br from-background via-background/98 to-background/95 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-secondary/8"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-full blur-3xl animate-pulse opacity-60"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">About FlowdeX</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                Empowering Traders
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Worldwide
              </span>
            </h1>
            
            <p className="text-2xl text-muted-foreground/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              We're building the future of trading with AI-powered analytics, professional-grade tools, 
              and a community of elite traders who demand excellence.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="py-32 bg-gradient-to-b from-background/95 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6">
                  <Target className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">Our Mission</span>
                </div>
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                  Democratizing Elite Trading
                </h2>
                <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8">
                  We believe every trader deserves access to institutional-grade tools and insights. 
                  Our mission is to level the playing field by providing professional trading analytics, 
                  advanced backtesting, and AI-powered insights to traders worldwide.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Make professional trading tools accessible to everyone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Empower traders with data-driven insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Build a community of successful traders</span>
                  </div>
                </div>
              </div>
              
              <Card variant="glass" className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To become the world's most trusted trading platform, where every trader—from beginners 
                    to professionals—can access the tools, education, and community they need to succeed 
                    in the financial markets.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20 mb-6">
                <Heart className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-warning">Our Values</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                What Drives Us
              </h2>
              <p className="text-xl text-muted-foreground/80 max-w-3xl mx-auto">
                Our core values guide everything we do, from product development to customer support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card variant="glass" hover="glow" className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Trust & Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your data and privacy are paramount. We use bank-grade security and never compromise on protecting your information.
                </p>
              </Card>

              <Card variant="glass" hover="glow" className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-success/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Innovation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We constantly push boundaries, leveraging cutting-edge AI and technology to give you the competitive edge.
                </p>
              </Card>

              <Card variant="glass" hover="glow" className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-warning/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-warning" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Community</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Trading is better together. We foster a supportive community where traders learn, share, and grow.
                </p>
              </Card>

              <Card variant="glass" hover="glow" className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Excellence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We strive for perfection in every feature, every interaction, and every moment of your trading journey.
                </p>
              </Card>

              <Card variant="glass" hover="glow" className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Transparency</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No hidden fees, no surprises. We believe in clear communication and honest business practices.
                </p>
              </Card>

              <Card variant="glass" hover="glow" className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-destructive/20 to-destructive/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Passion</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We're traders ourselves. Our passion for the markets drives us to build the best tools possible.
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="py-32 bg-gradient-to-b from-background to-background/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                FlowdeX by the Numbers
              </h2>
              <p className="text-xl text-muted-foreground/80 max-w-3xl mx-auto">
                Join a growing community of successful traders worldwide.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  10K+
                </div>
                <div className="text-sm text-muted-foreground">Active Traders</div>
              </div>
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent mb-2">
                  $2.5B+
                </div>
                <div className="text-sm text-muted-foreground">Volume Analyzed</div>
              </div>
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-warning to-warning/80 bg-clip-text text-transparent mb-2">
                  150+
                </div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent mb-2">
                  99.9%
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 backdrop-blur-sm mb-8">
              <Star className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold text-primary">Join Our Mission</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                Ready to Transform
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Your Trading?
              </span>
            </h2>

            <p className="text-xl text-muted-foreground/90 mb-12 max-w-3xl mx-auto">
              Join thousands of traders who've already discovered the FlowdeX advantage.
            </p>

            <Button
              size="lg"
              variant="gradient"
              onClick={() => window.location.href = "/signup"}
              className="text-xl px-12 py-6 h-auto font-bold shadow-2xl hover:shadow-primary/30 transform hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-3" />
              Start Your Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}