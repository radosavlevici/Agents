import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import NavigationBar from "./NavigationBar";

const TerminalMain = () => {
  return (
    <div className="terminal-screen p-1 screen-flicker">
      {/* Scan line effect */}
      <div className="scan-line absolute top-0 left-0 w-full h-8 z-10"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
        <LeftPanel />
        <RightPanel />
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default TerminalMain;
