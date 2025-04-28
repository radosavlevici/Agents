import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import QuantumTerminalLayout from "@/components/QuantumTerminalLayout";

type SecurityScan = {
  id: number;
  userId: number;
  scanType: string;
  status: string;
  result: string | null;
  startedAt: string;
  completedAt: string | null;
};

export default function SecurityScans() {
  const [selectedScanType, setSelectedScanType] = useState("system");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // For demo purposes, we'll use user ID 1
  const userId = 1;
  
  const { data: scans = [], isLoading } = useQuery<SecurityScan[]>({
    queryKey: ['/api/scans', { userId }],
  });
  
  const createScanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/scans", {
        userId,
        scanType: selectedScanType,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scans'] });
      toast({
        title: "Scan Initiated",
        description: `A new ${selectedScanType} scan has been started.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: `Failed to start scan: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const scanTypes = [
    { id: "system", name: "System Scan" },
    { id: "network", name: "Network Scan" },
    { id: "malware", name: "Malware Scan" },
    { id: "vulnerability", name: "Vulnerability Scan" },
  ];
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "text-terminal-green";
      case "pending": return "text-terminal-amber";
      case "failed": return "text-terminal-red";
      case "cancelled": return "text-gray-400";
      default: return "text-white";
    }
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };
  
  return (
    <QuantumTerminalLayout title="Security Scans">
      <div className="text-terminal-cyan font-bold mb-4 text-xl">SECURITY SCAN CENTER</div>
      
      <div className="bg-terminal-dark-bg p-4 rounded border border-gray-700 mb-6">
        <div className="text-terminal-green font-bold mb-2">Initiate New Scan</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {scanTypes.map(type => (
            <Button
              key={type.id}
              variant={selectedScanType === type.id ? "default" : "outline"}
              className={selectedScanType === type.id 
                ? "bg-terminal-cyan text-black hover:bg-terminal-cyan/80" 
                : "border-terminal-gray text-terminal-gray hover:bg-terminal-dark-bg hover:text-terminal-cyan"}
              onClick={() => setSelectedScanType(type.id)}
            >
              {type.name}
            </Button>
          ))}
        </div>
        <Button 
          className="bg-terminal-green text-black hover:bg-terminal-green/80"
          onClick={() => createScanMutation.mutate()}
          disabled={createScanMutation.isPending}
        >
          {createScanMutation.isPending ? "Initializing..." : "Start Scan"}
        </Button>
      </div>
      
      <div className="text-terminal-green font-bold mb-3">SCAN HISTORY</div>
      
      {isLoading ? (
        <div className="terminal-line text-terminal-cyan">Loading scan history...</div>
      ) : scans.length === 0 ? (
        <div className="bg-terminal-dark-bg p-4 rounded border border-gray-700">
          <div className="text-terminal-gray text-center">No scan history available</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {scans.map((scan) => (
            <div key={scan.id} className="bg-terminal-dark-bg p-4 rounded border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div className="text-terminal-cyan font-bold">
                  {scan.scanType.charAt(0).toUpperCase() + scan.scanType.slice(1)} Scan
                </div>
                <Badge className={`${getStatusColor(scan.status)} border-current`}>
                  {scan.status.toUpperCase()}
                </Badge>
              </div>
              <div className="mb-2">
                <div className="text-sm text-terminal-gray">Started: {formatDate(scan.startedAt)}</div>
                {scan.completedAt && (
                  <div className="text-sm text-terminal-gray">Completed: {formatDate(scan.completedAt)}</div>
                )}
              </div>
              {scan.result && (
                <div className="mt-2 p-2 bg-black bg-opacity-50 rounded text-sm">
                  <div className="text-terminal-amber mb-1">Result:</div>
                  <div className="text-terminal-green">{scan.result}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </QuantumTerminalLayout>
  );
}