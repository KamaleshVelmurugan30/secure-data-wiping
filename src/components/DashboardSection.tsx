import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  HardDrive, 
  Shield, 
  Download, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Cpu,
  Clock,
  FileText
} from "lucide-react";

interface DetectedDevice {
  id: string;
  name: string;
  type: "HDD" | "SSD" | "USB";
  size: string;
  status: "ready" | "wiping" | "complete";
  progress?: number;
}

const DashboardSection = () => {
  const [devices] = useState<DetectedDevice[]>([
    { id: "1", name: "Samsung SSD 970 EVO", type: "SSD", size: "500 GB", status: "ready" },
    { id: "2", name: "Western Digital HDD", type: "HDD", size: "1 TB", status: "wiping", progress: 65 },
    { id: "3", name: "SanDisk USB Drive", type: "USB", size: "32 GB", status: "complete" },
  ]);

  const [wipingLevel, setWipingLevel] = useState<"clear" | "purge" | "destroy">("purge");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return <AlertCircle className="h-4 w-4 text-warning" />;
      case "wiping": return <Shield className="h-4 w-4 text-primary animate-spin" />;
      case "complete": return <CheckCircle className="h-4 w-4 text-accent" />;
      default: return <HardDrive className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-warning/10 text-warning border-warning/20";
      case "wiping": return "bg-primary/10 text-primary border-primary/20";
      case "complete": return "bg-accent/10 text-accent border-accent/20";
      default: return "bg-muted/10 text-muted-foreground";
    }
  };

  return (
    <section id="dashboard" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Secure Wipe Dashboard</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            One-click data sanitization with real-time monitoring and NIST compliance verification
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Device Detection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-secure">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-primary" />
                  Detected Storage Devices
                </CardTitle>
                <CardDescription>
                  Automatically detected storage devices ready for secure sanitization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="p-4 border border-border rounded-lg hover:bg-muted/5 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{device.name}</h4>
                          <p className="text-sm text-muted-foreground">{device.size} • {device.type}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(device.status)}>
                        {getStatusIcon(device.status)}
                        {device.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {device.status === "wiping" && device.progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-primary font-medium">{device.progress}%</span>
                        </div>
                        <Progress value={device.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Estimated time remaining: {Math.round((100 - device.progress) / 10)} minutes
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Wiping Controls */}
            <Card className="shadow-secure">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Sanitization Control
                </CardTitle>
                <CardDescription>
                  Select NIST SP 800-88 Rev. 1 compliant sanitization level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { level: "clear", title: "Clear", desc: "Logical techniques", time: "5-15 min" },
                    { level: "purge", title: "Purge", desc: "Lab-resistant", time: "30-60 min" },
                    { level: "destroy", title: "Destroy", desc: "Complete destruction", time: "60+ min" }
                  ].map((option) => (
                    <div
                      key={option.level}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        wipingLevel === option.level 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setWipingLevel(option.level as any)}
                    >
                      <h4 className="font-medium text-foreground mb-1">{option.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{option.desc}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {option.time}
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  size="lg" 
                  className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Secure Wipe Process
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Status & Stats */}
          <div className="space-y-6">
            <Card className="shadow-secure">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">CPU Usage</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Memory Usage</span>
                    <span className="text-sm font-medium">32%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span className="text-accent font-medium">System Ready</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All systems operational for secure wiping
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-secure">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Certificates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { device: "Samsung SSD", date: "2024-01-15", id: "CERT-001" },
                  { device: "WD HDD", date: "2024-01-14", id: "CERT-002" },
                  { device: "USB Drive", date: "2024-01-13", id: "CERT-003" }
                ].map((cert, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/5 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{cert.device}</p>
                      <p className="text-xs text-muted-foreground">{cert.date}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;