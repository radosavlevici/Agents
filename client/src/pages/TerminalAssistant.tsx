import { useState, useEffect } from "react";
import QuantumTerminalLayout from "@/components/QuantumTerminalLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function TerminalAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([
    {text: "Hello Ervin, I am your personal Quantum Assistant linked to ervin210@icloud.com. How can I help you today?", isUser: false},
  ]);
  const [isMobileConnected, setIsMobileConnected] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [securityLevel, setSecurityLevel] = useState("maximum");
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiConnectionStatus, setApiConnectionStatus] = useState<"connecting" | "connected" | "failed" | "idle">("idle");
  
  // Device information
  const deviceInfo = {
    serialNumber: "D2VMW6RNW2",
    modelNumber: "MU773ZD/A",
    deviceType: "iPhone",
    lastBackup: "Today, 14:32",
    batteryStatus: "87%",
    osVersion: "iOS 17.4.1"
  };
  
  // API connection information
  const apiInfo = {
    endpoints: [
      { name: "Security Scanner", url: "api.quantum-scanner.com", status: "active" },
      { name: "Device Monitor", url: "monitor.quantum-terminal.net", status: "active" },
      { name: "Emergency Services", url: "emergency.quantum-terminal.net", status: "standby" },
      { name: "iCloud Integration", url: "api.icloud-connect.com", status: "active" }
    ],
    authMethod: "OAuth2",
    lastSyncTime: new Date().toISOString()
  };
  const { toast } = useToast();

  // Simulate connecting to iCloud
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileConnected(true);
      toast({
        title: "iCloud Connection Established",
        description: "Your assistant is now synced with ervin210@icloud.com",
      });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  // Function to connect to API endpoints
  const connectToApi = () => {
    setApiConnectionStatus("connecting");
    toast({
      title: "Connecting to API endpoints",
      description: "Establishing secure connections to external services..."
    });
    
    // Simulate API connection process
    setTimeout(() => {
      setApiConnected(true);
      setApiConnectionStatus("connected");
      
      toast({
        title: "API Connection Successful",
        description: `Connected to ${apiInfo.endpoints.length} endpoints using ${apiInfo.authMethod}`
      });
      
      setMessages(prev => [
        ...prev,
        {
          text: `API connection established. Connected to ${apiInfo.endpoints.length} service endpoints:\n` +
                apiInfo.endpoints.map(endpoint => `- ${endpoint.name} (${endpoint.url}): ${endpoint.status}`).join('\n'),
          isUser: false
        }
      ]);
    }, 2500);
  };

  // Handle emergency mode activation
  const handleEmergencyMode = () => {
    setEmergencyMode(true);
    toast({
      title: "EMERGENCY MODE ACTIVATED",
      description: "Emergency protocols initiated. Contacting emergency services.",
      variant: "destructive"
    });
    
    // Add emergency message to chat
    setMessages(prev => [
      ...prev, 
      {
        text: "EMERGENCY MODE ACTIVATED. Location tracking enabled. Emergency contacts notified. Sending device information to emergency services.", 
        isUser: false
      }
    ]);
    
    // Simulate emergency response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        {
          text: `Device information sent: iPhone (${deviceInfo.modelNumber}), Serial: ${deviceInfo.serialNumber}. Approximate location data transmitted to emergency services.`, 
          isUser: false
        }
      ]);
    }, 3000);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, {text: input, isUser: true}]);
    
    // Simulate AI response
    setTimeout(() => {
      let response = "I'm processing your request. As your personal Quantum Assistant, I'm here to help with any tasks for ervin210@icloud.com.";
      
      // Check for emergency keywords first
      if (emergencyMode || input.toLowerCase().includes("emergency") || input.toLowerCase().includes("help") || input.toLowerCase().includes("sos")) {
        if (!emergencyMode) {
          setEmergencyMode(true);
          response = "EMERGENCY MODE ACTIVATED. Sending your device information (iPhone MU773ZD/A, Serial: D2VMW6RNW2) and location to emergency services. Stay on this channel for updates.";
        } else {
          response = "Emergency services have been notified. Your location is being tracked. Please stay in place if possible. Help is on the way.";
        }
      }
      // Check for API connection commands
      else if (input.toLowerCase().includes("api") || input.toLowerCase().includes("connect api") || input.toLowerCase().includes("external")) {
        if (!apiConnected) {
          response = "I'll establish connection to the API endpoints for enhanced functionality. Initiating connection now...";
          // Trigger API connection process
          connectToApi();
        } else {
          const statusList = apiInfo.endpoints.map(endpoint => 
            `- ${endpoint.name}: ${endpoint.status === 'active' ? '✓ Online' : '⚠️ Standby'}`
          ).join('\n');
          
          response = `API connection is already active. Currently connected to ${apiInfo.endpoints.length} endpoints:\n${statusList}\n\nLast sync: ${new Date(apiInfo.lastSyncTime).toLocaleTimeString()}`;
        }
      }
      // Enhanced keyword matching for iCloud integration demonstration
      else if (input.toLowerCase().includes("email") || input.toLowerCase().includes("icloud")) {
        response = "Your iCloud email (ervin210@icloud.com) is secure. Last login was from your usual location. No suspicious activities detected. Would you like me to scan for potential phishing attempts?";
      } else if (input.toLowerCase().includes("phone") || input.toLowerCase().includes("mobile") || input.toLowerCase().includes("device")) {
        response = `Your iPhone (${deviceInfo.modelNumber}, SN:${deviceInfo.serialNumber}) is currently connected and secured. Battery level is at ${deviceInfo.batteryStatus}. Running ${deviceInfo.osVersion}. Last backup: ${deviceInfo.lastBackup}. Would you like me to run a security scan?`;
      } else if (input.toLowerCase().includes("scan") || input.toLowerCase().includes("security")) {
        if (!apiConnected) {
          response = `I'll need to connect to our security API endpoints first to perform a comprehensive scan. Type "connect API" to establish the connection.`;
        } else {
          response = `Initiating comprehensive security scan for your iPhone ${deviceInfo.modelNumber} and all devices linked to ervin210@icloud.com. This will check for vulnerabilities, malware, and unauthorized access attempts. I'll notify you when complete.`;
        }
      } else if (input.toLowerCase().includes("alert") || input.toLowerCase().includes("warning")) {
        response = "You have 2 active security notices: 1) A new device logged into your Apple account from Los Angeles yesterday. 2) 3 failed login attempts on your iCloud Drive. Would you like me to lock down your account temporarily?";
      } else if (input.toLowerCase().includes("photos") || input.toLowerCase().includes("files")) {
        response = "Your iCloud storage is currently at 68% capacity. You have 1,247 photos, 86 videos, and 312 documents stored. Would you like me to analyze for duplicate files or suggest storage optimization?";
      } else if (input.toLowerCase().includes("backup") || input.toLowerCase().includes("sync")) {
        response = `Your last iCloud backup was completed at ${deviceInfo.lastBackup}. All devices are synced and up to date. Critical data is secured with end-to-end encryption.`;
      } else if (input.toLowerCase().includes("serial") || input.toLowerCase().includes("model")) {
        response = `Your device information:\nModel: ${deviceInfo.modelNumber}\nSerial Number: ${deviceInfo.serialNumber}\nDevice Type: ${deviceInfo.deviceType}\nOS Version: ${deviceInfo.osVersion}`;
      } else if (input.toLowerCase().includes("endpoint") || input.toLowerCase().includes("service")) {
        if (!apiConnected) {
          response = "External service endpoints are not currently connected. Would you like to connect to the API services?";
        } else {
          response = `Currently connected to the following service endpoints:\n` +
                     apiInfo.endpoints.map(ep => `- ${ep.name} (${ep.url}): ${ep.status}`).join('\n');
        }
      }
      
      setMessages(prev => [...prev, {text: response, isUser: false}]);
    }, 1200);
    
    // Clear input
    setInput("");
  };

  const handleActivateNotifications = () => {
    toast({
      title: "Assistant Notifications Activated",
      description: "You will receive security notifications from your Quantum Terminal Assistant on all devices linked to ervin210@icloud.com.",
    });
  };
  
  const handleToggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    toast({
      title: voiceEnabled ? "Voice Interface Disabled" : "Voice Interface Enabled",
      description: voiceEnabled 
        ? "Text-only mode activated" 
        : "Voice commands are now active for ervin210@icloud.com",
    });
  };

  return (
    <QuantumTerminalLayout title="Personal Assistant">
      <div className="flex flex-col h-[calc(100vh-300px)] max-h-[600px]">
        <div className={`bg-terminal-dark-bg p-4 rounded-t border ${emergencyMode ? 'border-red-700 border-2' : 'border-gray-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`text-lg font-bold ${emergencyMode ? 'text-terminal-red animate-pulse' : 'text-terminal-cyan'}`}>
                {emergencyMode ? 'EMERGENCY MODE' : 'QUANTUM ASSISTANT'}
              </div>
              {emergencyMode && (
                <div className="bg-terminal-red px-2 py-1 rounded text-xs text-black animate-pulse">
                  SOS ACTIVE
                </div>
              )}
            </div>
            <div className="flex flex-col items-end">
              <div className="text-terminal-green text-sm">User: ervin210@icloud.com</div>
              <div className="flex items-center gap-1">
                <div className={`text-xs ${isMobileConnected ? 'text-terminal-green' : 'text-terminal-amber'}`}>
                  {isMobileConnected ? 'iPhone Connected ✓' : 'Connecting to mobile...'}
                </div>
                {isMobileConnected && (
                  <div className="text-terminal-gray text-xs">
                    ({deviceInfo.modelNumber}, SN:{deviceInfo.serialNumber})
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="text-terminal-gray text-xs">Voice Commands:</div>
                <Switch 
                  checked={voiceEnabled} 
                  onCheckedChange={handleToggleVoice} 
                  className="data-[state=checked]:bg-terminal-purple" 
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:bg-opacity-20 text-xs"
                  onClick={() => {
                    toast({
                      title: "Mobile Sync Active",
                      description: "The assistant will appear on your mobile device.",
                    });
                  }}
                >
                  Sync to iPhone
                </Button>
                <Button 
                  variant="outline" 
                  className="border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:bg-opacity-20 text-xs"
                  onClick={handleActivateNotifications}
                >
                  Activate Notifications
                </Button>
              </div>
            </div>
            
            {!emergencyMode && (
              <Button 
                variant="destructive"
                onClick={handleEmergencyMode}
                className="bg-terminal-red text-white hover:bg-terminal-red/80 font-bold text-sm"
              >
                EMERGENCY - PRESS FOR ASSISTANCE
              </Button>
            )}
            
            {emergencyMode && (
              <div className="flex justify-between items-center bg-red-900/30 p-2 rounded border border-red-700">
                <div className="text-terminal-red text-sm animate-pulse font-bold">
                  EMERGENCY MODE ACTIVE
                </div>
                <div className="text-white text-xs">
                  Location tracking: ACTIVE | Device info transmitted
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className={`flex-1 bg-terminal-panel-bg p-4 overflow-y-auto border-l border-r ${emergencyMode ? 'border-red-700' : 'border-gray-700'}`}>
          {messages.map((msg, index) => {
            // Determine if this message is an emergency message
            const isEmergencyMsg = !msg.isUser && msg.text.includes("EMERGENCY MODE");
            
            return (
              <div key={index} className={`mb-4 ${msg.isUser ? 'text-right' : ''}`}>
                <div className={`inline-block p-3 rounded-lg ${
                  msg.isUser 
                    ? 'bg-terminal-dark-bg text-terminal-green border border-terminal-green' 
                    : isEmergencyMsg
                      ? 'bg-red-950 text-terminal-red border border-terminal-red animate-pulse'
                      : 'bg-black bg-opacity-40 text-terminal-cyan border border-terminal-cyan'
                }`}>
                  {msg.text.split('\n').map((text, i) => (
                    <div key={i}>{text}</div>
                  ))}
                </div>
                {isEmergencyMsg && (
                  <div className="text-xs text-terminal-red mt-1">
                    Device: {deviceInfo.deviceType} {deviceInfo.modelNumber} (SN: {deviceInfo.serialNumber})
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="bg-terminal-dark-bg p-4 rounded-b border border-t-0 border-gray-700">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={voiceEnabled ? "Speak or type your message..." : "Type your message here..."}
                  className="bg-transparent border-gray-700 text-white pr-8"
                />
                {voiceEnabled && (
                  <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full ${
                    input ? 'bg-terminal-red' : 'bg-terminal-purple'
                  }`}>
                    <div className="absolute inset-0 rounded-full animate-ping bg-purple-500 opacity-50"></div>
                  </div>
                )}
              </div>
              <Button 
                onClick={handleSendMessage}
                className="bg-terminal-cyan text-black hover:bg-terminal-cyan/80"
              >
                Send
              </Button>
            </div>
            
            {voiceEnabled && (
              <div className="text-center text-terminal-purple text-xs italic">
                {input ? 'Voice detected: "' + input + '"' : 'Listening for voice commands...'}
              </div>
            )}
            
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between items-center text-xs text-terminal-gray">
                <div>Connected to iCloud account: ervin210@icloud.com</div>
                {isMobileConnected && (
                  <div className="text-terminal-green">iPhone sync active</div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    apiConnectionStatus === "connected" ? "bg-terminal-green" : 
                    apiConnectionStatus === "connecting" ? "bg-terminal-amber animate-pulse" :
                    apiConnectionStatus === "failed" ? "bg-terminal-red" : "bg-terminal-gray"
                  }`}></div>
                  <div className="text-xs text-terminal-gray">
                    API Status: {
                      apiConnectionStatus === "connected" ? "Connected" : 
                      apiConnectionStatus === "connecting" ? "Connecting..." :
                      apiConnectionStatus === "failed" ? "Connection Failed" : "Not Connected"
                    }
                  </div>
                </div>
                
                {!apiConnected && apiConnectionStatus !== "connecting" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 px-2 border-terminal-cyan text-terminal-cyan"
                    onClick={connectToApi}
                  >
                    Connect API
                  </Button>
                )}
                
                {apiConnected && (
                  <div className="text-xs text-terminal-green">
                    {apiInfo.endpoints.filter(e => e.status === 'active').length} services online
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </QuantumTerminalLayout>
  );
}