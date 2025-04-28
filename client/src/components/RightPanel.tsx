import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  CheckCircleIcon, 
  WarningCircleIcon, 
  DNASecurityIcon, 
  ChevronDownIcon 
} from "./ui/Icons";

type SystemStatus = {
  name: string;
  status: string;
};

const RightPanel = () => {
  const [showDnaInfo, setShowDnaInfo] = useState(false);
  
  // Fetch system status from our API
  const { data: systemStatuses = [], isLoading, error } = useQuery<SystemStatus[]>({
    queryKey: ['/api/system/status'],
    staleTime: 60000, // 1 minute
  });

  return (
    <div className="bg-terminal-panel-bg p-4 rounded border border-gray-700">
      <div className="text-terminal-cyan font-bold mb-4">SYSTEM STATUS</div>
      
      {isLoading ? (
        <div className="terminal-line text-terminal-cyan">Loading system status...</div>
      ) : error ? (
        <div className="terminal-line text-terminal-red">Error loading system status</div>
      ) : (
        <>
          {systemStatuses.map((status: SystemStatus, index: number) => (
            <div key={index} className="flex items-center mb-3">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              <span className="text-white">{status.name}</span>
              <span className="ml-auto text-terminal-green">{status.status}</span>
            </div>
          ))}
        </>
      )}
      
      <div className="flex items-center mb-3 cursor-pointer" onClick={() => setShowDnaInfo(!showDnaInfo)}>
        <WarningCircleIcon className="w-5 h-5 mr-2" />
        <span className="text-white">DNA-Protected</span>
        <span className="ml-auto">
          <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${showDnaInfo ? 'rotate-180' : ''}`} />
        </span>
      </div>
      
      {showDnaInfo && (
        <div className="bg-terminal-dark-bg border border-terminal-amber p-3 rounded mb-4">
          <div className="flex items-start mb-2">
            <DNASecurityIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-terminal-amber text-sm">
              This application is protected by DNA-based security systems. Unauthorized use, copying, or modification is strictly prohibited.
            </span>
          </div>
          
          <div className="text-sm mt-3">
            <div className="text-terminal-cyan mb-1">Copyright Information:</div>
            <div className="text-terminal-gray">
              Copyright © Ervin Remus Radosavljevici (01/09/1987) - Email: ervin210@icloud.com - All Rights Reserved.
            </div>
            <div className="text-terminal-gray mt-2">Owner: Ervin Remus Radosavljevici</div>
            <div className="text-terminal-gray">DOB: 01/09/1987</div>
            <div className="text-terminal-gray">Email: ervin210@icloud.com</div>
            <div className="text-terminal-gray">System Version: 4.0</div>
            <div className="text-terminal-gray mt-2">DNA: dna-sig-ajhir-Ervin-m9y...</div>
            <div className="text-terminal-gray mt-2">All components built as one unified security system.</div>
          </div>
        </div>
      )}
      
      {/* Latest alerts - will add real data in the next step */}
      <div className="mt-4">
        <div className="text-terminal-cyan font-bold mb-2">SECURITY ALERTS</div>
        <div className="text-terminal-green text-sm">No active threats detected</div>
        <div className="text-terminal-green text-sm">System integrity: 100%</div>
      </div>
      
      {/* Active scan status indicator */}
      <div className="mt-4 border-t border-gray-700 pt-2">
        <div className="text-terminal-cyan font-bold mb-2">ACTIVE SCANS</div>
        <div className="text-terminal-amber text-sm">Security scan in progress...</div>
        <div className="w-full bg-terminal-dark-bg h-2 mt-1 rounded">
          <div className="bg-terminal-green h-full rounded" style={{ width: '45%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
