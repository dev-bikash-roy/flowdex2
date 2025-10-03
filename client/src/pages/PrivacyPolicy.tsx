import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function PrivacyPolicy() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-8">
              <Shield className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">Privacy & Security</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                Privacy Policy
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
                    <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                    <p>
                      We collect information you provide directly to us, such as when you create an account, 
                      use our services, or contact us for support.
                    </p>
                  </section>  
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Process transactions and send related information</li>
                      <li>Send technical notices and support messages</li>
                      <li>Respond to your comments and questions</li>
                      <li>Analyze usage patterns to improve user experience</li>
                      <li>Detect and prevent fraud and abuse</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
                    <p>
                      We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                      <li>With your explicit consent</li>
                      <li>To comply with legal obligations</li>
                      <li>To protect our rights and safety</li>
                      <li>With trusted service providers who assist in our operations</li>
                      <li>In connection with a business transfer or acquisition</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                    <p>
                      We implement industry-standard security measures to protect your information:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                      <li>End-to-end encryption for sensitive data</li>
                      <li>Secure data centers with 24/7 monitoring</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>Multi-factor authentication options</li>
                      <li>SOC 2 Type II compliance</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
                    <p>
                      If you have any questions about this Privacy Policy, please contact us:
                    </p>
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      <p><strong>Email:</strong> privacy@flowdex.com</p>
                      <p><strong>Data Protection Officer:</strong> dpo@flowdex.com</p>
                      <p><strong>Address:</strong> FlowdeX Privacy Team</p>
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