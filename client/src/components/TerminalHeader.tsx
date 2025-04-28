import { TerminalIcon } from "./ui/Icons";

const TerminalHeader = () => {
  return (
    <div className="flex justify-between items-center mb-4 px-2">
      <div className="flex items-center">
        <div className="h-6 w-6 mr-2">
          <TerminalIcon />
        </div>
        <div>
          <span className="text-terminal-cyan font-bold text-xl tracking-wide">QUANTUM</span>
          <span className="text-white font-bold text-xl tracking-wide"> TERMINAL</span>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-xs">
        <div className="text-terminal-purple font-bold">
          ultra-<br/>
          <span className="text-terminal-green ml-2">quantum-</span><br/>
          <span className="text-terminal-green ml-2">hybrid</span>
        </div>
        <div className="text-terminal-amber font-bold">
          MAXIMUM<br/>
          SECURITY
        </div>
        <div className="text-terminal-green font-bold">
          DNA<br/>
          PROTECTED
        </div>
      </div>
    </div>
  );
};

export default TerminalHeader;
