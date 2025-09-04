import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Award, Globe, Lock, CheckCircle, Zap } from "lucide-react";
import heroImage from "@/assets/hero-security.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_0%,transparent_50%)] opacity-5" />
      
      <div className="relative container mx-auto px-4 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
                <Award className="h-4 w-4" />
                NIST SP 800-88 Rev. 1 Compliant
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Secure Data
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Wiping</span>
                <br />for Trustworthy IT Asset Recycling
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Unlock India's ₹50,000 crore e-waste potential with certified, verifiable data sanitization. 
                Build public trust through transparent, secure data destruction.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-hero hover:shadow-glow transition-all duration-300 px-8 py-3 text-lg"
              >
                <Zap className="h-5 w-5 mr-2" />
                Start Secure Wipe
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary/20 hover:bg-primary/5 px-8 py-3 text-lg"
              >
                <Shield className="h-5 w-5 mr-2" />
                Verify Certificate
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-accent" />
                Cross-Platform Support
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-accent" />
                Offline Bootable
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-accent" />
                Digital Certificates
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-glow">
              <img 
                src={heroImage} 
                alt="Secure data wiping interface with cybersecurity elements"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
            
            {/* Floating Feature Cards */}
            <Card className="absolute -top-4 -left-4 p-4 bg-card/95 backdrop-blur-sm shadow-secure animate-float">
              <div className="text-center">
                <Globe className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Multi-Platform</p>
                <p className="text-xs text-muted-foreground">Windows • Linux • Android</p>
              </div>
            </Card>
            
            <Card className="absolute -bottom-4 -right-4 p-4 bg-card/95 backdrop-blur-sm shadow-success animate-float delay-300">
              <div className="text-center">
                <Lock className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="text-sm font-medium">NIST Compliant</p>
                <p className="text-xs text-muted-foreground">Clear • Purge • Destroy</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;