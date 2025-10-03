import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function TermsOfService() {
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
        <div className="relative py-20 bg-gradient-to-br from-background via-background/98 to-background/95">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Legal</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                Terms of Service
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground/90 mb-8">
              Last updated: December 2024
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="py-16 bg-gradient-to-b from-background/95 to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card variant="glass" className="p-8 md:p-12">
              <CardContent className="prose prose-invert max-w-none">
                <div className="space-y-8 text-muted-foreground leading-relaxed">
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                    <p>
                      By accessing and using FlowdeX ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                  </section>    
              <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                    <p>
                      FlowdeX provides trading analytics, backtesting tools, and educational resources for financial markets. 
                      The Service includes but is not limited to chart replay, trade journaling, performance analytics, and AI-powered insights.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                    <p>
                      To access certain features of the Service, you must register for an account. You are responsible for:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                      <li>Maintaining the confidentiality of your account credentials</li>
                      <li>All activities that occur under your account</li>
                      <li>Providing accurate and complete information</li>
                      <li>Notifying us immediately of any unauthorized use</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
                    <p>You agree not to use the Service to:</p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                      <li>Violate any applicable laws or regulations</li>
                      <li>Infringe on intellectual property rights</li>
                      <li>Transmit harmful or malicious code</li>
                      <li>Attempt to gain unauthorized access to our systems</li>
                      <li>Use the Service for any illegal trading activities</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. Financial Disclaimer</h2>
                    <p>
                      FlowdeX provides educational and analytical tools only. We do not provide investment advice, 
                      and all trading decisions are your own responsibility. Past performance does not guarantee future results. 
                      Trading involves substantial risk and may not be suitable for all investors.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">6. Subscription and Billing</h2>
                    <p>
                      Paid subscriptions are billed in advance on a monthly or annual basis. You may cancel your subscription 
                      at any time through your account settings. Refunds are provided according to our refund policy.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">7. Data and Privacy</h2>
                    <p>
                      Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                      use, and protect your information. You retain ownership of your trading data.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
                    <p>
                      FlowdeX shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                      including but not limited to trading losses, loss of profits, or loss of data.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">9. Termination</h2>
                    <p>
                      We may terminate or suspend your account immediately, without prior notice, for conduct that we believe 
                      violates these Terms or is harmful to other users, us, or third parties.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
                    <p>
                      We reserve the right to modify these terms at any time. We will notify users of significant changes 
                      via email or through the Service. Continued use constitutes acceptance of modified terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">11. Contact Information</h2>
                    <p>
                      If you have any questions about these Terms of Service, please contact us at:
                    </p>
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      <p><strong>Email:</strong> legal@flowdex.com</p>
                      <p><strong>Address:</strong> FlowdeX Legal Department</p>
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}