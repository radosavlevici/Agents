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

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, {text: input, isUser: true}]);
    
    // Simulate AI response
    setTimeout(() => {
      let response = "I'm processing your request. As your personal Quantum Assistant, I'm here to help with any tasks for ervin210@icloud.com.";
      
      // Enhanced keyword matching for iCloud integration demonstration
      if (input.toLowerCase().includes("email") || input.toLowerCase().includes("icloud")) {
        response = "Your iCloud email (ervin210@icloud.com) is secure. Last login was from your usual location. No suspicious activities detected. Would you like me to scan for potential phishing attempts?";
      } else if (input.toLowerCase().includes("phone") || input.toLowerCase().includes("mobile")) {
        response = "Your mobile device is currently connected and secured. All 23 applications are up to date. Battery level is at 87%. Would you like me to run a security scan on your phone?";
      } else if (input.toLowerCase().includes("scan") || input.toLowerCase().includes("security")) {
        response = "Initiating comprehensive security scan for all your devices linked to ervin210@icloud.com. This will check for vulnerabilities, malware, and unauthorized access attempts. I'll notify you when complete.";
      } else if (input.toLowerCase().includes("alert") || input.toLowerCase().includes("warning")) {
        response = "You have 2 active security notices: 1) A new device logged into your Apple account from Los Angeles yesterday. 2) 3 failed login attempts on your iCloud Drive. Would you like me to lock down your account temporarily?";
      } else if (input.toLowerCase().includes("photos") || input.toLowerCase().includes("files")) {
        response = "Your iCloud storage is currently at 68% capacity. You have 1,247 photos, 86 videos, and 312 documents stored. Would you like me to analyze for duplicate files or suggest storage optimization?";
      } else if (input.toLowerCase().includes("backup") || input.toLowerCase().includes("sync")) {
        response = "Your last iCloud backup was completed 6 hours ago. All devices are synced and up to date. Critical data is secured with end-to-end encryption.";
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
        <div className="bg-terminal-dark-bg p-4 rounded-t border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="text-terminal-cyan font-bold">QUANTUM ASSISTANT</div>
            <div className="flex flex-col items-end">
              <div className="text-terminal-green text-sm">User: ervin210@icloud.com</div>
              <div className={`text-xs ${isMobileConnected ? 'text-terminal-green' : 'text-terminal-amber'}`}>
                {isMobileConnected ? 'iPhone Connected ✓' : 'Connecting to mobile...'}
              </div>
            </div>
          </div>
          
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
        </div>
        
        <div className="flex-1 bg-terminal-panel-bg p-4 overflow-y-auto border-l border-r border-gray-700">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.isUser ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-lg ${
                msg.isUser 
                  ? 'bg-terminal-dark-bg text-terminal-green border border-terminal-green' 
                  : 'bg-black bg-opacity-40 text-terminal-cyan border border-terminal-cyan'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
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
            
            <div className="flex justify-between items-center mt-1 text-xs text-terminal-gray">
              <div>Connected to iCloud account: ervin210@icloud.com</div>
              {isMobileConnected && (
                <div className="text-terminal-green">iPhone sync active</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </QuantumTerminalLayout>
  );
}