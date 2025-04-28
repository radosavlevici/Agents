// This file contains all the SVG icons used in the terminal

interface IconProps {
  className?: string;
}

export const TerminalIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16.5L14 12L9 7.5" stroke="#00FFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#00FFFF" strokeWidth="2"/>
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z" stroke="#00FF00" strokeWidth="2"/>
    <path d="M7 10L9 12L13 8" stroke="#00FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const WarningCircleIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z" stroke="#FFA500" strokeWidth="2"/>
    <path d="M10 6V11" stroke="#FFA500" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="10" cy="14" r="1" fill="#FFA500"/>
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const DNASecurityIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2L2 6V8L10 4L18 8V6L10 2Z" fill="#FFA500"/>
    <path d="M2 12L10 16L18 12" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 16L10 20L18 16" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const GridIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="6" height="6" rx="1" stroke="#CCCCCC" strokeWidth="2"/>
    <rect x="11" y="3" width="6" height="6" rx="1" stroke="#CCCCCC" strokeWidth="2"/>
    <rect x="3" y="11" width="6" height="6" rx="1" stroke="#CCCCCC" strokeWidth="2"/>
    <rect x="11" y="11" width="6" height="6" rx="1" stroke="#CCCCCC" strokeWidth="2"/>
  </svg>
);

export const ScreenIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="14" height="12" rx="1" stroke="#CCCCCC" strokeWidth="2"/>
  </svg>
);

export const CircleNetworkIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" stroke="#CCCCCC" strokeWidth="2"/>
    <circle cx="10" cy="10" r="3" stroke="#CCCCCC" strokeWidth="2"/>
    <path d="M10 3V5" stroke="#CCCCCC" strokeWidth="2"/>
    <path d="M10 15V17" stroke="#CCCCCC" strokeWidth="2"/>
    <path d="M3 10H5" stroke="#CCCCCC" strokeWidth="2"/>
    <path d="M15 10H17" stroke="#CCCCCC" strokeWidth="2"/>
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2Z" stroke="#CCCCCC" strokeWidth="2"/>
    <path d="M10 10L14 6" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 5H10V10" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CrossIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2Z" stroke="#CCCCCC" strokeWidth="2"/>
    <path d="M7 7L13 13" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round"/>
    <path d="M13 7L7 13" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
