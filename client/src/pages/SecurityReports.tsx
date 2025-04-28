import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import QuantumTerminalLayout from "@/components/QuantumTerminalLayout";

type SecurityReport = {
  id: number;
  userId: number;
  title: string;
  summary: string;
  createdAt: string;
  threatLevel: string;
};

export default function SecurityReports() {
  // For demo purposes, we'll use user ID 1
  const userId = 1;
  
  const { data: reports = [], isLoading } = useQuery<SecurityReport[]>({
    queryKey: ['/api/reports', { userId }],
  });
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical": return "text-terminal-red";
      case "high": return "text-red-400";
      case "medium": return "text-terminal-amber";
      case "low": return "text-yellow-400";
      case "none": return "text-terminal-green";
      default: return "text-white";
    }
  };
  
  return (
    <QuantumTerminalLayout title="Security Reports">
      <div className="text-terminal-cyan font-bold mb-4 text-xl">SECURITY REPORTS</div>
      
      {isLoading ? (
        <div className="terminal-line text-terminal-cyan">Retrieving security reports...</div>
      ) : reports.length === 0 ? (
        <div className="bg-terminal-dark-bg p-6 rounded border border-gray-700 text-center">
          <div className="text-terminal-amber font-bold mb-3">No Security Reports Available</div>
          <div className="text-terminal-gray mb-4">Security reports will be generated after completing security scans.</div>
          <Button 
            className="bg-terminal-cyan text-black hover:bg-terminal-cyan/80"
          >
            Initiate Security Scan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-terminal-dark-bg p-4 rounded border border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div className="text-terminal-green font-bold">{report.title}</div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getThreatLevelColor(report.threatLevel)} border-current`}>
                    {report.threatLevel.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-terminal-gray">{formatDate(report.createdAt)}</div>
                </div>
              </div>
              
              <div className="mb-4 text-terminal-gray">{report.summary}</div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  className="border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:bg-opacity-20"
                >
                  Download PDF
                </Button>
                <Button 
                  variant="outline"
                  className="border-terminal-green text-terminal-green hover:bg-terminal-green hover:bg-opacity-20"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 bg-terminal-panel-bg p-4 rounded border border-gray-700">
        <div className="text-terminal-cyan font-bold mb-3">SCHEDULED REPORTS</div>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-white">Weekly Security Summary</div>
            <div className="text-terminal-gray text-sm">Next report: Monday, May 5, 2025</div>
          </div>
          <Badge className="bg-green-900/20 text-terminal-green">ACTIVE</Badge>
        </div>
      </div>
    </QuantumTerminalLayout>
  );
}