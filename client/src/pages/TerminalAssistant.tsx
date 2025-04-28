import { useState } from "react";
import QuantumTerminalLayout from "@/components/QuantumTerminalLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function TerminalAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([
    {text: "Hello Ervin, I am your Quantum Terminal Assistant. How can I help you today?", isUser: false},
  ]);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, {text: input, isUser: true}]);
    
    // Simulate AI response
    setTimeout(() => {
      let response = "I'm processing your request. As a Quantum Terminal Assistant, I'm here to help with your cybersecurity needs.";
      
      // Simple keyword matching for demonstration
      if (input.toLowerCase().includes("email") || input.toLowerCase().includes("icloud")) {
        response = "I can help you monitor your email security status. Currently, no suspicious activities detected for ervin210@icloud.com.";
      } else if (input.toLowerCase().includes("scan") || input.toLowerCase().includes("security")) {
        response = "Would you like me to initiate a new security scan for your systems? This can be scheduled immediately.";
      } else if (input.toLowerCase().includes("alert") || input.toLowerCase().includes("warning")) {
        response = "No critical security alerts at this time. Your systems are currently operating within normal parameters.";
      }
      
      setMessages(prev => [...prev, {text: response, isUser: false}]);
    }, 1000);
    
    // Clear input
    setInput("");
  };

  const handleActivateNotifications = () => {
    toast({
      title: "Assistant Notifications Activated",
      description: "You will receive security notifications from your Quantum Terminal Assistant.",
    });
  };

  return (
    <QuantumTerminalLayout title="Personal Assistant">
      <div className="flex flex-col h-[calc(100vh-300px)] max-h-[600px]">
        <div className="bg-terminal-dark-bg p-4 rounded-t border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="text-terminal-cyan font-bold">QUANTUM ASSISTANT</div>
            <div className="text-terminal-green text-sm">User: ervin210@icloud.com</div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              className="border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:bg-opacity-20 text-xs"
              onClick={handleActivateNotifications}
            >
              Activate Notifications
            </Button>
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
          <div className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message here..."
              className="bg-transparent border-gray-700 text-white"
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-terminal-cyan text-black hover:bg-terminal-cyan/80"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </QuantumTerminalLayout>
  );
}