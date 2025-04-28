import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import QuantumTerminalLayout from "@/components/QuantumTerminalLayout";

type SecurityAlert = {
  id: number;
  userId: number;
  level: string;
  message: string;
  source: string;
  timestamp: string;
  resolved: boolean;
};

export default function SecurityAlerts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // For demo purposes, we'll use user ID 1
  const userId = 1;
  
  const { data: alerts = [], isLoading } = useQuery<SecurityAlert[]>({
    queryKey: ['/api/alerts', { userId }],
  });
  
  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest("PATCH", `/api/alerts/${alertId}/resolve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "Alert Resolved",
        description: "The security alert has been marked as resolved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Action Failed",
        description: `Failed to resolve alert: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };
  
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical": return "text-terminal-red";
      case "high": return "text-red-400";
      case "medium": return "text-terminal-amber";
      case "low": return "text-yellow-400";
      case "info": return "text-terminal-green";
      default: return "text-white";
    }
  };
  
  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);
  
  return (
    <QuantumTerminalLayout title="Security Alerts">
      <div className="text-terminal-cyan font-bold mb-4 text-xl">SECURITY ALERT CENTER</div>
      
      <div className="mb-6">
        <div className="text-terminal-red font-bold mb-3">ACTIVE ALERTS ({activeAlerts.length})</div>
        
        {isLoading ? (
          <div className="terminal-line text-terminal-cyan">Scanning for security alerts...</div>
        ) : activeAlerts.length === 0 ? (
          <div className="bg-terminal-dark-bg p-4 rounded border border-gray-700">
            <div className="text-terminal-green">No active security alerts. All systems secure.</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="bg-terminal-dark-bg p-4 rounded border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div className={`${getLevelColor(alert.level)} font-bold`}>
                    {alert.level.toUpperCase()} ALERT
                  </div>
                  <Badge className="bg-red-900/20 text-terminal-red border-current">
                    ACTIVE
                  </Badge>
                </div>
                <div className="mb-3 text-white">{alert.message}</div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <div className="text-terminal-gray">Source: {alert.source}</div>
                    <div className="text-terminal-gray">Detected: {formatDate(alert.timestamp)}</div>
                  </div>
                  <Button 
                    className="bg-terminal-amber text-black hover:bg-terminal-amber/80"
                    onClick={() => resolveAlertMutation.mutate(alert.id)}
                    disabled={resolveAlertMutation.isPending}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {resolvedAlerts.length > 0 && (
        <div>
          <div className="text-terminal-green font-bold mb-3">RESOLVED ALERTS ({resolvedAlerts.length})</div>
          <div className="grid gap-2">
            {resolvedAlerts.map((alert) => (
              <div key={alert.id} className="bg-terminal-dark-bg p-3 rounded border border-gray-700 opacity-70">
                <div className="flex justify-between items-start mb-1">
                  <div className={`${getLevelColor(alert.level)} font-bold text-sm`}>
                    {alert.level.toUpperCase()}
                  </div>
                  <Badge className="bg-green-900/20 text-terminal-green border-current text-xs">
                    RESOLVED
                  </Badge>
                </div>
                <div className="mb-1 text-sm text-terminal-gray">{alert.message}</div>
                <div className="text-xs text-terminal-gray">{formatDate(alert.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </QuantumTerminalLayout>
  );
}