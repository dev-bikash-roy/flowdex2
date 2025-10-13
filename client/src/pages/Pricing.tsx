import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  ArrowLeft,
  Check,
  Star,
  Zap,
  Crown,
  Sparkles,
  Shield,
  Users,
  Infinity
} from "lucide-react";
import { Logo } from "@/components/Logo";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with professional trading tools",
      icon: <Zap className="w-6 h-6" />,
      color: "from-success to-success/80",
      features: [
        "Basic backtesting (100 tests/month)",
        "Chart replay (5 sessions/day)",
        "Trade journaling",
        "Basic analytics dashboard",
        "Community access",
        "Email support",
        "Mobile app access",
        "Basic risk management tools"
      ],
      limitations: [
        "Limited historical data (1 year)",
        "Standard support response time",
        "Basic reporting features"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "Advanced tools for serious traders who demand more",
      icon: <Star className="w-6 h-6" />,
      color: "from-primary to-secondary",
      features: [
        "Unlimited backtesting",
        "Unlimited chart replay",
        "Advanced AI analytics",
        "Custom indicators",
        "Advanced reporting",
        "Priority support",
        "API access",
        "Advanced risk management",
        "Multi-timeframe analysis",
        "Strategy optimization",
        "Performance benchmarking",
        "Export capabilities"
      ],
      limitations: [],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Elite",
      price: "$99",
      period: "per month",
      description: "Ultimate trading suite for professional traders and institutions",
      icon: <Crown className="w-6 h-6" />,
      color: "from-warning to-warning/80",
      features: [
        "Everything in Pro",
        "Real-time market data",
        "Advanced AI predictions",
        "Custom strategy builder",
        "White-label solutions",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom integrations",
        "Advanced portfolio analytics",
        "Institutional-grade security",
        "Custom reporting",
        "Team collaboration tools",
        "Priority feature requests"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false
    }
  ];

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
              <span className="text-sm font-medium text-primary">Simple, Transparent Pricing</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                Choose Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Trading Edge
              </span>
            </h1>
            
            <p className="text-2xl text-muted-foreground/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              Start free and upgrade as you grow. No hidden fees, no surprises. 
              Cancel anytime with full data export.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <span className="text-muted-foreground">Monthly</span>
              <div className="relative">
                <input type="checkbox" className="sr-only" />
                <div className="w-12 h-6 bg-white/20 rounded-full border border-white/30 cursor-pointer"></div>
                <div className="absolute top-1 left-1 w-4 h-4 bg-primary rounded-full transition-transform"></div>
              </div>
              <span className="text-white">Annual</span>
              <div className="px-3 py-1 bg-success/20 text-success text-sm rounded-full font-medium">
                Save 20%
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="py-32 bg-gradient-to-b from-background/95 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card 
                  key={plan.name}
                  variant="glass" 
                  className={`relative p-8 ${plan.popular ? 'border-primary/50 shadow-2xl shadow-primary/10 scale-105' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-full text-white text-sm font-semibold">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      {plan.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">/{plan.period}</span>
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <Button
                      variant={plan.popular ? "gradient" : "glass"}
                      className="w-full py-6 font-semibold text-lg"
                      onClick={() => {
                        if (plan.name === "Free") {
                          window.location.href = "/signup";
                        } else if (plan.name === "Elite") {
                          // Contact sales logic
                          window.location.href = "mailto:sales@flowdex.com";
                        } else {
                          window.location.href = "/signup";
                        }
                      }}
                    >
                      {plan.cta}
                    </Button>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">What's included:</h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {plan.limitations.length > 0 && (
                        <div className="pt-4 border-t border-white/10">
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">Limitations:</h5>
                          <ul className="space-y-2">
                            {plan.limitations.map((limitation, limitIndex) => (
                              <li key={limitIndex} className="flex items-start gap-3">
                                <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
                                </div>
                                <span className="text-xs text-muted-foreground/70">{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground/80">
                Everything you need to know about FlowdeX pricing and features.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "Can I change plans anytime?",
                  answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
                },
                {
                  question: "Is there a free trial for paid plans?",
                  answer: "Yes, we offer a 14-day free trial for both Pro and Elite plans. No credit card required to start your trial."
                },
                {
                  question: "What happens to my data if I cancel?",
                  answer: "You can export all your data at any time. After cancellation, your data remains accessible for 30 days before permanent deletion."
                },
                {
                  question: "Do you offer discounts for annual billing?",
                  answer: "Yes! Annual billing saves you 20% compared to monthly billing. You can switch to annual billing from your account settings."
                },
                {
                  question: "Is there a limit on the number of trades I can analyze?",
                  answer: "Free plan has some limitations, but Pro and Elite plans offer unlimited trade analysis and backtesting capabilities."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise customers. All payments are processed securely."
                }
              ].map((faq, index) => (
                <Card key={index} variant="glass" className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Enterprise Section */}
        <div className="py-32 bg-gradient-to-b from-background to-background/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card variant="glass" className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/30 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Users className="w-10 h-10 text-accent" />
              </div>
              
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                Enterprise Solutions
              </h2>
              
              <p className="text-xl text-muted-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed">
                Need custom solutions for your trading firm or institution? We offer tailored packages 
                with dedicated support, custom integrations, and enterprise-grade security.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="flex flex-col items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <span className="font-semibold text-white">Enterprise Security</span>
                  <span className="text-sm text-muted-foreground text-center">SOC 2 compliance, SSO, and custom security policies</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <Infinity className="w-8 h-8 text-secondary" />
                  <span className="font-semibold text-white">Unlimited Everything</span>
                  <span className="text-sm text-muted-foreground text-center">No limits on users, data, or API calls</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <Users className="w-8 h-8 text-accent" />
                  <span className="font-semibold text-white">Dedicated Support</span>
                  <span className="text-sm text-muted-foreground text-center">24/7 support with dedicated account manager</span>
                </div>
              </div>
              
              <Button
                size="lg"
                variant="gradient"
                onClick={() => window.location.href = "mailto:enterprise@flowdex.com"}
                className="text-xl px-12 py-6 h-auto font-bold shadow-2xl hover:shadow-primary/30"
              >
                Contact Enterprise Sales
              </Button>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                Ready to Elevate
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Your Trading?
              </span>
            </h2>

            <p className="text-xl text-muted-foreground/90 mb-12 max-w-3xl mx-auto">
              Join thousands of traders who trust FlowdeX with their trading success.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                variant="gradient"
                onClick={() => window.location.href = "/signup"}
                className="text-xl px-12 py-6 h-auto font-bold shadow-2xl hover:shadow-primary/30"
              >
                <Sparkles className="w-5 h-5 mr-3" />
                Start Free Today
              </Button>
              <Button
                size="lg"
                variant="glass"
                onClick={() => window.location.href = "/about"}
                className="text-xl px-12 py-6 h-auto font-semibold border-white/20 hover:border-primary/40"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}