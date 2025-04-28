import { ReactNode, useEffect } from "react";
import TerminalHeader from "./TerminalHeader";
import NavigationBar from "./NavigationBar";
import { Link } from "wouter";

interface QuantumTerminalLayoutProps {
  children: ReactNode;
  title?: string;
}

const QuantumTerminalLayout = ({ children, title }: QuantumTerminalLayoutProps) => {
  useEffect(() => {
    // Add random blinking effect to terminal
    const blinkingInterval = setInterval(() => {
      const terminal = document.querySelector('.terminal-screen');
      if (terminal && Math.random() > 0.97) {
        terminal.classList.add('opacity-80');
        setTimeout(() => {
          terminal.classList.remove('opacity-80');
        }, 100);
      }
    }, 500);

    return () => {
      clearInterval(blinkingInterval);
    };
  }, []);

  return (
    <div className="bg-terminal-bg min-h-screen font-mono">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <TerminalHeader />
        
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg text-terminal-cyan font-bold typing-effect">
            v4.0 {title ? `// ${title}` : ''}
          </div>
          
          <Link href="/">
            <div className="text-terminal-green hover:text-terminal-cyan text-sm underline cursor-pointer">
              Return to Main Terminal
            </div>
          </Link>
        </div>
        
        <div className="terminal-screen p-4 screen-flicker">
          {/* Scan line effect */}
          <div className="scan-line absolute top-0 left-0 w-full h-8 z-10"></div>
          
          <div className="relative z-20">
            {children}
          </div>
          
          <NavigationBar />
        </div>
      </div>
    </div>
  );
};

export default QuantumTerminalLayout;