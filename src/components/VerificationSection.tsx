import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  FileText,
  Globe,
  Lock,
  Upload
} from "lucide-react";

const VerificationSection = () => {
  const [certificateId, setCertificateId] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const mockVerify = async () => {
    setIsVerifying(true);
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setVerificationResult({
      status: "valid",
      certificate: {
        id: "CERT-SW-2024-001547",
        deviceName: "Samsung SSD 970 EVO Plus",
        deviceSize: "500 GB",
        sanitizationMethod: "NIST SP 800-88 Rev. 1 - Purge",
        timestamp: "2024-01-15 14:30:25 IST",
        operator: "SecureWipe System v2.1",
        digitalSignature: "SHA-256: a1b2c3d4e5f6...",
        blockchainHash: "0x7f8a9b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b",
        qrData: "https://verify.securewipe.in/CERT-SW-2024-001547"
      }
    });
    setIsVerifying(false);
  };

  return (
    <section id="verify" className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Certificate Verification</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Instantly verify the authenticity and integrity of data wiping certificates
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Verification Input */}
            <Card className="shadow-secure">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Verify Certificate
                </CardTitle>
                <CardDescription>
                  Enter certificate ID or scan QR code to verify authenticity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Certificate ID</label>
                    <Input
                      placeholder="CERT-SW-2024-XXXXXX"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={mockVerify}
                      disabled={!certificateId || isVerifying}
                      className="bg-gradient-hero hover:shadow-glow transition-all duration-300"
                    >
                      {isVerifying ? (
                        <>
                          <Shield className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Verify
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                      <QrCode className="h-4 w-4 mr-2" />
                      Scan QR
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-3">Alternative Methods</h4>
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Certificate File (PDF/JSON)
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      Blockchain Verification
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Result */}
            <Card className="shadow-secure">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Verification Results
                </CardTitle>
                <CardDescription>
                  Real-time verification status and certificate details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!verificationResult && !isVerifying && (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Enter a certificate ID to verify</p>
                  </div>
                )}

                {isVerifying && (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-foreground font-medium mb-2">Verifying Certificate...</p>
                    <p className="text-sm text-muted-foreground">Checking digital signatures and blockchain records</p>
                  </div>
                )}

                {verificationResult && (
                  <div className="space-y-4">
                    {/* Status Header */}
                    <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-accent" />
                      <div>
                        <h4 className="font-medium text-accent">Certificate Valid</h4>
                        <p className="text-sm text-accent/80">Verified and tamper-proof</p>
                      </div>
                      <Badge className="ml-auto bg-accent/10 text-accent border-accent/20">
                        VERIFIED
                      </Badge>
                    </div>

                    {/* Certificate Details */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">Certificate ID</span>
                          <span className="font-mono text-foreground">{verificationResult.certificate.id}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Timestamp</span>
                          <span className="text-foreground">{verificationResult.certificate.timestamp}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">Device</span>
                          <span className="text-foreground">{verificationResult.certificate.deviceName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Size</span>
                          <span className="text-foreground">{verificationResult.certificate.deviceSize}</span>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground block">Sanitization Method</span>
                        <span className="text-foreground">{verificationResult.certificate.sanitizationMethod}</span>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground block">Digital Signature</span>
                        <span className="font-mono text-xs text-foreground break-all">
                          {verificationResult.certificate.digitalSignature}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Lock className="h-4 w-4 text-accent" />
                        <span className="text-sm text-accent">Blockchain Verified</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6 shadow-secure">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Digital Signatures</h3>
              <p className="text-sm text-muted-foreground">
                Cryptographically signed certificates ensure tamper-proof verification
              </p>
            </Card>

            <Card className="text-center p-6 shadow-secure">
              <div className="p-3 bg-accent/10 rounded-full w-fit mx-auto mb-4">
                <Globe className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Blockchain Records</h3>
              <p className="text-sm text-muted-foreground">
                Immutable blockchain storage for maximum transparency and trust
              </p>
            </Card>

            <Card className="text-center p-6 shadow-secure">
              <div className="p-3 bg-warning/10 rounded-full w-fit mx-auto mb-4">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Real-time Verification</h3>
              <p className="text-sm text-muted-foreground">
                Instant certificate validation with comprehensive audit trails
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerificationSection;