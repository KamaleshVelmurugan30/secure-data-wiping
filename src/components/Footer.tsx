import { Button } from "@/components/ui/button";
import { Shield, Github, Twitter, Linkedin, Mail, Globe, Award } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">SecureWipe</h3>
                <p className="text-sm opacity-75">NIST Compliant</p>
              </div>
            </div>
            <p className="text-sm opacity-90 leading-relaxed mb-6">
              Empowering India's circular economy through secure, verifiable data sanitization. 
              Building trust in IT asset recycling with military-grade security standards.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4" />
              <span className="opacity-90">SIH 2024 Innovation</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-3 text-sm opacity-90">
              <li><a href="#dashboard" className="hover:opacity-100 transition-opacity">Dashboard</a></li>
              <li><a href="#verify" className="hover:opacity-100 transition-opacity">Verify Certificate</a></li>
              <li><a href="#compliance" className="hover:opacity-100 transition-opacity">Compliance</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">API Documentation</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Enterprise Solutions</a></li>
            </ul>
          </div>

          {/* Standards & Compliance */}
          <div>
            <h4 className="font-semibold mb-4">Standards</h4>
            <ul className="space-y-3 text-sm opacity-90">
              <li><a href="#" className="hover:opacity-100 transition-opacity">NIST SP 800-88 Rev. 1</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">DoD 5220.22-M</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">GDPR Compliance</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">ISO 27001</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Certification Guide</a></li>
            </ul>
          </div>

          {/* Contact & Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 text-sm opacity-90 mb-6">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Documentation</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">White Papers</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Case Studies</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Support Center</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Training Videos</a></li>
            </ul>

            <div className="space-y-3">
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 p-2">
                  <Github className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 p-2">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 p-2">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 p-2">
                  <Globe className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm opacity-75">
              <p>&copy; 2024 SecureWipe. Built for Smart India Hackathon 2024.</p>
              <p className="mt-1">Addressing India's ₹50,000 crore e-waste challenge through secure data sanitization.</p>
            </div>
            
            <div className="flex items-center gap-6 text-sm opacity-75">
              <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Security</a>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs opacity-60">
            <p>This solution addresses the critical need for trustworthy IT asset recycling in India's circular economy initiative.</p>
            <p className="mt-1">Built with React, TypeScript, and Tailwind CSS. Designed for cross-platform deployment.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;