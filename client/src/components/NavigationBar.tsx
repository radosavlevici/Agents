import { useLocation, Link } from "wouter";
import {
  GridIcon,
  ScreenIcon,
  CircleNetworkIcon,
  ClockIcon,
  CrossIcon,
  TerminalIcon,
  DNASecurityIcon
} from "./ui/Icons";

const NavigationBar = () => {
  const [location] = useLocation();
  
  const navItems = [
    { icon: GridIcon, path: "/services", tooltip: "Security Services" },
    { icon: ScreenIcon, path: "/scans", tooltip: "Security Scans" },
    { icon: CircleNetworkIcon, path: "/alerts", tooltip: "Security Alerts" },
    { icon: ClockIcon, path: "/reports", tooltip: "Security Reports" },
    { icon: CrossIcon, path: "/settings", tooltip: "Settings" }
  ];
  
  // Special case for the assistant route
  const assistantPath = "/assistant";
  
  return (
    <div className="flex justify-around py-3 mt-4 border-t border-gray-700">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = location === item.path;
        
        return (
          <Link key={index} href={item.path}>
            <div className={`p-2 rounded transition-colors border cursor-pointer ${
              isActive 
                ? 'bg-terminal-panel-bg border-terminal-cyan' 
                : 'bg-terminal-dark-bg hover:bg-terminal-panel-bg border-gray-700'
            }`}
            title={item.tooltip}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-terminal-cyan' : ''}`} />
            </div>
          </Link>
        );
      })}
      
      <Link href={assistantPath}>
        <div className={`p-2 rounded transition-colors border cursor-pointer ${
          location === assistantPath 
            ? 'bg-terminal-panel-bg border-terminal-purple' 
            : 'bg-terminal-dark-bg hover:bg-terminal-panel-bg border-gray-700'
        }`}
        title="Quantum Assistant">
          <svg viewBox="0 0 24 24" className={`w-5 h-5 ${location === assistantPath ? 'text-terminal-purple' : ''}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.35 9.65V11.35C4.35 15.57 7.78 19 12 19C16.22 19 19.65 15.57 19.65 11.35V9.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.61 6.43C11.51 6.1 12.49 6.1 13.39 6.43" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.2 8.55C11.73 8.41 12.28 8.41 12.81 8.55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </Link>
    </div>
  );
};

export default NavigationBar;
