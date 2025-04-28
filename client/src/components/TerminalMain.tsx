import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import NavigationBar from "./NavigationBar";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TerminalIcon } from "./ui/Icons";

const TerminalMain = () => {
  return (
    <div className="terminal-screen p-1 screen-flicker">
      {/* Scan line effect */}
      <div className="scan-line absolute top-0 left-0 w-full h-8 z-10"></div>
      
      <div className="relative z-20 p-3">
        {/* Prominent Assistant Button */}
        <div className="mb-6 flex justify-center">
          <Link href="/assistant">
            <Button 
              variant="outline" 
              className="bg-terminal-dark-bg border-purple-500 text-purple-400 hover:bg-purple-900/30 hover:text-purple-300 text-lg flex items-center gap-2 px-8 py-6 animate-pulse"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" className="text-purple-400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.35 9.65V11.35C4.35 15.57 7.78 19 12 19C16.22 19 19.65 15.57 19.65 11.35V9.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.61 6.43C11.51 6.1 12.49 6.1 13.39 6.43" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.2 8.55C11.73 8.41 12.28 8.41 12.81 8.55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 19V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Access Personal Quantum Assistant
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LeftPanel />
          <RightPanel />
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default TerminalMain;
