import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, Lock, Award, Globe } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-hero rounded-lg shadow-secure">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SecureWipe</h1>
              <p className="text-xs text-muted-foreground">NIST Compliant</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </a>
            <a href="#verify" className="text-muted-foreground hover:text-foreground transition-colors">
              Verify Certificate
            </a>
            <a href="#compliance" className="text-muted-foreground hover:text-foreground transition-colors">
              Compliance
            </a>
            <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
              <Lock className="h-4 w-4 mr-2" />
              Secure Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col space-y-4">
              <a href="#dashboard" className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
                Dashboard
              </a>
              <a href="#verify" className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
                Verify Certificate
              </a>
              <a href="#compliance" className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
                Compliance
              </a>
              <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
                <Lock className="h-4 w-4 mr-2" />
                Secure Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;