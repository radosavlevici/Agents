import {
  GridIcon,
  ScreenIcon,
  CircleNetworkIcon,
  ClockIcon,
  CrossIcon
} from "./ui/Icons";

const NavigationBar = () => {
  return (
    <div className="flex justify-around py-3 mt-4 border-t border-gray-700">
      <button className="p-2 rounded bg-terminal-dark-bg hover:bg-terminal-panel-bg transition-colors border border-gray-700">
        <GridIcon className="w-5 h-5" />
      </button>
      
      <button className="p-2 rounded bg-terminal-dark-bg hover:bg-terminal-panel-bg transition-colors border border-gray-700">
        <ScreenIcon className="w-5 h-5" />
      </button>
      
      <button className="p-2 rounded bg-terminal-dark-bg hover:bg-terminal-panel-bg transition-colors border border-gray-700">
        <CircleNetworkIcon className="w-5 h-5" />
      </button>
      
      <button className="p-2 rounded bg-terminal-dark-bg hover:bg-terminal-panel-bg transition-colors border border-gray-700">
        <ClockIcon className="w-5 h-5" />
      </button>
      
      <button className="p-2 rounded bg-terminal-dark-bg hover:bg-terminal-panel-bg transition-colors border border-gray-700">
        <CrossIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default NavigationBar;
