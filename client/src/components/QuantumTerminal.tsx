import { useEffect } from "react";
import TerminalHeader from "./TerminalHeader";
import TerminalMain from "./TerminalMain";

const QuantumTerminal = () => {
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <TerminalHeader />
      
      <div className="text-lg text-terminal-cyan font-bold mb-2 typing-effect">
        v4.0
      </div>
      
      <TerminalMain />
    </div>
  );
};

export default QuantumTerminal;
