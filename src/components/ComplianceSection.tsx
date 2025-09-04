import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Award, 
  FileText, 
  Globe, 
  CheckCircle,
  Download,
  ExternalLink,
  Lock,
  Zap,
  Users
} from "lucide-react";

const ComplianceSection = () => {
  const complianceStandards = [
    {
      title: "NIST SP 800-88 Rev. 1",
      description: "Guidelines for Media Sanitization",
      level: "Federal Standard",
      methods: ["Clear", "Purge", "Destroy"],
      icon: Shield,
      color: "text-primary bg-primary/10 border-primary/20"
    },
    {
      title: "DoD 5220.22-M",
      description: "Department of Defense Standard",
      level: "Military Grade",
      methods: ["3-Pass Overwrite", "7-Pass Wiping"],
      icon: Award,
      color: "text-accent bg-accent/10 border-accent/20"
    },
    {
      title: "GDPR Article 17",
      description: "Right to Erasure Compliance",
      level: "EU Regulation",
      methods: ["Verifiable Deletion", "Audit Trails"],
      icon: Globe,
      color: "text-warning bg-warning/10 border-warning/20"
    }
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: "Cryptographic Verification",
      description: "Digital signatures ensure certificate authenticity and prevent tampering"
    },
    {
      icon: Zap,
      title: "Real-time Monitoring",
      description: "Live progress tracking with detailed sector-by-sector sanitization logs"
    },
    {
      icon: FileText,
      title: "Comprehensive Auditing",
      description: "Complete audit trails with timestamps, methods, and verification records"
    },
    {
      icon: Users,
      title: "Multi-stakeholder Trust",
      description: "Transparent verification system for consumers, businesses, and recyclers"
    }
  ];

  return (
    <section id="compliance" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Compliance & Standards</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meeting international data sanitization standards with verifiable compliance documentation
          </p>
        </div>

        {/* Compliance Standards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {complianceStandards.map((standard, index) => {
            const IconComponent = standard.icon;
            return (
              <Card key={index} className="shadow-secure hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className={`p-3 rounded-full w-fit ${standard.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{standard.title}</CardTitle>
                    <CardDescription>{standard.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {standard.level}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Supported Methods:</h4>
                    <div className="flex flex-wrap gap-2">
                      {standard.methods.map((method, methodIndex) => (
                        <Badge key={methodIndex} variant="secondary" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-4">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Security Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Security & Trust Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center p-6 shadow-secure">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Impact Statistics */}
        <Card className="shadow-glow bg-gradient-hero text-white">
          <CardContent className="py-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">Addressing India's E-Waste Crisis</h3>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Unlocking circular economy potential through trustworthy data sanitization
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">₹50,000 Cr</div>
                <p className="opacity-90">Hoarded IT Assets Value</p>
                <p className="text-sm opacity-75 mt-1">Potential economic recovery</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">1.75M</div>
                <p className="opacity-90">Tonnes Annual E-Waste</p>
                <p className="text-sm opacity-75 mt-1">Opportunity for safe recycling</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">98%</div>
                <p className="opacity-90">Trust Score Target</p>
                <p className="text-sm opacity-75 mt-1">Public confidence in recycling</p>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Download className="h-5 w-5 mr-2" />
                Download White Paper
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Certification Process */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Certification Process</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Device Detection", desc: "Automatic discovery of storage devices" },
              { step: "2", title: "Sanitization", desc: "NIST-compliant data wiping process" },
              { step: "3", title: "Verification", desc: "Multi-layer validation and testing" },
              { step: "4", title: "Certification", desc: "Digital certificate generation" }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {process.step}
                </div>
                <h4 className="font-semibold text-foreground mb-2">{process.title}</h4>
                <p className="text-sm text-muted-foreground">{process.desc}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-border transform translate-x-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComplianceSection;