import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import DashboardSection from "@/components/DashboardSection";
import VerificationSection from "@/components/VerificationSection";
import ComplianceSection from "@/components/ComplianceSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <DashboardSection />
      <VerificationSection />
      <ComplianceSection />
      <Footer />
    </div>
  );
};

export default Index;