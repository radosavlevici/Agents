import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import QuantumTerminalLayout from "@/components/QuantumTerminalLayout";

type SecurityService = {
  id: number;
  name: string;
  description: string;
  price: string;
  active: boolean;
};

export default function SecurityServices() {
  const { toast } = useToast();
  
  const { data: services = [], isLoading, error } = useQuery<SecurityService[]>({
    queryKey: ['/api/services'],
    staleTime: 60000, // 1 minute
  });

  const handleBuyService = (service: SecurityService) => {
    // In a real app, this would trigger an API call to purchase the service
    toast({
      title: "Security Service Activated",
      description: `${service.name} has been added to your account.`,
    });
  };

  return (
    <QuantumTerminalLayout title="Security Services">
      <div className="text-terminal-cyan font-bold mb-4 text-xl">AVAILABLE SECURITY SERVICES</div>
      
      {isLoading ? (
        <div className="terminal-line text-terminal-cyan">Scanning available services...</div>
      ) : error ? (
        <div className="terminal-line text-terminal-red">Error loading security services</div>
      ) : services.length === 0 ? (
        <div className="terminal-line text-terminal-amber">No security services available at this time</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-terminal-dark-bg border border-gray-700 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <div className="text-terminal-green font-bold">{service.name}</div>
                <Badge variant="outline" className={service.active ? "bg-green-900/20 text-terminal-green" : "bg-red-900/20 text-terminal-red"}>
                  {service.active ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </div>
              <div className="text-terminal-gray mb-3">{service.description}</div>
              <div className="flex justify-between items-center">
                <div className="text-terminal-amber">${service.price}</div>
                <Button
                  variant="outline"
                  className="border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:bg-opacity-20"
                  onClick={() => handleBuyService(service)}
                >
                  Activate
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </QuantumTerminalLayout>
  );
}