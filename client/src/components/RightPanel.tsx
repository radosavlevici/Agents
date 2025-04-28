import { 
  CheckCircleIcon, 
  WarningCircleIcon, 
  DNASecurityIcon, 
  ChevronDownIcon 
} from "./ui/Icons";

const RightPanel = () => {
  return (
    <div className="bg-terminal-panel-bg p-4 rounded border border-gray-700">
      <div className="text-terminal-cyan font-bold mb-4">SYSTEM STATUS</div>
      
      <div className="flex items-center mb-3">
        <CheckCircleIcon className="w-5 h-5 mr-2" />
        <span className="text-white">System Integration</span>
        <span className="ml-auto text-terminal-green">ACTIVE</span>
      </div>
      
      <div className="flex items-center mb-3">
        <CheckCircleIcon className="w-5 h-5 mr-2" />
        <span className="text-white">Reset Workflow</span>
        <span className="ml-auto text-terminal-green">ACTIVE</span>
      </div>
      
      <div className="flex items-center mb-3">
        <CheckCircleIcon className="w-5 h-5 mr-2" />
        <span className="text-white">Development Enabler</span>
        <span className="ml-auto text-terminal-green">ACTIVE</span>
      </div>
      
      <div className="flex items-center mb-3">
        <WarningCircleIcon className="w-5 h-5 mr-2" />
        <span className="text-white">DNA-Protected</span>
        <span className="ml-auto">
          <ChevronDownIcon className="w-4 h-4" />
        </span>
      </div>
      
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
      
      <div className="flex items-center mb-1">
        <CheckCircleIcon className="w-5 h-5 mr-2" />
        <span className="text-terminal-green">Simultaneous</span>
        <span className="ml-auto text-terminal-green">ACTIVE</span>
      </div>
    </div>
  );
};

export default RightPanel;
