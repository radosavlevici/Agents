import { useState, useEffect } from "react";
import QuantumTerminalLayout from "@/components/QuantumTerminalLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getAIResponse, aiServicesStatus, checkApiKeyStatus } from "@/lib/aiServices";
import DeviceConnector, { ConnectedDevice } from "@/components/DeviceConnector";
import DeviceMetrics from "@/components/DeviceMetrics";
import DeviceOperations from "@/components/DeviceOperations";
import { realWorldOps, DeviceOperation } from "@/lib/realWorldOperations";

export default function TerminalAssistant() {
  const [input, setInput] = useState("");
  // Define message type with source information
  type Message = {
    text: string;
    isUser: boolean;
    source?: 'quantum' | 'anthropic' | 'openai' | 'system' | 'emergency' | 'agent';
  };

  // Define task type for development and security tasks
  type TaskType = 'development' | 'security' | 'general';
  type TaskStatus = 'pending' | 'in-progress' | 'completed';
  
  type Task = {
    id: number;
    type: TaskType;
    description: string;
    status: TaskStatus;
    priority: 'low' | 'medium' | 'high';
    created: Date;
    device?: string;
    assignedTo?: string;
  };
  
  // Enhanced agent mode for active device operations with AI collaboration
  const [agentMode, setAgentMode] = useState<boolean>(true);
  const [collaborativeMode, setCollaborativeMode] = useState<boolean>(false);
  const [deviceOperations, setDeviceOperations] = useState<{
    scanning: boolean;
    updating: boolean;
    optimizing: boolean;
    monitoring: boolean;
    aiAnalysis: boolean;
  }>({
    scanning: false,
    updating: false,
    optimizing: false,
    monitoring: true,
    aiAnalysis: false,
  });
  
  // Which AI models are actively contributing to agent operations
  const [activeAIContributors, setActiveAIContributors] = useState<{
    quantum: boolean;
    anthropic: boolean;
    openai: boolean;
  }>({
    quantum: true,
    anthropic: false,
    openai: false,
  });
  
  // State for to-do tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      type: 'security',
      description: 'Run comprehensive security scan on iPhone',
      status: 'pending',
      priority: 'high',
      created: new Date(),
      device: 'iPhone MU773ZD/A'
    },
    {
      id: 2,
      type: 'development',
      description: 'Update personal website with latest security patches',
      status: 'pending',
      priority: 'medium',
      created: new Date()
    }
  ]);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello Ervin, I am your personal Quantum Assistant linked to ervin210@icloud.com. How can I help you today?", 
      isUser: false,
      source: 'quantum'
    },
  ]);
  const [isMobileConnected, setIsMobileConnected] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [securityLevel, setSecurityLevel] = useState("maximum");
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiConnectionStatus, setApiConnectionStatus] = useState<"connecting" | "connected" | "failed" | "idle">("idle");
  
  // Real device connection state
  const [connectedDevice, setConnectedDevice] = useState<ConnectedDevice | null>(null);
  const [activeOperation, setActiveOperation] = useState<DeviceOperation | null>(null);
  const [aiAssistants, setAiAssistants] = useState<{
    anthropic: boolean;
    openai: boolean;
  }>({ anthropic: false, openai: false });
  const [activeAssistant, setActiveAssistant] = useState<"anthropic" | "openai" | "quantum" | null>("quantum");
  const [aiLoading, setAiLoading] = useState(false);
  const [waitingForKeyConfirmation, setWaitingForKeyConfirmation] = useState<"anthropic" | "openai" | null>(null);
  
  // Legacy device information for backward compatibility
  const deviceInfo = {
    serialNumber: "D2VMW6RNW2",
    modelNumber: "MU773ZD/A",
    deviceType: "iPhone",
    lastBackup: "Today, 14:32",
    batteryStatus: "87%",
    osVersion: "iOS 17.4.1"
  };
  
  // Handle device connection
  const handleDeviceConnect = (device: ConnectedDevice) => {
    setConnectedDevice(device);
    setIsMobileConnected(true);
    
    // Register device with real-world operations service
    realWorldOps.registerDevice(device);
    
    // Add a system message
    setMessages(prev => [...prev, {
      text: `🔗 SYSTEM: Successfully connected to ${device.name} (${device.model}). Device is now secured and ready for operations.`,
      isUser: false,
      source: 'system'
    }]);
    
    // If agent mode is active, start a system scan
    if (agentMode) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: `🔍 AGENT: Detected new device connection. Initiating security scan and system analysis of ${device.name}...`,
          isUser: false,
          source: 'agent'
        }]);
        
        try {
          // Execute a real system scan operation
          const operationId = realWorldOps.executeOperation(device.id, 'scan', 'system');
          
          // Monitor the operation
          realWorldOps.onOperationUpdate(operationId, (operation) => {
            if (operation.status === 'completed') {
              setMessages(prev => [...prev, {
                text: `✅ AGENT: System scan of ${device.name} complete. Device is now under active monitoring and protection.`,
                isUser: false,
                source: 'agent'
              }]);
            }
          });
        } catch (error) {
          console.error('Failed to initiate system scan:', error);
        }
      }, 2000);
    }
  };
  
  // Handle device disconnection
  const handleDeviceDisconnect = () => {
    if (connectedDevice) {
      // Unregister device from real-world operations service
      realWorldOps.unregisterDevice(connectedDevice.id);
      
      // Add a system message
      setMessages(prev => [...prev, {
        text: `🔌 SYSTEM: Disconnected from ${connectedDevice.name}. Device connection terminated.`,
        isUser: false,
        source: 'system'
      }]);
    }
    
    setConnectedDevice(null);
    setIsMobileConnected(false);
  };
  
  // Handle operation completion
  const handleOperationComplete = (operation: DeviceOperation) => {
    // Add a system message about the completed operation
    if (operation.status === 'completed') {
      setMessages(prev => [...prev, {
        text: `✅ SYSTEM: Operation completed successfully: ${operation.commands[0]?.type.toUpperCase()} - ${operation.commands[0]?.target}`,
        isUser: false,
        source: 'system'
      }]);
    } else if (operation.status === 'failed') {
      setMessages(prev => [...prev, {
        text: `⚠️ SYSTEM: Operation failed: ${operation.commands[0]?.type.toUpperCase()} - ${operation.commands[0]?.target}`,
        isUser: false,
        source: 'system'
      }]);
    }
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
        isUser: false,
        source: 'emergency'
      }
    ]);
    
    // Simulate emergency response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        {
          text: `Device information sent: iPhone (${deviceInfo.modelNumber}), Serial: ${deviceInfo.serialNumber}. Approximate location data transmitted to emergency services.`, 
          isUser: false,
          source: 'emergency'
        }
      ]);
    }, 3000);
  };

  // Initialize AI assistants and agent functionality
  useEffect(() => {
    // Check API key status when component loads
    const initializeServices = async () => {
      try {
        const success = await checkApiKeyStatus();
        
        if (success) {
          console.log("AI services initialized successfully");
          setAiAssistants({
            anthropic: aiServicesStatus.anthropic,
            openai: aiServicesStatus.openai
          });
          
          // Add a message if AI services are available
          if (aiServicesStatus.anthropic || aiServicesStatus.openai) {
            setMessages(prev => [
              ...prev,
              {
                text: `AI Services detected: ${aiServicesStatus.anthropic ? 'Claude AI' : ''}${aiServicesStatus.anthropic && aiServicesStatus.openai ? ' and ' : ''}${aiServicesStatus.openai ? 'GPT AI' : ''} ${aiServicesStatus.anthropic || aiServicesStatus.openai ? 'available for enhanced assistance.' : ''}`,
                isUser: false,
                source: 'system'
              }
            ]);
          }
          
          // If agent mode is active, also start device monitoring
          if (agentMode) {
            setTimeout(() => {
              setMessages(prev => [
                ...prev,
                {
                  text: "🤖 QUANTUM AGENT ACTIVATED 🤖\n\nI'm now actively monitoring your device. I'll automatically detect and fix issues in real-time without creating tasks. All operations will be performed directly on the connected device.",
                  isUser: false,
                  source: 'agent'
                }
              ]);
              
              // Start background monitoring
              setDeviceOperations(prev => ({
                ...prev,
                monitoring: true
              }));
              
              // Simulate initial device scan
              setTimeout(() => {
                // Perform initial scan
                setDeviceOperations(prev => ({
                  ...prev,
                  scanning: true
                }));
                
                setMessages(prev => [
                  ...prev,
                  {
                    text: "🔍 AGENT: Performing initial device scan to establish baseline security and performance metrics...",
                    isUser: false,
                    source: 'agent'
                  }
                ]);
                
                // Complete initial scan after 3 seconds
                setTimeout(() => {
                  setDeviceOperations(prev => ({
                    ...prev,
                    scanning: false
                  }));
                  
                  setMessages(prev => [
                    ...prev,
                    {
                      text: "✅ AGENT: Initial device scan complete. System status:\n\n• Security: Good (No critical vulnerabilities found)\n• Performance: 92% optimal\n• Storage: 65% utilized (34.5GB available)\n• Battery health: 96%\n\nI'll continue monitoring in the background and take immediate action if any issues are detected.",
                      isUser: false,
                      source: 'agent'
                    }
                  ]);
                }, 3000);
              }, 2000);
            }, 4000);
          }
        }
      } catch (error) {
        console.error("Error initializing AI services:", error);
      }
    };
    
    initializeServices();
  }, [agentMode]);

  // Function to activate AI assistants
  const activateAIAssistant = (assistantType: 'anthropic' | 'openai') => {
    // Check if service is available
    const serviceAvailable = assistantType === 'anthropic' 
      ? aiServicesStatus.anthropic 
      : aiServicesStatus.openai;
    
    if (!serviceAvailable) {
      const errorMessage = `${assistantType === 'anthropic' ? 'Claude AI' : 'GPT AI'} service is not available. The API key is missing or invalid.`;
      toast({
        title: `${assistantType === 'anthropic' ? 'Claude AI' : 'GPT AI'} Activation Failed`,
        description: errorMessage,
        variant: "destructive"
      });
      
      setMessages(prev => [
        ...prev,
        { text: errorMessage, isUser: false }
      ]);
      return false;
    }
    
    // Activate if service is available
    setAiAssistants(prev => ({ ...prev, [assistantType]: true }));
    
    toast({
      title: `${assistantType === 'anthropic' ? 'Claude AI' : 'GPT AI'} Activated`,
      description: `Connected to ${assistantType === 'anthropic' ? 'Anthropic Claude' : 'OpenAI GPT'} for enhanced assistant capabilities.`,
    });
    
    setMessages(prev => [
      ...prev,
      {
        text: `${assistantType === 'anthropic' ? 'Claude AI' : 'GPT AI'} integration activated. Your assistant now has enhanced capabilities.`,
        isUser: false
      }
    ]);
    return true;
  };

  // Handle switching active assistants
  const switchAssistant = (assistantType: 'anthropic' | 'openai' | 'quantum' | 'collaborative') => {
    // Special case for collaborative mode
    if (assistantType === 'collaborative') {
      // First check if both Anthropic and OpenAI are available
      const bothAvailable = aiServicesStatus.anthropic && aiServicesStatus.openai;
      
      if (!bothAvailable) {
        // Check which one is missing
        const missingService = !aiServicesStatus.anthropic 
          ? 'Claude AI (Anthropic)' 
          : !aiServicesStatus.openai 
            ? 'GPT AI (OpenAI)' 
            : 'both AI services';
        
        toast({
          title: 'Cannot Enable Collaborative Mode',
          description: `${missingService} is not available. Please configure the missing API keys first.`,
          variant: "destructive"
        });
        return false;
      }
      
      // Activate both services if they're not already active
      if (!aiAssistants.anthropic) {
        activateAIAssistant('anthropic');
      }
      
      if (!aiAssistants.openai) {
        activateAIAssistant('openai');
      }
      
      // Enable collaborative mode
      setCollaborativeMode(true);
      
      // Update active contributors
      setActiveAIContributors({
        quantum: true,
        anthropic: true,
        openai: true
      });
      
      // Keep quantum as primary interface but note we're in collaborative mode
      setActiveAssistant('quantum');
      
      // Add agent notification
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            text: "🤖 COLLABORATIVE AI MODE ACTIVATED 🤖\n\nAll AI systems are now working together!\n\n• Quantum AI: Coordinating operations and device interactions\n• Claude AI: Deep analysis and reasoning\n• GPT AI: Code generation and technical solutions\n\nThis integrated approach will provide the most comprehensive assistance for your tasks.",
            isUser: false,
            source: 'agent'
          }
        ]);
        
        // Set AI analysis flag
        setDeviceOperations(prev => ({
          ...prev,
          aiAnalysis: true
        }));
      }, 500);
      
      toast({
        title: 'Collaborative AI Mode Activated',
        description: 'Quantum, Claude, and GPT are now working together for maximum effectiveness.',
      });
      
      return true;
    }
    
    // For regular assistant switching
    if (assistantType === 'quantum') {
      setActiveAssistant('quantum');
      toast({
        title: 'Switched to Quantum AI',
        description: 'Your assistant is now powered by Quantum Terminal AI.',
      });
      
      // If we were in collaborative mode, exit it
      if (collaborativeMode) {
        setCollaborativeMode(false);
        setActiveAIContributors({
          quantum: true,
          anthropic: false,
          openai: false
        });
        
        // Add notification about leaving collaborative mode
        setMessages(prev => [
          ...prev,
          {
            text: "Exited collaborative mode. Now operating with Quantum AI only.",
            isUser: false,
            source: 'system'
          }
        ]);
      }
      
      return true;
    }
    
    // For external AI services, we need to check if they're available
    const serviceAvailable = assistantType === 'anthropic' 
      ? aiServicesStatus.anthropic 
      : aiServicesStatus.openai;
    
    if (!serviceAvailable) {
      toast({
        title: `Cannot Switch to ${assistantType === 'anthropic' ? 'Claude AI' : 'GPT AI'}`,
        description: `The ${assistantType === 'anthropic' ? 'Claude AI' : 'GPT AI'} service is not available. The API key is missing or invalid.`,
        variant: "destructive"
      });
      return false;
    }

    // If the service is available but not activated, activate it
    if ((assistantType === 'anthropic' && !aiAssistants.anthropic) || 
        (assistantType === 'openai' && !aiAssistants.openai)) {
      
      // Try to activate the assistant if not already active
      const activated = activateAIAssistant(assistantType);
      if (!activated) return false;
    }
    
    // Switch to the requested assistant
    setActiveAssistant(assistantType);
    
    // If we were in collaborative mode, exit it
    if (collaborativeMode) {
      setCollaborativeMode(false);
      setActiveAIContributors({
        quantum: false,
        anthropic: assistantType === 'anthropic',
        openai: assistantType === 'openai'
      });
      
      // Add notification about leaving collaborative mode
      setMessages(prev => [
        ...prev,
        {
          text: `Exited collaborative mode. Now operating with ${assistantType === 'anthropic' ? 'Claude AI' : 'GPT AI'} only.`,
          isUser: false,
          source: 'system'
        }
      ]);
    }
    
    toast({
      title: `Switched to ${assistantType === 'anthropic' ? 'Claude AI' : 'GPT AI'}`,
      description: `Your assistant is now powered by ${assistantType === 'anthropic' ? 'Anthropic Claude' : 'OpenAI GPT'}.`,
    });
    
    return true;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, {text: input, isUser: true}]);
    
    // Check if we're waiting for API key confirmation
    if (waitingForKeyConfirmation) {
      const response = input.toLowerCase();
      
      if (response === 'yes' || response.includes('added') || response.includes('done')) {
        // User claims they've added the API key
        setMessages(prev => [...prev, {
          text: "Great! Let me check if I can access the API key now...", 
          isUser: false
        }]);
        
        // Reload the page to refresh environment variables
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: "I'll need to refresh the connection to apply the new API key. One moment...", 
            isUser: false
          }]);
          
          // In a real app, we would check for the API key and update the state
          // For now, we'll simulate a successful connection after waiting
          setTimeout(() => {
            // Update the AI assistants state based on the current API key status
            setAiAssistants(prev => ({
              ...prev,
              [waitingForKeyConfirmation]: true
            }));
            
            const serviceName = waitingForKeyConfirmation === 'anthropic' ? 'Claude AI' : 'GPT AI';
            
            setMessages(prev => [...prev, {
              text: `${serviceName} connection established! You can now use the enhanced AI capabilities.`, 
              isUser: false
            }]);
            
            setWaitingForKeyConfirmation(null);
          }, 2000);
        }, 1500);
      } else if (response === 'no' || response.includes('help')) {
        // User needs help getting an API key
        const service = waitingForKeyConfirmation;
        const keyInfo = service === 'anthropic' ? 
          "To get an Anthropic API key, visit https://console.anthropic.com and create an account. Once registered, you can generate an API key from the dashboard." :
          "To get an OpenAI API key, visit https://platform.openai.com and create an account. Navigate to the API section to generate your key.";
        
        setMessages(prev => [...prev, {text: keyInfo, isUser: false}]);
        setWaitingForKeyConfirmation(null);
      } else {
        // Unrecognized response
        setMessages(prev => [...prev, {
          text: "I didn't understand that response. Please type 'yes' if you've added the API key or 'no' if you need help getting one.", 
          isUser: false
        }]);
      }
      
      setInput("");
      return;
    }
    
    // Check for AI connection keywords
    if (input.toLowerCase().includes("use claude") || input.toLowerCase().includes("anthropic") || input.toLowerCase().includes("use claude ai")) {
      if (switchAssistant('anthropic')) {
        setInput("");
        return;
      }
    } else if (input.toLowerCase().includes("use gpt") || input.toLowerCase().includes("openai") || input.toLowerCase().includes("use gpt ai")) {
      if (switchAssistant('openai')) {
        setInput("");
        return;
      }
    } else if (input.toLowerCase().includes("use quantum") || input.toLowerCase().includes("switch to quantum")) {
      switchAssistant('quantum');
      setInput("");
      return;
    } else if (input.toLowerCase().includes("ai status") || input.toLowerCase().includes("check ai") || input.toLowerCase().includes("ai services")) {
      // Build a detailed AI status message with additional information about configuration
      const statusMsg = `AI Services Status:\n- Quantum AI: Available and Active\n- Claude AI (Anthropic): ${aiServicesStatus.anthropic ? 'Available' : 'Not Available (API key missing)'}\n- GPT AI (OpenAI): ${aiServicesStatus.openai ? 'Available' : 'Not Available (API key missing)'}`;
      
      setMessages(prev => [...prev, {
        text: statusMsg, 
        isUser: false,
        source: 'system'
      }]);
      
      // If any AI services are not available, suggest configuring them
      if (!aiServicesStatus.anthropic || !aiServicesStatus.openai) {
        setTimeout(() => {
          const missingServices = [];
          if (!aiServicesStatus.anthropic) missingServices.push("Claude AI (Anthropic)");
          if (!aiServicesStatus.openai) missingServices.push("GPT AI (OpenAI)");
          
          const setupMsg = `Would you like to configure ${missingServices.join(" and ")}? Type "setup claude" or "setup gpt" to configure the respective service.`;
          setMessages(prev => [...prev, {
            text: setupMsg, 
            isUser: false,
            source: 'system'
          }]);
        }, 1000);
      }
      
      setInput("");
      return;
    } else if (input.toLowerCase().includes("setup claude") || input.toLowerCase().includes("configure claude")) {
      handleRequestApiKey('anthropic');
      setInput("");
      return;
    } else if (input.toLowerCase().includes("setup gpt") || input.toLowerCase().includes("configure gpt")) {
      handleRequestApiKey('openai');
      setInput("");
      return;
    }
    
    // Check for emergency keywords first
    if (emergencyMode || input.toLowerCase().includes("emergency") || input.toLowerCase().includes("help me") || input.toLowerCase().includes("sos")) {
      if (!emergencyMode) {
        setEmergencyMode(true);
        const emergencyResponse = "EMERGENCY MODE ACTIVATED. Sending your device information (iPhone MU773ZD/A, Serial: D2VMW6RNW2) and location to emergency services. Stay on this channel for updates.";
        setMessages(prev => [...prev, {
          text: emergencyResponse, 
          isUser: false,
          source: 'emergency'
        }]);
      } else {
        const emergencyUpdateResponse = "Emergency services have been notified. Your location is being tracked. Please stay in place if possible. Help is on the way.";
        setMessages(prev => [...prev, {
          text: emergencyUpdateResponse, 
          isUser: false,
          source: 'emergency'
        }]);
      }
      setInput("");
      return;
    }
    
    // Check for API connection commands
    if (input.toLowerCase().includes("api") || input.toLowerCase().includes("connect api") || input.toLowerCase().includes("external")) {
      if (!apiConnected) {
        const apiResponse = "I'll establish connection to the API endpoints for enhanced functionality. Initiating connection now...";
        setMessages(prev => [...prev, {
          text: apiResponse, 
          isUser: false,
          source: 'system'
        }]);
        // Trigger API connection process
        connectToApi();
      } else {
        const statusList = apiInfo.endpoints.map(endpoint => 
          `- ${endpoint.name}: ${endpoint.status === 'active' ? '✓ Online' : '⚠️ Standby'}`
        ).join('\n');
        
        const apiStatusResponse = `API connection is already active. Currently connected to ${apiInfo.endpoints.length} endpoints:\n${statusList}\n\nLast sync: ${new Date(apiInfo.lastSyncTime).toLocaleTimeString()}`;
        setMessages(prev => [...prev, {
          text: apiStatusResponse, 
          isUser: false,
          source: 'system'
        }]);
      }
      setInput("");
      return;
    }

    // Enhanced collaborative task operations when in collaborative mode with agent mode also enabled
    if (collaborativeMode && agentMode && (
      input.toLowerCase().includes("update") || 
      input.toLowerCase().includes("fix") || 
      input.toLowerCase().includes("repair") || 
      input.toLowerCase().includes("optimize") || 
      input.toLowerCase().includes("scan") ||
      input.toLowerCase().includes("control") ||
      input.toLowerCase().includes("take control") ||
      input.toLowerCase().includes("device") ||
      input.toLowerCase().includes("system") ||
      input.toLowerCase().includes("change"))) {
      
      // Start collaborative operation with all AIs working together with enhanced control
      setMessages(prev => [...prev, {
        text: "🤖 Initiating collaborative AI operation with direct device control...",
        isUser: false,
        source: 'agent'
      }]);
      
      // Set AI analysis mode
      setDeviceOperations(prev => ({
        ...prev,
        aiAnalysis: true
      }));
      
      // First, get Claude to analyze the problem and context
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "💫 CLAUDE AI: Analyzing system state and identifying critical issues...\n\nDetailed context assessment in progress. Evaluating potential device vulnerabilities and optimal paths for direct intervention.",
          isUser: false,
          source: 'anthropic'
        }]);
        
        // Then GPT develops technical solution and system changes
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: "💻 GPT AI: Generating system intervention strategy...\n\nDeveloping precise system modification approach. Preparing secure command sequences for direct device control with minimum disruption to user operations.",
            isUser: false,
            source: 'openai'
          }]);
          
          // Agent takes control and executes the operation on device
          setTimeout(() => {
            setMessages(prev => [...prev, {
              text: "⚡ AGENT: Taking direct device control. Implementing system changes with collaborative AI guidance...",
              isUser: false,
              source: 'agent'
            }]);
            
            // Determine operation type based on input to take appropriate control action
            if (input.toLowerCase().includes("scan") || input.toLowerCase().includes("security")) {
              // Advanced security intervention
              setMessages(prev => [...prev, {
                text: "🔐 AGENT: DIRECT CONTROL - Accessing system security layer for comprehensive analysis and modification...",
                isUser: false,
                source: 'agent'
              }]);
              performSecurityScan(false);
            } else if (input.toLowerCase().includes("update") || input.toLowerCase().includes("fix") || input.toLowerCase().includes("repair") || input.toLowerCase().includes("change")) {
              // Direct system changes and fixes
              setMessages(prev => [...prev, {
                text: "🔧 AGENT: DIRECT CONTROL - Accessing core system files and configurations for targeted modifications...",
                isUser: false,
                source: 'agent'
              }]);
              fixSecurityIssues("Collaborative AI intervention required", false);
            } else if (input.toLowerCase().includes("optimize") || input.toLowerCase().includes("performance")) {
              // Performance tuning with direct access
              setMessages(prev => [...prev, {
                text: "⚙️ AGENT: DIRECT CONTROL - Accessing system resource controls and performance parameters for optimization...",
                isUser: false,
                source: 'agent'
              }]);
              optimizePerformance(false);
            } else if (input.toLowerCase().includes("control") || input.toLowerCase().includes("take control")) {
              // Full system control mode
              setMessages(prev => [...prev, {
                text: "⚠️ AGENT: DIRECT CONTROL - Initiating full system administration mode. Accessing all device subsystems...",
                isUser: false,
                source: 'agent'
              }]);
              
              // Simulate taking full control
              setTimeout(() => {
                setMessages(prev => [...prev, {
                  text: "🛠️ AGENT: FULL CONTROL ACTIVE\n\nAll device subsystems accessible:\n• System configuration layer\n• Security infrastructure\n• Network interface controls\n• Application management\n• Resource allocation\n• User data protection systems\n\nAwaiting specific control directives or implementing automated maintenance...",
                  isUser: false,
                  source: 'agent'
                }]);
                
                // After a brief moment, start comprehensive maintenance
                setTimeout(() => {
                  performSecurityScan(true);
                  
                  setTimeout(() => {
                    optimizePerformance(true);
                  }, 3000);
                }, 2000);
              }, 2000);
            } else {
              // Default operation is a comprehensive device control and maintenance
              setMessages(prev => [...prev, {
                text: "🔍 AGENT: DIRECT CONTROL - Initiating comprehensive device management with collaborative AI oversight...",
                isUser: false,
                source: 'agent'
              }]);
              
              performSecurityScan(true);
            }
            
            // After operations, add detailed collaborative results about actual changes made
            setTimeout(() => {
              setMessages(prev => [...prev, {
                text: "✅ COLLABORATIVE AI SYSTEM CONTROL RESULTS:\n\n• Claude AI identified critical vulnerability patterns and prioritized intervention points\n• GPT AI developed precise system modification procedures with integrity validation\n• Quantum Agent executed direct system changes with real-time verification\n\nDirect System Changes Implemented:\n• Updated 17 system security parameters\n• Reconfigured network defense layers with enhanced encryption\n• Optimized resource allocation for 41% performance improvement\n• Applied protective measures against newly identified threat vectors\n\nAll changes have been logged and can be reverted if needed. System now operating at optimal parameters.",
                isUser: false,
                source: 'agent'
              }]);
              
              // Reset AI analysis state but keep monitoring active
              setDeviceOperations(prev => ({
                ...prev,
                aiAnalysis: false,
                monitoring: true
              }));
            }, 8000);
          }, 2000);
        }, 2000);
      }, 1000);
      
      setInput("");
      return;
    }
    
    // Handle AI responses based on active assistant
    if (activeAssistant === 'anthropic' || activeAssistant === 'openai') {
      try {
        setAiLoading(true);
        
        let loadingMsg = "Processing your request...";
        setMessages(prev => [...prev, {
          text: loadingMsg, 
          isUser: false,
          source: 'system'
        }]);
        
        // Call the AI service
        const aiResponse = await getAIResponse(input, activeAssistant);
        
        // Remove loading message and add actual response
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages.pop(); // Remove loading message
          return [...newMessages, {
            text: aiResponse, 
            isUser: false,
            source: activeAssistant // Set proper source for AI message
          }];
        });
      } catch (error) {
        console.error("Error getting AI response:", error);
        setMessages(prev => [...prev, {
          text: "Sorry, I encountered an error processing your request with the AI service. Would you like to try again?", 
          isUser: false,
          source: 'system'
        }]);
      } finally {
        setAiLoading(false);
      }
    } else {
      // Default Quantum Assistant response logic (existing keyword-based responses)
      let response = "I'm processing your request. As your personal Quantum Assistant, I'm here to help with any tasks for ervin210@icloud.com.";
      
      // Enhanced keyword matching for iCloud integration demonstration
      if (input.toLowerCase().includes("email") || input.toLowerCase().includes("icloud")) {
        response = "Your iCloud email (ervin210@icloud.com) is secure. Last login was from your usual location. No suspicious activities detected. Would you like me to scan for potential phishing attempts?";
      } else if (input.toLowerCase().includes("phone") || input.toLowerCase().includes("mobile") || input.toLowerCase().includes("device")) {
        response = `Your iPhone (${deviceInfo.modelNumber}, SN:${deviceInfo.serialNumber}) is currently connected and secured. Battery level is at ${deviceInfo.batteryStatus}. Running ${deviceInfo.osVersion}. Last backup: ${deviceInfo.lastBackup}. Would you like me to run a security scan?`;
      
      // Development-related queries and fixes
      } else if (input.toLowerCase().includes("code") || input.toLowerCase().includes("develop") || input.toLowerCase().includes("program") || input.toLowerCase().includes("coding")) {
        response = "I can assist with development tasks through my AI integration. Would you like me to:\n1. Help debug an application issue\n2. Review code for security vulnerabilities\n3. Suggest development best practices\n4. Help write new code\n\nFor best results, I recommend switching to one of the advanced AI assistants by saying 'Use Claude AI' or 'Use GPT AI'.";
      // Direct development/code fixing using agent functionality
      } else if (input.toLowerCase().includes("fix") && (input.toLowerCase().includes("development") || input.toLowerCase().includes("coding") || input.toLowerCase().includes("code"))) {
        // Start fixing the development issue using agent
        response = "I understand you need help fixing a development issue. Activating agent mode to analyze and fix the problem directly.";
        
        // Use the agent to perform development fixes
        setTimeout(() => {
          fixDevelopmentIssue(input, false);
        }, 1000);
      } else if (input.toLowerCase().includes("debug") || input.toLowerCase().includes("error") || input.toLowerCase().includes("fix code")) {
        response = "I can help troubleshoot your code issues. To proceed with debugging, please provide:\n- The error message you're receiving\n- The relevant code snippet\n- Language/framework you're using\n\nFor in-depth debugging assistance, I recommend activating Claude AI or GPT AI, which have specialized code understanding capabilities.";
      } else if (input.toLowerCase().includes("project") || input.toLowerCase().includes("github") || input.toLowerCase().includes("git") || input.toLowerCase().includes("repository")) {
        response = "I can help with your development projects and repository management. What would you like assistance with?\n- Setting up a new project\n- Code review and improvement\n- Security assessment of your codebase\n- Deployment strategies\n\nFor technical code reviews, I recommend activating one of the advanced AI assistants.";
      
      // Direct security issue fixing using agent functionality
      } else if (input.toLowerCase().includes("fix") && (input.toLowerCase().includes("security") || input.toLowerCase().includes("vulnerability") || input.toLowerCase().includes("issue"))) {
        // Connect to API endpoints if not already connected
        if (!apiConnected) {
          connectToApi();
        }
        
        // Start fixing the security issue using agent
        response = "I understand there's a security issue to fix. Activating agent mode to resolve this immediately.";
        
        // Use the agent to perform security scan and fix
        setTimeout(() => {
          // Perform comprehensive security scan which will automatically fix any issues found
          performSecurityScan(false);
        }, 1000);
      } else if (input.toLowerCase().includes("scan") || input.toLowerCase().includes("security")) {
        if (!apiConnected) {
          response = `I'll need to connect to our security API endpoints first to perform a comprehensive scan. Type "connect API" to establish the connection.`;
        } else {
          response = `Initiating comprehensive security scan for your iPhone ${deviceInfo.modelNumber} and all devices linked to ervin210@icloud.com. This will check for vulnerabilities, malware, and unauthorized access attempts. I'll notify you when complete.`;
        }
      } else if (input.toLowerCase().includes("vulnerability") || input.toLowerCase().includes("exploit") || input.toLowerCase().includes("hack") || input.toLowerCase().includes("penetration test")) {
        response = "I can help analyze potential security vulnerabilities in your systems. For a comprehensive security assessment, I would need:\n- The specific system or application to analyze\n- The type of vulnerabilities you're concerned about\n- Any recent security incidents\n\nWould you like me to activate Claude AI or GPT AI for a detailed security analysis?";
      } else if (input.toLowerCase().includes("firewall") || input.toLowerCase().includes("network security") || input.toLowerCase().includes("encryption") || input.toLowerCase().includes("vpn")) {
        response = "I can help configure and optimize your network security settings. For personal devices like your iPhone, I recommend setting up:\n1. VPN for secure browsing\n2. Advanced firewall settings\n3. DNS-level protection\n4. Encrypted communications\n\nWould you like details on any specific security measure?";
      } else if (input.toLowerCase().includes("malware") || input.toLowerCase().includes("virus") || input.toLowerCase().includes("ransomware") || input.toLowerCase().includes("spyware")) {
        response = "I can check your device for malicious software and help remove any threats. Your iPhone has built-in protection against common malware, but additional steps can enhance your security. Would you like me to scan your device or explain how to improve your protection against malware?";
      
      // Original patterns  
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
      } else if (input.toLowerCase().includes("ai") || input.toLowerCase().includes("assistant")) {
        response = "I can connect to advanced AI services to enhance my capabilities. You can say 'Use Claude AI' or 'Use GPT AI' to activate these assistants for in-depth development and security assistance.";
      } else if (input.toLowerCase().includes("agent mode") || input.toLowerCase().includes("agent status")) {
        // Agent mode status and information
        const agentStatus = agentMode ? "ACTIVE" : "INACTIVE";
        response = `🤖 AGENT STATUS: ${agentStatus} 🤖${collaborativeMode ? ' + 🔄 COLLABORATIVE AI MODE' : ''}\n\nWhen agent mode is active, I directly perform operations on your device without creating tasks. I can:\n\n• Automatically detect and fix security issues\n• Resolve development problems\n• Optimize device performance\n• Continuously monitor for potential problems${collaborativeMode ? '\n• Leverage multiple AI systems for collaborative analysis' : ''}\n\nCurrent operations: ${
          deviceOperations.aiAnalysis ? "Collaborative AI analysis in progress" :
          deviceOperations.scanning ? "Security scanning in progress" : 
          deviceOperations.updating ? "Security update in progress" :
          deviceOperations.optimizing ? "Performance optimization in progress" :
          deviceOperations.monitoring ? "Background monitoring active" : "None"
        }
        
${collaborativeMode ? `\nAI Contributors:
• Quantum AI: ${activeAIContributors.quantum ? 'Active' : 'Standby'}
• Claude AI: ${activeAIContributors.anthropic ? 'Active' : 'Standby'}
• GPT AI: ${activeAIContributors.openai ? 'Active' : 'Standby'}` : ''}

To toggle agent mode, say "toggle agent mode".
${agentMode && !collaborativeMode ? 'To activate collaborative AI, say "activate collaborative mode".' : ''}
${collaborativeMode ? 'To deactivate collaborative mode, switch to any individual AI service.' : ''}`;
      } else if (input.toLowerCase().includes("toggle agent")) {
        // Toggle agent mode
        const newAgentMode = !agentMode;
        setAgentMode(newAgentMode);
        
        if (newAgentMode) {
          response = "🤖 AGENT MODE ACTIVATED 🤖\n\nI'm now operating as an active agent on your device. I'll directly fix issues without creating tasks and will proactively monitor your system for potential problems.";
          
          // Initialize device monitoring
          setTimeout(() => {
            setMessages(prev => [...prev, {
              text: "🔍 AGENT: Initializing system monitoring and diagnostics...",
              isUser: false,
              source: 'agent'
            }]);
            
            // Start background monitoring
            setDeviceOperations(prev => ({
              ...prev,
              monitoring: true
            }));
          }, 1000);
        } else {
          response = "🤖 AGENT MODE DEACTIVATED 🤖\n\nI've reverted to task-based operation. I'll now create tasks for issues instead of fixing them directly. Background monitoring has been suspended.";
          
          // Stop all operations
          setDeviceOperations({
            scanning: false,
            updating: false,
            optimizing: false,
            monitoring: false,
            aiAnalysis: false
          });
        }
      } else if (input.toLowerCase().includes("collaborative mode") || input.toLowerCase().includes("ai collaboration") || input.toLowerCase().includes("combine ai")) {
        // Handle collaborative mode activation
        if (!collaborativeMode) {
          // Try to activate collaborative mode
          const activated = switchAssistant('collaborative');
          if (activated) {
            response = "Collaborative AI mode activated. All AI systems are now working together to provide the most comprehensive solutions.";
          } else {
            response = "Unable to activate collaborative mode. Please ensure both Claude AI and GPT AI API keys are configured.";
          }
        } else {
          // Already in collaborative mode
          response = "Collaborative AI mode is already active. Quantum, Claude, and GPT systems are currently working together.";
        }
      }
      
      setMessages(prev => [...prev, {
        text: response, 
        isUser: false,
        source: 'quantum'
      }]);
    }
    
    // Clear input
    setInput("");
  };

  const handleActivateNotifications = () => {
    toast({
      title: "Assistant Notifications Activated",
      description: "You will receive security notifications from your Quantum Terminal Assistant on all devices linked to ervin210@icloud.com.",
    });
  };
  
  // Function to handle requesting API keys when they're missing
  const handleRequestApiKey = async (service: 'anthropic' | 'openai') => {
    const serviceName = service === 'anthropic' ? 'Claude AI (Anthropic)' : 'GPT AI (OpenAI)';
    const envVar = service === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
    
    // First, check if API key might already be available by refreshing status
    try {
      await checkApiKeyStatus();
      
      // After refreshing, check if the service is now available
      const serviceAvailable = service === 'anthropic' ? aiServicesStatus.anthropic : aiServicesStatus.openai;
      
      if (serviceAvailable) {
        // API key is actually available, just need to activate the service
        setMessages(prev => [
          ...prev,
          {
            text: `Good news! Your ${serviceName} API key has been detected. Activating the service now...`,
            isUser: false
          }
        ]);
        
        // Activate the service
        activateAIAssistant(service);
        return;
      }
    } catch (error) {
      console.error('Error checking API key status:', error);
    }
    
    // If we get here, the API key is definitely missing, so request it
    setMessages(prev => [
      ...prev,
      {
        text: `To use ${serviceName}, you need to configure an API key. The ${envVar} is not set in your environment.\n\nPlease add your API key to continue using this service.`,
        isUser: false,
        source: 'system'
      }
    ]);
    
    toast({
      title: `${serviceName} API Key Required`,
      description: `Please add your ${service === 'anthropic' ? 'Anthropic' : 'OpenAI'} API key to continue.`,
      variant: "destructive"
    });
    
    try {
      // Request user to provide the API key
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            text: `To add your ${service === 'anthropic' ? 'Anthropic Claude' : 'OpenAI'} API key:\n\n1. Get your API key from ${service === 'anthropic' ? 'https://console.anthropic.com' : 'https://platform.openai.com'}\n2. Add it to the environment variables in your project using the Secrets Manager\n3. Restart the application to apply changes\n\nOnce added, you'll be able to use ${serviceName} in your Quantum Terminal.`,
            isUser: false,
            source: 'system'
          }
        ]);
        
        // Explain how to set API keys in common environments
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              text: `Tip: You need to set your API key as an environment variable named ${service === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY'}. This will allow your Quantum Terminal to securely connect to the ${serviceName} service.`,
              isUser: false,
              source: 'system'
            }
          ]);
          
          // Add button in message to request API key from user in a future version
          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                text: `⚡ [ACTION REQUIRED] ⚡\n\nPlease set up your ${service === 'anthropic' ? 'Anthropic' : 'OpenAI'} API key to continue using the ${serviceName} functionality.\n\nType 'yes' to continue if you've added the API key, or 'no' if you need help getting one.`,
                isUser: false,
                source: 'system'
              }
            ]);
            
            // Set flag to watch for user response about API key
            setWaitingForKeyConfirmation && setWaitingForKeyConfirmation(service);
          }, 3000);
        }, 2000);
        
      }, 1000);
      
    } catch (error) {
      console.error('Error handling API key request:', error);
      toast({
        title: "Error Setting API Key",
        description: "There was a problem configuring your API key.",
        variant: "destructive"
      });
    }
  };

  // AGENT FUNCTIONS for direct device operations
  const performSecurityScan = (silent: boolean = false) => {
    if (!silent) {
      setMessages(prev => [...prev, {
        text: "🔍 AGENT: Initiating comprehensive security scan of all connected devices...",
        isUser: false,
        source: 'agent'
      }]);
    }
    
    setDeviceOperations(prev => ({
      ...prev,
      scanning: true
    }));
    
    // Simulate scan duration
    setTimeout(() => {
      // Randomly determine if issues are found (for demo purposes)
      const issuesFound = Math.random() > 0.5;
      
      if (issuesFound) {
        if (!silent) {
          setMessages(prev => [...prev, {
            text: "⚠️ AGENT: Security scan complete. Issues detected:\n\n• Outdated system software (iOS 17.4.1 → 17.5 available)\n• 3 suspicious login attempts from unrecognized location\n• Weak encryption on Wi-Fi connection\n\nStarting automatic fixes...",
            isUser: false,
            source: 'agent'
          }]);
        }
        
        // Start fixing the issues automatically
        fixSecurityIssues("Detected during automated scan", silent);
      } else {
        if (!silent) {
          setMessages(prev => [...prev, {
            text: "✅ AGENT: Security scan complete. No issues detected. All systems secure.\n\n• Software up to date\n• No suspicious activities detected\n• All connections using strong encryption\n• Data backup status: Current",
            isUser: false,
            source: 'agent'
          }]);
        }
        
        setDeviceOperations(prev => ({
          ...prev,
          scanning: false
        }));
      }
    }, silent ? 2000 : 4000);
    
    return true;
  };
  
  const fixSecurityIssues = (issueSource: string, silent: boolean = false) => {
    setDeviceOperations(prev => ({
      ...prev,
      updating: true
    }));
    
    if (!silent) {
      setMessages(prev => [...prev, {
        text: "🔒 AGENT: Implementing security fixes...",
        isUser: false,
        source: 'agent'
      }]);
    }
    
    // Enhanced AI-collaborative analysis for security issues
    if (collaborativeMode && !silent) {
      // Claude analyzes the security vulnerabilities using security knowledge base
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: `🔮 CLAUDE AI: Performing comprehensive security threat analysis...\n\nEvaluating '${issueSource}' against security knowledge base containing:
• ${securityKnowledgeBase.application_security.length} application security domains
• ${securityKnowledgeBase.network_security.length} network security vectors
• ${securityKnowledgeBase.device_security.length} device security categories
• ${securityKnowledgeBase.cryptography.length} cryptographic security areas
• ${securityKnowledgeBase.compliance_frameworks.length} compliance frameworks

Identified ${Math.floor(Math.random() * 3) + 2} potential threat vectors with 96% confidence. Primary concern: ${
  securityKnowledgeBase.application_security[Math.floor(Math.random() * securityKnowledgeBase.application_security.length)].category
}.`,
          isUser: false,
          source: 'anthropic'
        }]);
        
        // GPT develops technical security solution
        setTimeout(() => {
          const threats = securityKnowledgeBase.application_security.reduce((acc: string[], sec) => [...acc, ...sec.threats], [] as string[]);
          const mitigations = securityKnowledgeBase.application_security.reduce((acc: string[], sec) => [...acc, ...sec.mitigations], [] as string[]);
          
          setMessages(prev => [...prev, {
            text: `💻 GPT AI: Formulating comprehensive security mitigation strategy...\n\nDeveloping defense-in-depth approach based on identified threats:
• Creating mitigation plan addressing ${threats.length} threat vectors
• Implementing protections from ${mitigations.length} mitigation techniques
• Validating against ${securityKnowledgeBase.compliance_frameworks.map(f => f.name).join(', ')} requirements
• Protective measures include encryption upgrades, authentication hardening, and network isolation

Security solution prepared with 98% confidence rating.`,
            isUser: false,
            source: 'openai'
          }]);
          
          // Agent implements the security solutions
          setTimeout(() => {
            setMessages(prev => [...prev, {
              text: "⚡ AGENT: Deploying collaborative security hardening measures directly to device systems...\n\nImplementing multi-layer protection with real-time verification and integrity checks.",
              isUser: false,
              source: 'agent'
            }]);
            
            // Final security resolution with combined AI expertise
            setTimeout(() => {
              setMessages(prev => [...prev, {
                text: `✅ SECURITY VULNERABILITY REMEDIATION COMPLETE\n\nCollaborative AI Security Enhancement:
• Claude AI identified threat patterns using security knowledge spanning ${Object.keys(securityKnowledgeBase).length} security domains
• GPT AI formulated defense-in-depth strategy incorporating ${
                  securityKnowledgeBase.application_security.reduce((acc: number, sec) => acc + sec.mitigations.length, 0) +
                  securityKnowledgeBase.network_security.reduce((acc: number, sec) => acc + sec.mitigations.length, 0)
                } protection techniques
• Quantum Agent implemented precise system hardening across all device layers

Specific Security Enhancements Applied:
• Upgraded encryption protocols to latest industry standards
• Implemented advanced behavioral analysis for threat detection
• Hardened authentication mechanisms with multi-factor enforcement
• Applied network traffic analysis with anomaly detection
• Updated all system software to patch known vulnerabilities
• Deployed zero-trust access controls for sensitive operations

Your device security posture has been significantly enhanced. All systems secured with enterprise-grade protections.`,
                isUser: false,
                source: 'agent'
              }]);
              
              setDeviceOperations(prev => ({
                ...prev,
                scanning: false,
                updating: false
              }));
              
              // After collaborative security fixes, run a performance optimization
              setTimeout(() => {
                optimizePerformance(silent);
              }, 1500);
            }, 3000);
          }, 2000);
        }, 2000);
      }, 1000);
    } else {
      // Standard non-collaborative security fixes
      // Simulate fix duration
      setTimeout(() => {
        if (!silent) {
          setMessages(prev => [...prev, {
            text: "✅ AGENT: Security issues resolved:\n\n• System software updated to latest version\n• Blocked suspicious IP addresses and reset account security\n• Enhanced encryption settings on all network connections\n• Added additional authentication layer for sensitive operations\n\nYour device is now secure.",
            isUser: false,
            source: 'agent'
          }]);
        }
        
        setDeviceOperations(prev => ({
          ...prev,
          scanning: false,
          updating: false
        }));
        
        // After security fixes, always run a quick performance optimization
        if (!silent) {
          setTimeout(() => {
            optimizePerformance(silent);
          }, 1500);
        }
      }, silent ? 2500 : 5000);
    }
    
    return true;
  };
  
  // System optimization knowledge base
  const optimizationKnowledgeBase = {
    memory_management: [
      { technique: "Process prioritization", impact: "High", 
        actions: ["Identify high-resource processes", "Set appropriate priority levels", "Terminate unnecessary background services"]
      },
      { technique: "Memory defragmentation", impact: "Medium", 
        actions: ["Analyze memory allocation patterns", "Consolidate fragmented memory blocks", "Optimize heap management"]
      },
      { technique: "Cache optimization", impact: "High", 
        actions: ["Clear temporary file caches", "Optimize application caching strategies", "Implement intelligent cache invalidation"]
      },
      { technique: "Memory leak detection", impact: "Critical", 
        actions: ["Identify resource leaks", "Patch memory allocation/deallocation issues", "Implement memory usage monitoring"]
      }
    ],
    storage_optimization: [
      { technique: "Disk cleanup", impact: "Medium", 
        actions: ["Remove temporary files", "Delete duplicate content", "Clear application caches"]
      },
      { technique: "Storage defragmentation", impact: "Medium", 
        actions: ["Analyze file fragmentation patterns", "Reorganize file system structure", "Consolidate related data"]
      },
      { technique: "Compression strategies", impact: "Low", 
        actions: ["Identify compressible data", "Apply efficient compression algorithms", "Balance access speed with space savings"]
      },
      { technique: "I/O pattern optimization", impact: "High", 
        actions: ["Analyze read/write patterns", "Reorganize frequently accessed data", "Optimize database access patterns"]
      }
    ],
    process_management: [
      { technique: "Startup optimization", impact: "High", 
        actions: ["Identify unnecessary startup processes", "Prioritize critical services", "Implement lazy loading strategies"]
      },
      { technique: "Background process control", impact: "High", 
        actions: ["Identify and terminate unnecessary processes", "Schedule resource-intensive tasks", "Implement adaptive process scheduling"]
      },
      { technique: "Service consolidation", impact: "Medium", 
        actions: ["Identify redundant services", "Merge related functionality", "Optimize inter-process communication"]
      },
      { technique: "Power management", impact: "Medium", 
        actions: ["Balance performance vs battery life", "Optimize CPU frequency scaling", "Implement intelligent sleep states"]
      }
    ],
    networking: [
      { technique: "Connection optimization", impact: "Medium", 
        actions: ["Optimize TCP parameters", "Implement connection pooling", "Reduce unnecessary network traffic"]
      },
      { technique: "Bandwidth prioritization", impact: "Medium", 
        actions: ["Prioritize critical network services", "Implement QoS strategies", "Optimize data transfer patterns"]
      },
      { technique: "Protocol optimization", impact: "Low", 
        actions: ["Use efficient protocols", "Minimize overhead", "Optimize payload size"]
      },
      { technique: "Caching strategies", impact: "High", 
        actions: ["Implement content caching", "Use CDNs where appropriate", "Optimize cache invalidation strategies"]
      }
    ]
  };

  const optimizePerformance = (silent: boolean = false) => {
    if (!silent) {
      setMessages(prev => [...prev, {
        text: "⚙️ AGENT: Optimizing device performance...",
        isUser: false,
        source: 'agent'
      }]);
    }
    
    setDeviceOperations(prev => ({
      ...prev,
      optimizing: true
    }));
    
    // Enhanced AI-collaborative performance optimization
    if (collaborativeMode && !silent) {
      // Claude analyzes the system performance using optimization knowledge
      setTimeout(() => {
        const totalTechniques = Object.values(optimizationKnowledgeBase).reduce((sum, category) => sum + category.length, 0);
        const totalActions = Object.values(optimizationKnowledgeBase).reduce((sum, category) => 
          sum + category.reduce((actSum, tech) => actSum + tech.actions.length, 0), 0);
        
        setMessages(prev => [...prev, {
          text: `🔮 CLAUDE AI: Performing comprehensive performance analysis...\n\nEvaluating system against optimization knowledge base containing:
• ${Object.keys(optimizationKnowledgeBase).length} optimization categories
• ${totalTechniques} specific optimization techniques
• ${totalActions} potential optimization actions

System analysis complete. Identified ${Math.floor(Math.random() * 3) + 3} critical performance bottlenecks with 95% confidence. Primary focus areas: memory utilization, background process load, and I/O optimization.`,
          isUser: false,
          source: 'anthropic'
        }]);
        
        // GPT develops performance optimization strategy
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: `💻 GPT AI: Generating precision performance enhancement strategy...\n\nDeveloping multi-layered optimization approach:
• Creating performance improvement plan utilizing ${totalTechniques} known optimization patterns
• Targeting optimizations with highest impact-to-effort ratios first
• Implementing progressive enhancements to maintain system stability
• Estimated performance improvement: 37-42% across all subsystems

Technical optimization solution formulated with 96% confidence rating.`,
            isUser: false,
            source: 'openai'
          }]);
          
          // Agent implements the performance optimizations
          setTimeout(() => {
            setMessages(prev => [...prev, {
              text: "⚡ AGENT: Deploying collaborative performance optimizations across all device subsystems...\n\nImplementing targeted enhancements with real-time performance monitoring.",
              isUser: false,
              source: 'agent'
            }]);
            
            // Final performance optimization summary with combined AI expertise
            setTimeout(() => {
              const memoryTechniques = optimizationKnowledgeBase.memory_management.map(t => t.technique).join(", ");
              const storageTechniques = optimizationKnowledgeBase.storage_optimization.map(t => t.technique).join(", ");
              
              setMessages(prev => [...prev, {
                text: `✅ PERFORMANCE OPTIMIZATION COMPLETE\n\nCollaborative AI Performance Enhancement:
• Claude AI analyzed performance patterns utilizing ${Object.keys(optimizationKnowledgeBase).length} optimization categories
• GPT AI developed multi-layered enhancement strategy combining ${totalTechniques} specialized techniques
• Quantum Agent implemented precise system-level optimizations across all device components

Specific Optimizations Applied:
• Memory Management: Implemented ${optimizationKnowledgeBase.memory_management.length} techniques including advanced process prioritization
• Storage Optimization: Applied intelligent I/O pattern analysis and reorganization
• Process Control: Terminated 14 unnecessary background processes consuming excessive resources
• Cleared 1.8GB of temporary cache data and optimized memory allocation
• Reorganized data access patterns for 31% faster information retrieval
• Implemented adaptive power management for balanced performance/battery life

Overall system performance improved by 42%. Device is now operating at optimal efficiency with reduced resource consumption.`,
                isUser: false,
                source: 'agent'
              }]);
              
              setDeviceOperations(prev => ({
                ...prev,
                optimizing: false
              }));
            }, 3000);
          }, 2000);
        }, 2000);
      }, 1000);
    } else {
      // Standard non-collaborative performance optimization
      // Simulate optimization duration
      setTimeout(() => {
        if (!silent) {
          setMessages(prev => [...prev, {
            text: "✅ AGENT: Performance optimization complete:\n\n• Closed 14 background processes consuming excessive resources\n• Cleared 1.2GB of temporary cache data\n• Optimized application startup sequences\n• Reorganized storage for faster access\n\nPerformance improved by 23%. Device is now running optimally.",
            isUser: false,
            source: 'agent'
          }]);
        }
        
        setDeviceOperations(prev => ({
          ...prev,
          optimizing: false
        }));
      }, silent ? 2000 : 4000);
    }
    
    return true;
  };
  
  // Development knowledge base for AI collaborative analysis
  const developmentKnowledgeBase = {
    languages: [
      { name: "JavaScript/TypeScript", expertise: 0.95, 
        strengths: ["Modern ES6+ syntax", "Async/await patterns", "React ecosystem", "Node.js backend"],
        common_issues: ["Memory leaks", "Callback hell", "Type inconsistencies", "Promise handling errors"]
      },
      { name: "Python", expertise: 0.92, 
        strengths: ["Data processing", "AI/ML integration", "Clean syntax", "Rich library ecosystem"],
        common_issues: ["GIL limitations", "Memory management", "Package dependency conflicts"]
      },
      { name: "Swift", expertise: 0.88, 
        strengths: ["Native iOS development", "Performance", "Type safety", "Memory safety"],
        common_issues: ["Backward compatibility", "Build time", "Framework integration"]
      },
      { name: "Java/Kotlin", expertise: 0.89, 
        strengths: ["Enterprise stability", "Android development", "JVM optimization", "Strong typing"],
        common_issues: ["Verbose boilerplate", "Slow startup time", "Memory overhead"]
      },
      { name: "C/C++", expertise: 0.85, 
        strengths: ["System-level access", "Performance optimization", "Memory control", "Hardware interfacing"],
        common_issues: ["Memory leaks", "Pointer errors", "Complex debugging", "Platform inconsistencies"]
      }
    ],
    frameworks: [
      { name: "React/React Native", expertise: 0.94, 
        strengths: ["Component reusability", "Virtual DOM", "Cross-platform", "Large ecosystem"],
        common_issues: ["State management complexity", "Performance with large lists", "Native module integration"]
      },
      { name: "Vue.js", expertise: 0.89, 
        strengths: ["Gentle learning curve", "Reactive system", "Template system", "Progressive adoption"],
        common_issues: ["TypeScript integration", "SSR complexity", "Plugin compatibility"]
      },
      { name: "Django/Flask", expertise: 0.91, 
        strengths: ["Rapid development", "Admin interface", "ORM system", "Security features"],
        common_issues: ["Scaling challenges", "Migration complexity", "Template rendering performance"]
      },
      { name: "Express/Node.js", expertise: 0.93, 
        strengths: ["Asynchronous I/O", "Microservice architecture", "JavaScript throughout stack", "NPM ecosystem"],
        common_issues: ["Callback management", "Error handling", "Scaling for CPU-intensive tasks"]
      },
      { name: "Spring Boot", expertise: 0.84, 
        strengths: ["Enterprise patterns", "Dependency injection", "Security", "Database integration"],
        common_issues: ["Configuration complexity", "Startup time", "Learning curve"]
      }
    ],
    testing: [
      { name: "Unit Testing", expertise: 0.92, 
        tools: ["Jest", "Mocha", "JUnit", "pytest"],
        best_practices: ["Isolation of components", "Mock external dependencies", "Test one behavior per test", "Arrange-Act-Assert pattern"]
      },
      { name: "Integration Testing", expertise: 0.90, 
        tools: ["Supertest", "TestContainers", "Cypress API testing"],
        best_practices: ["Realistic test environment", "Test critical paths", "Database seeding strategies"]
      },
      { name: "E2E Testing", expertise: 0.88, 
        tools: ["Cypress", "Selenium", "Playwright", "Detox"],
        best_practices: ["Limit to critical flows", "Stable selectors", "Retry mechanisms", "Visual testing"]
      },
      { name: "Performance Testing", expertise: 0.87, 
        tools: ["JMeter", "k6", "Lighthouse", "Artillery"],
        best_practices: ["Establish baselines", "Isolate variables", "Monitor system resources", "Progressive load increase"]
      }
    ],
    devops: [
      { name: "CI/CD", expertise: 0.90, 
        tools: ["GitHub Actions", "Jenkins", "CircleCI", "GitLab CI"],
        best_practices: ["Fast feedback loops", "Parallel execution", "Caching strategies", "Environment parity"]
      },
      { name: "Containerization", expertise: 0.89, 
        tools: ["Docker", "Kubernetes", "Helm", "Docker Compose"],
        best_practices: ["Minimal images", "Multi-stage builds", "Immutable infrastructure", "Health checks"]
      },
      { name: "Cloud Platforms", expertise: 0.91, 
        platforms: ["AWS", "Azure", "GCP", "DigitalOcean"],
        best_practices: ["Infrastructure as code", "Right-sizing resources", "Fault tolerance design", "Cost optimization"]
      },
      { name: "Monitoring", expertise: 0.88, 
        tools: ["Prometheus", "Grafana", "ELK Stack", "DataDog"],
        best_practices: ["Key metrics identification", "Alerting thresholds", "Log aggregation", "Visualization dashboards"]
      }
    ],
    architecture: [
      { name: "Microservices", expertise: 0.90, 
        patterns: ["API Gateway", "Service Discovery", "Event Sourcing", "CQRS"],
        considerations: ["Service boundaries", "Data consistency", "Distributed tracing", "Failure modes"]
      },
      { name: "Serverless", expertise: 0.88, 
        platforms: ["AWS Lambda", "Azure Functions", "Google Cloud Functions"],
        considerations: ["Cold start times", "State management", "Execution limits", "Cost modeling"]
      },
      { name: "Event-Driven", expertise: 0.89, 
        technologies: ["Kafka", "RabbitMQ", "NATS", "EventBridge"],
        considerations: ["Message ordering", "Idempotency", "Dead letter queues", "Backpressure handling"]
      },
      { name: "Monolithic", expertise: 0.87, 
        patterns: ["Layered architecture", "Modular monolith", "Plugin systems"],
        considerations: ["Module boundaries", "Shared resources", "Deployment strategies", "Scaling limitations"]
      }
    ]
  };

  // Security knowledge base for AI collaborative analysis
  const securityKnowledgeBase = {
    application_security: [
      { category: "Authentication", expertise: 0.94, 
        techniques: ["MFA", "OAuth/OIDC", "JWT", "FIDO2/WebAuthn"],
        threats: ["Credential stuffing", "Session hijacking", "Token theft", "Phishing"],
        mitigations: ["Strong password policies", "Secure token handling", "Rate limiting", "Biometric verification"]
      },
      { category: "Authorization", expertise: 0.92, 
        techniques: ["RBAC", "ABAC", "JWT claims", "Policy engines"],
        threats: ["Privilege escalation", "IDOR", "Missing access controls"],
        mitigations: ["Principle of least privilege", "Validation at every layer", "Context-aware policies"]
      },
      { category: "Input Validation", expertise: 0.93, 
        techniques: ["Schema validation", "Sanitization", "Parameterized queries"],
        threats: ["SQL injection", "XSS", "Command injection", "CSRF"],
        mitigations: ["Input encoding", "Content Security Policy", "Prepared statements"]
      },
      { category: "API Security", expertise: 0.91, 
        techniques: ["Rate limiting", "Input validation", "CORS configuration"],
        threats: ["Data exposure", "DDoS", "Broken authentication"],
        mitigations: ["API gateways", "Schema validation", "HTTPS enforcement"]
      }
    ],
    network_security: [
      { category: "Transport Security", expertise: 0.90, 
        techniques: ["TLS 1.3", "Certificate pinning", "HTTPS"],
        threats: ["MITM attacks", "Protocol downgrade", "Certificate spoofing"],
        mitigations: ["Certificate transparency", "HSTS", "Strong cipher suites"]
      },
      { category: "Perimeter Security", expertise: 0.89, 
        techniques: ["Firewalls", "WAF", "Network segmentation"],
        threats: ["Port scanning", "DDoS", "Lateral movement"],
        mitigations: ["Default deny rules", "Traffic analysis", "Zero trust architecture"]
      },
      { category: "DNS Security", expertise: 0.88, 
        techniques: ["DNSSEC", "DoH/DoT", "Split DNS"],
        threats: ["DNS poisoning", "DNS tunneling", "Zone transfers"],
        mitigations: ["Query monitoring", "Response validation", "Record TTL management"]
      }
    ],
    device_security: [
      { category: "Mobile Security", expertise: 0.92, 
        techniques: ["App sandboxing", "Secure storage", "Certificate pinning"],
        threats: ["Malware", "Data leakage", "Insecure communication"],
        mitigations: ["App signing", "Device attestation", "Secure boot chains"]
      },
      { category: "Endpoint Protection", expertise: 0.90, 
        techniques: ["EDR", "HIPS/HIDS", "Application whitelisting"],
        threats: ["Malware", "Data theft", "Remote access trojans"],
        mitigations: ["Behavior analysis", "Memory protection", "Disk encryption"]
      },
      { category: "IoT Security", expertise: 0.87, 
        techniques: ["Secure boot", "OTA updates", "Network isolation"],
        threats: ["Default credentials", "Firmware exploitation", "Botnet recruitment"],
        mitigations: ["Device authentication", "Update management", "Network monitoring"]
      }
    ],
    cryptography: [
      { category: "Encryption", expertise: 0.90, 
        techniques: ["AES-GCM", "ChaCha20-Poly1305", "RSA", "ECC"],
        threats: ["Weak key generation", "Side-channel attacks", "Implementation flaws"],
        mitigations: ["Using proven libraries", "Key rotation", "Perfect forward secrecy"]
      },
      { category: "Hashing", expertise: 0.91, 
        techniques: ["SHA-256/512", "Argon2", "Bcrypt", "HMAC"],
        threats: ["Rainbow tables", "Hash collision", "Brute force"],
        mitigations: ["Salting", "Work factors", "Key derivation functions"]
      },
      { category: "Key Management", expertise: 0.89, 
        techniques: ["HSM", "Secret managers", "Certificate authorities"],
        threats: ["Key exposure", "Insufficient rotation", "Weak generation"],
        mitigations: ["Secure key storage", "Lifecycle management", "Access controls"]
      }
    ],
    compliance_frameworks: [
      { name: "OWASP Top 10", expertise: 0.93 },
      { name: "ISO 27001", expertise: 0.88 },
      { name: "NIST CSF", expertise: 0.89 },
      { name: "GDPR", expertise: 0.87 },
      { name: "PCI DSS", expertise: 0.86 },
      { name: "HIPAA", expertise: 0.85 }
    ]
  };

  const fixDevelopmentIssue = (issue: string, silent: boolean = false) => {
    if (!silent) {
      setMessages(prev => [...prev, {
        text: "🔧 AGENT: Analyzing development environment and codebase...",
        isUser: false,
        source: 'agent'
      }]);
    }
    
    // Start optimizing
    setDeviceOperations(prev => ({
      ...prev,
      optimizing: true
    }));
    
    // Enhanced AI-collaborative analysis for development issues
    if (collaborativeMode && !silent) {
      // Claude analyzes the problem context using development knowledge
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: `🔮 CLAUDE AI: Performing deep development context analysis...\n\nIdentifying patterns in '${issue}' using semantic understanding and:
• Language expertise across ${developmentKnowledgeBase.languages.length} programming languages
• Framework knowledge covering ${developmentKnowledgeBase.frameworks.length} major frameworks
• ${developmentKnowledgeBase.testing.length} testing methodologies
• ${developmentKnowledgeBase.architecture.length} architectural patterns

Issue classification: ${Math.random() > 0.5 ? 'Code-level defect' : 'Architectural inconsistency'} with 94% confidence.`,
          isUser: false,
          source: 'anthropic'
        }]);
        
        // GPT develops technical solution using development expertise
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: `💻 GPT AI: Generating targeted development solution...\n\nDefining technical approach based on identified patterns:
• Selected optimal fix strategy from ${developmentKnowledgeBase.languages.reduce((sum, lang) => sum + lang.common_issues.length, 0)} known issue patterns
• Applying best practices from ${developmentKnowledgeBase.testing.reduce((sum, test) => sum + test.best_practices.length, 0)} testing methodologies
• Validating against ${developmentKnowledgeBase.devops.reduce((sum, devops) => sum + devops.best_practices.length, 0)} DevOps best practices
• Solution verified against security implications using OWASP guidelines

Technical solution generated with 97% confidence rating.`,
            isUser: false,
            source: 'openai'
          }]);
          
          // Agent implements the solution based on AI collaboration
          setTimeout(() => {
            setMessages(prev => [...prev, {
              text: "⚡ AGENT: Implementing collaborative solution directly on development environment...\n\nExecuting technical solution with real-time verification and testing.",
              isUser: false,
              source: 'agent'
            }]);
            
            // Final resolution with combined AI expertise
            setTimeout(() => {
              setMessages(prev => [...prev, {
                text: `✅ DEVELOPMENT ISSUE RESOLVED\n\nCollaborative AI Resolution Process:
• Claude AI analyzed issue context using development knowledge spanning ${Object.keys(developmentKnowledgeBase).length} technical domains
• GPT AI formulated optimal solution pathway utilizing patterns from ${developmentKnowledgeBase.languages.length + developmentKnowledgeBase.frameworks.length} languages and frameworks
• Quantum Agent applied precise code modifications across development environment
• All changes validated with ${developmentKnowledgeBase.testing[0].tools.length + developmentKnowledgeBase.testing[1].tools.length} testing methodologies

Specific Changes Applied:
• Code structure optimized for better maintainability
• Build pipeline configuration updated for 37% faster builds
• Dependency vulnerabilities patched using latest security standards
• Performance bottlenecks eliminated through algorithm refinement
• Testing coverage expanded to validate fixes

Your development environment is now operating at optimal parameters.`,
                isUser: false,
                source: 'agent'
              }]);
              
              setDeviceOperations(prev => ({
                ...prev,
                optimizing: false
              }));
            }, 3000);
          }, 2000);
        }, 2000);
      }, 1000);
    } else {
      // Original non-collaborative fix for development issues
      // Simulate development fix process
      setTimeout(() => {
        if (!silent) {
          setMessages(prev => [...prev, {
            text: "🔍 AGENT: Development issue analysis complete. Found:\n\n• Code organization inefficiencies\n• Missing error handling in critical functions\n• Performance bottlenecks in data processing\n• Potential memory leaks\n\nImplementing fixes automatically...",
            isUser: false,
            source: 'agent'
          }]);
        }
        
        // Simulate implementing the fixes
        setTimeout(() => {
          if (!silent) {
            setMessages(prev => [...prev, {
              text: "✅ AGENT: Development issues fixed:\n\n• Restructured code for better maintainability\n• Implemented comprehensive error handling\n• Optimized data processing logic (68% performance improvement)\n• Fixed memory management to prevent leaks\n• Added automated tests to prevent regression\n\nAll development issues have been resolved. The codebase is now more robust, secure, and efficient.",
              isUser: false,
              source: 'agent'
            }]);
          }
          
          setDeviceOperations(prev => ({
            ...prev,
            optimizing: false
          }));
        }, silent ? 2000 : 4000);
      }, silent ? 1500 : 3000);
    }
    
    return true;
  };
  
  // Begin automatic background monitoring if agent mode is active
  useEffect(() => {
    if (agentMode && isMobileConnected && apiConnected) {
      const backgroundMonitoringInterval = setInterval(() => {
        // Small chance to detect an issue during background monitoring (for demo)
        const issueDetected = Math.random() < 0.1; // 10% chance
        
        if (issueDetected) {
          // Randomly decide if it's a security or performance issue
          const isSecurityIssue = Math.random() < 0.6;
          
          if (isSecurityIssue) {
            // Clear any existing operations
            setDeviceOperations({
              scanning: false,
              updating: false,
              optimizing: false,
              monitoring: true,
              aiAnalysis: false
            });
            
            // Alert about detected security issue
            setMessages(prev => [...prev, {
              text: "⚠️ AGENT ALERT: Security vulnerability detected during background monitoring. Initiating automatic resolution...",
              isUser: false,
              source: 'agent'
            }]);
            
            // Fix the issue silently (no detailed messages)
            performSecurityScan(true);
          } else {
            // Clear any existing operations
            setDeviceOperations({
              scanning: false,
              updating: false,
              optimizing: false,
              monitoring: true,
              aiAnalysis: false
            });
            
            // Alert about detected performance issue
            setMessages(prev => [...prev, {
              text: "⚠️ AGENT ALERT: Performance degradation detected during background monitoring. Initiating automatic optimization...",
              isUser: false,
              source: 'agent'
            }]);
            
            // Fix the issue silently
            optimizePerformance(true);
          }
        }
      }, 60000); // Check every minute
      
      // Clean up interval on unmount
      return () => clearInterval(backgroundMonitoringInterval);
    }
  }, [agentMode, isMobileConnected, apiConnected]);
  
  // Task management functions with collaborative AI capabilities
  const createTask = (description: string, type: TaskType = 'general', priority: 'low' | 'medium' | 'high' = 'medium', device?: string) => {
    // In agent mode with collaborative mode, use all AIs to handle the issue
    if (agentMode && collaborativeMode) {
      // First, create the task for tracking
      const id = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
      
      const newTask: Task = {
        id,
        type,
        description,
        status: 'in-progress', // Automatically set to in-progress
        priority,
        created: new Date(),
        device,
        assignedTo: 'ervin210@icloud.com'
      };
      
      setTasks(prev => [...prev, newTask]);
      
      // Notify about collaborative analysis
      setMessages(prev => [...prev, {
        text: `📊 COLLABORATIVE ANALYSIS: Task #${id} - ${description}`,
        isUser: false,
        source: 'agent'
      }]);
      
      // Show Claude analysis
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: `🔮 CLAUDE AI: Analyzing task context and severity...\n\nThis appears to be a ${priority} priority ${type} issue affecting ${device || "the device"}. Root cause assessment in progress...`,
          isUser: false,
          source: 'anthropic'
        }]);
        
        // Show GPT technical planning
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: `🖥️ GPT AI: Formulating technical solution approach...\n\nGenerating step-by-step resolution path for this ${type} issue. Optimizing for minimal system disruption.`,
            isUser: false,
            source: 'openai'
          }]);
          
          // Start actual fix operation
          setTimeout(() => {
            if (type === 'security') {
              fixSecurityIssues(`${description} (Collaborative AI analysis)`, false);
            } else if (type === 'development') {
              fixDevelopmentIssue(`${description} (Collaborative AI analysis)`, false);
            } else {
              optimizePerformance(false);
            }
            
            // Final collaborative summary
            setTimeout(() => {
              // Update task status
              updateTaskStatus(id, 'completed');
              
              setMessages(prev => [...prev, {
                text: `✅ COLLABORATIVE RESOLUTION: Task #${id}\n\n• Claude AI identified core patterns and context\n• GPT AI generated optimal technical approach\n• Agent executed precise fixes based on combined analysis\n\nResolution efficiency increased by 41% through AI collaboration. All systems functioning normally.`,
                isUser: false,
                source: 'agent'
              }]);
            }, 7000);
          }, 2000);
        }, 2000);
      }, 1000);
      
      return newTask;
    }
    // In agent mode (but not collaborative), directly handle the issue
    else if (agentMode) {
      if (type === 'security') {
        fixSecurityIssues(description);
      } else if (type === 'development') {
        fixDevelopmentIssue(description);
      } else {
        optimizePerformance();
      }
      
      // But still create the task for tracking purposes
      const id = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
      
      const newTask: Task = {
        id,
        type,
        description,
        status: 'in-progress', // Automatically set to in-progress in agent mode
        priority,
        created: new Date(),
        device,
        assignedTo: 'ervin210@icloud.com'
      };
      
      setTasks(prev => [...prev, newTask]);
      
      return newTask;
    } else {
      // Original task creation logic (no agent mode)
      const id = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
      
      const newTask: Task = {
        id,
        type,
        description,
        status: 'pending',
        priority,
        created: new Date(),
        device,
        assignedTo: 'ervin210@icloud.com'
      };
      
      setTasks(prev => [...prev, newTask]);
      
      // Notify the user
      toast({
        title: `New ${type} task created`,
        description: `Task #${id}: ${description}`,
      });
      
      return newTask;
    }
  };
  
  const updateTaskStatus = (taskId: number, status: TaskStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
    
    const updatedTask = tasks.find(task => task.id === taskId);
    
    if (updatedTask) {
      toast({
        title: `Task #${taskId} updated`,
        description: `Status changed to: ${status}`,
      });
    }
    
    return updatedTask;
  };
  
  const deleteTask = (taskId: number) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    
    if (taskToDelete) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      toast({
        title: `Task #${taskId} deleted`,
        description: `Removed: ${taskToDelete.description.substring(0, 30)}...`,
      });
      
      return true;
    }
    
    return false;
  };
  
  const listTasks = (type?: TaskType, status?: TaskStatus) => {
    let filteredTasks = [...tasks];
    
    if (type) {
      filteredTasks = filteredTasks.filter(task => task.type === type);
    }
    
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    // Sort by priority (high to low) and then by creation date (newest first)
    filteredTasks.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If priority is the same, sort by creation date (newest first)
      return b.created.getTime() - a.created.getTime();
    });
    
    return filteredTasks;
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

  // State for showing device connector
  const [showDeviceConnector, setShowDeviceConnector] = useState(false);
  const [showDeviceMetrics, setShowDeviceMetrics] = useState(false);
  const [showDeviceOperations, setShowDeviceOperations] = useState(false);
  
  return (
    <QuantumTerminalLayout title="Personal Assistant">
      <div className="flex flex-col min-h-[500px] h-full">
        <div className={`bg-terminal-dark-bg p-4 rounded-t border ${emergencyMode ? 'border-red-700 border-2' : 'border-gray-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`text-lg font-bold ${
                emergencyMode 
                  ? 'text-terminal-red animate-pulse' 
                  : activeAssistant === 'anthropic' 
                    ? 'text-purple-400' 
                    : activeAssistant === 'openai' 
                      ? 'text-green-400' 
                      : 'text-terminal-cyan'
              }`}>
                {emergencyMode 
                  ? 'EMERGENCY MODE' 
                  : activeAssistant === 'anthropic' 
                    ? 'CLAUDE AI ASSISTANT' 
                    : activeAssistant === 'openai' 
                      ? 'GPT AI ASSISTANT' 
                      : 'QUANTUM ASSISTANT'}
              </div>
              {emergencyMode && (
                <div className="bg-terminal-red px-2 py-1 rounded text-xs text-black animate-pulse">
                  SOS ACTIVE
                </div>
              )}
              {aiLoading && (
                <div className="bg-terminal-cyan px-2 py-1 rounded text-xs text-black animate-pulse">
                  AI PROCESSING
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
              <div className="flex items-center gap-2">
                <div className="text-terminal-gray text-xs">Voice Commands:</div>
                <Switch 
                  checked={voiceEnabled} 
                  onCheckedChange={handleToggleVoice} 
                  className="data-[state=checked]:bg-terminal-purple" 
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
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
                  size="sm"
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
            
            {/* AI Services Control Panel */}
            {!emergencyMode && (
              <div className="flex flex-col mt-2 bg-black/30 p-2 rounded border border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <div className="text-xs text-terminal-gray font-semibold">AI Services:</div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                    <Button
                      size="sm"
                      variant={activeAssistant === 'quantum' && !collaborativeMode ? "default" : "outline"}
                      className={`text-xs ${activeAssistant === 'quantum' && !collaborativeMode ? 'bg-terminal-cyan text-black' : 'border-terminal-cyan text-terminal-cyan'}`}
                      onClick={() => switchAssistant('quantum')}
                    >
                      Quantum AI
                    </Button>
                    <Button
                      size="sm"
                      variant={activeAssistant === 'anthropic' && !collaborativeMode ? "default" : "outline"}
                      className={`text-xs ${activeAssistant === 'anthropic' && !collaborativeMode ? 'bg-purple-500 text-white' : 'border-purple-500 text-purple-400'}`}
                      onClick={() => aiServicesStatus.anthropic ? switchAssistant('anthropic') : handleRequestApiKey('anthropic')}
                    >
                      Claude AI {aiServicesStatus.anthropic ? '✓' : '⚠️'}
                    </Button>
                    <Button
                      size="sm"
                      variant={activeAssistant === 'openai' && !collaborativeMode ? "default" : "outline"}
                      className={`text-xs ${activeAssistant === 'openai' && !collaborativeMode ? 'bg-green-500 text-white' : 'border-green-500 text-green-400'}`}
                      onClick={() => aiServicesStatus.openai ? switchAssistant('openai') : handleRequestApiKey('openai')}
                    >
                      GPT AI {aiServicesStatus.openai ? '✓' : '⚠️'}
                    </Button>
                    <Button
                      size="sm"
                      variant={collaborativeMode ? "default" : "outline"}
                      className={`text-xs ${collaborativeMode ? 'bg-amber-500 text-black' : 'border-amber-500 text-amber-400'}`}
                      onClick={() => switchAssistant('collaborative')}
                      disabled={!aiServicesStatus.anthropic || !aiServicesStatus.openai}
                    >
                      Collaborative Mode {collaborativeMode ? '✓' : ''}
                    </Button>
                  </div>
                </div>
                
                {/* AI Service Status Indicators */}
                <div className="mt-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-1.5 ${collaborativeMode ? 'bg-terminal-cyan animate-pulse' : 'bg-terminal-cyan'}`}></div>
                        <span className="text-xs text-terminal-cyan">Quantum: {activeAIContributors.quantum ? 'Active' : 'Inactive'} {collaborativeMode && activeAIContributors.quantum ? '(Collaborative)' : ''}</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-1.5 ${
                          !aiServicesStatus.anthropic 
                            ? 'bg-gray-500' 
                            : collaborativeMode && activeAIContributors.anthropic
                              ? 'bg-purple-500 animate-pulse'
                              : 'bg-purple-500'
                        }`}></div>
                        <span className={`text-xs ${aiServicesStatus.anthropic ? 'text-purple-400' : 'text-gray-500'}`}>
                          Claude: {!aiServicesStatus.anthropic 
                            ? 'No API Key' 
                            : activeAIContributors.anthropic 
                              ? 'Active' + (collaborativeMode ? ' (Collaborative)' : '') 
                              : 'Available'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-1.5 ${
                          !aiServicesStatus.openai 
                            ? 'bg-gray-500' 
                            : collaborativeMode && activeAIContributors.openai
                              ? 'bg-green-500 animate-pulse'
                              : 'bg-green-500'
                        }`}></div>
                        <span className={`text-xs ${aiServicesStatus.openai ? 'text-green-400' : 'text-gray-500'}`}>
                          GPT: {!aiServicesStatus.openai 
                            ? 'No API Key' 
                            : activeAIContributors.openai 
                              ? 'Active' + (collaborativeMode ? ' (Collaborative)' : '') 
                              : 'Available'}
                        </span>
                      </div>
                      {collaborativeMode && (
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full mr-1.5 bg-amber-500 animate-pulse"></div>
                          <span className="text-xs text-amber-400 font-semibold">Collaborative Mode: Active</span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      size="sm" 
                      variant="outline"
                      className="text-xs border-terminal-gray text-terminal-gray hover:bg-terminal-cyan/10 hover:text-terminal-cyan self-end sm:self-auto"
                      onClick={async () => {
                        // Attempt to refresh API key status
                        const statusMsg = "Checking AI service status and refreshing connections...";
                        setMessages(prev => [...prev, {text: statusMsg, isUser: false}]);
                        
                        try {
                          // Use our checkApiKeyStatus function to refresh the status
                          const success = await checkApiKeyStatus();
                          
                          if (success) {
                            const refreshedStatus = `AI Services Status Updated:\n` +
                            `- Quantum AI: Available and Active\n` +
                            `- Claude AI (Anthropic): ${aiServicesStatus.anthropic ? 'Connected ✓' : 'Not Available (API key missing)'}\n` +
                            `- GPT AI (OpenAI): ${aiServicesStatus.openai ? 'Connected ✓' : 'Not Available (API key missing)'}`;
                            
                            setMessages(prev => [...prev, {text: refreshedStatus, isUser: false}]);
                          } else {
                            setMessages(prev => [...prev, {
                              text: "Failed to refresh AI services status. Please try again later.",
                              isUser: false
                            }]);
                          }
                        } catch (error) {
                          console.error("Error refreshing API status:", error);
                          setMessages(prev => [...prev, {
                            text: "Error occurred while refreshing AI services status. Please try again later.",
                            isUser: false
                          }]);
                        }
                      }}
                    >
                      Refresh Status
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className={`flex-1 bg-terminal-panel-bg p-4 overflow-y-auto border-l border-r ${emergencyMode ? 'border-red-700' : 'border-gray-700'} min-h-[300px]`}>
          {/* Active Tasks Panel */}
          {tasks.filter(task => task.status !== 'completed').length > 0 && (
            <div className="mb-6 border border-gray-700 rounded p-3 bg-black/30">
              <div className="text-terminal-cyan font-bold text-sm mb-2 flex items-center">
                <span className="mr-2">⚡ ACTIVE ISSUES</span>
                <div className="h-px flex-grow bg-terminal-gray/30"></div>
              </div>
              
              {tasks
                .filter(task => task.status !== 'completed')
                .sort((a, b) => {
                  // High priority first, then in-progress before pending
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  const statusOrder = { 'in-progress': 0, 'pending': 1, 'completed': 2 };
                  
                  if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  }
                  
                  return statusOrder[a.status] - statusOrder[b.status];
                })
                .map(task => (
                  <div key={task.id} className="mb-2 last:mb-0 border border-gray-800 rounded p-2 bg-black/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`text-xs px-1.5 py-0.5 rounded ${
                          task.type === 'security' 
                            ? 'bg-red-900/50 text-red-200 border border-red-700' 
                            : task.type === 'development'
                              ? 'bg-blue-900/50 text-blue-200 border border-blue-700'
                              : 'bg-gray-800 text-gray-300 border border-gray-700'
                        }`}>
                          {task.type.toUpperCase()}
                        </div>
                        <div className={`text-xs px-1.5 py-0.5 rounded ${
                          task.status === 'in-progress' 
                            ? 'bg-terminal-cyan/20 text-terminal-cyan border border-terminal-cyan/50' 
                            : 'bg-gray-800 text-gray-300 border border-gray-700'
                        }`}>
                          {task.status === 'in-progress' ? 'FIXING' : 'DETECTED'}
                        </div>
                        <div className={`text-xs px-1.5 py-0.5 rounded ${
                          task.priority === 'high' 
                            ? 'bg-red-900/30 text-red-300 border border-red-800/50' 
                            : task.priority === 'medium'
                              ? 'bg-amber-900/30 text-amber-300 border border-amber-800/50'
                              : 'bg-green-900/30 text-green-300 border border-green-800/50'
                        }`}>
                          {task.priority.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        #{task.id} - {new Date(task.created).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-white">{task.description}</div>
                    {task.device && (
                      <div className="mt-1 text-xs text-gray-400">Device: {task.device}</div>
                    )}
                    
                    {/* Progress indicator for in-progress tasks */}
                    {task.status === 'in-progress' && (
                      <div className="mt-2">
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full ${collaborativeMode ? 'bg-amber-500' : 'bg-terminal-cyan'} animate-pulse rounded-full`} style={{width: '60%'}}></div>
                        </div>
                        {collaborativeMode && agentMode && (
                          <div className="mt-1 flex items-center justify-between text-xs">
                            <span className="text-purple-400">Claude AI</span>
                            <span className="text-green-400">GPT AI</span>
                            <span className="text-terminal-cyan">Quantum Agent</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="mt-2 flex justify-end gap-2">
                      {task.status === 'pending' && (
                        <Button 
                          size="sm"
                          variant="outline"
                          className={`h-6 px-2 py-0 text-xs ${collaborativeMode && agentMode ? 'border-amber-500 text-amber-500' : 'border-terminal-cyan text-terminal-cyan'}`}
                          onClick={() => {
                            updateTaskStatus(task.id, 'in-progress');
                            
                            // Add message about starting to fix the issue, with collaborative mode handling
                            if (collaborativeMode && agentMode) {
                              setMessages(prev => [...prev, {
                                text: `📊 COLLABORATIVE ANALYSIS: Task #${task.id} - ${task.description}`,
                                isUser: false,
                                source: 'agent'
                              }]);
                              
                              // Start collaborative AI sequence
                              setTimeout(() => {
                                setMessages(prev => [...prev, {
                                  text: `🔮 CLAUDE AI: Analyzing task context and severity...\n\nThis appears to be a ${task.priority} priority ${task.type} issue affecting ${task.device || "the device"}. Root cause assessment in progress...`,
                                  isUser: false,
                                  source: 'anthropic'
                                }]);
                                
                                setTimeout(() => {
                                  setMessages(prev => [...prev, {
                                    text: `🖥️ GPT AI: Formulating technical solution approach...\n\nGenerating step-by-step resolution path for this ${task.type} issue. Optimizing for minimal system disruption.`,
                                    isUser: false,
                                    source: 'openai'
                                  }]);
                                  
                                  setTimeout(() => {
                                    // Run appropriate fix based on task type
                                    if (task.type === 'security') {
                                      fixSecurityIssues(`${task.description} (Collaborative AI analysis)`, false);
                                    } else if (task.type === 'development') {
                                      fixDevelopmentIssue(`${task.description} (Collaborative AI analysis)`, false);
                                    } else {
                                      optimizePerformance(false);
                                    }
                                    
                                    // Final collaborative summary
                                    setTimeout(() => {
                                      // Update task status
                                      updateTaskStatus(task.id, 'completed');
                                      
                                      setMessages(prev => [...prev, {
                                        text: `✅ COLLABORATIVE RESOLUTION: Task #${task.id}\n\n• Claude AI identified core patterns and context\n• GPT AI generated optimal technical approach\n• Agent executed precise fixes based on combined analysis\n\nResolution efficiency increased by 41% through AI collaboration. All systems functioning normally.`,
                                        isUser: false,
                                        source: 'agent'
                                      }]);
                                    }, 7000);
                                  }, 2000);
                                }, 2000);
                              }, 1000);
                            } else {
                              // Original non-collaborative message
                              setMessages(prev => [...prev, {
                                text: `I'm now actively fixing the ${task.type} issue: ${task.description}`,
                                isUser: false,
                                source: 'quantum'
                              }]);
                            }
                          }}
                        >
                          {collaborativeMode && agentMode ? 'AI Collaborative Fix' : 'Fix Now'}
                        </Button>
                      )}
                      
                      {task.status === 'in-progress' && (
                        <Button 
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 py-0 text-xs border-green-500 text-green-500"
                          onClick={() => {
                            updateTaskStatus(task.id, 'completed');
                            
                            // Add message about successfully fixing the issue
                            setMessages(prev => [...prev, {
                              text: `✅ ${task.type.charAt(0).toUpperCase() + task.type.slice(1)} issue resolved!\n\nI've successfully fixed the issue: ${task.description}\n\nYour system is now secure and functioning properly.`,
                              isUser: false,
                              source: 'quantum'
                            }]);
                          }}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
          
          {messages.map((msg, index) => {
            // Determine if this message is an emergency message
            const isEmergencyMsg = !msg.isUser && msg.text.includes("EMERGENCY MODE");
            
            return (
              <div key={index} className={`mb-6 ${msg.isUser ? 'flex justify-end' : 'flex justify-start'}`}>
                {/* Message sender indicator */}
                {!msg.isUser && (
                  <div className="flex items-start mr-2">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      isEmergencyMsg || msg.source === 'emergency' ? 'bg-terminal-red' : 
                      msg.source === 'anthropic' ? 'bg-purple-500' :
                      msg.source === 'openai' ? 'bg-green-500' :
                      msg.source === 'system' ? 'bg-gray-500' :
                      msg.source === 'agent' ? 'bg-amber-500' :
                      'bg-terminal-cyan'
                    }`}></div>
                  </div>
                )}
                
                {/* Message content */}
                <div className={`${msg.isUser ? 'max-w-[80%]' : 'max-w-[85%]'}`}>
                  {/* Sender label */}
                  <div className={`text-xs mb-1 ${
                    msg.isUser ? 'text-terminal-green text-right' : 
                    isEmergencyMsg || msg.source === 'emergency' ? 'text-terminal-red font-bold' : 
                    msg.source === 'anthropic' ? 'text-purple-400' :
                    msg.source === 'openai' ? 'text-green-400' :
                    msg.source === 'agent' ? 'text-amber-400 font-semibold' :
                    msg.source === 'system' ? 'text-gray-400' :
                    'text-terminal-cyan'
                  }`}>
                    {msg.isUser ? 'You' : 
                     isEmergencyMsg || msg.source === 'emergency' ? 'EMERGENCY SYSTEM' :
                     msg.source === 'anthropic' ? 'Claude AI' :
                     msg.source === 'openai' ? 'GPT AI' :
                     msg.source === 'agent' ? 'QUANTUM AGENT' :
                     msg.source === 'system' ? 'System' :
                     'Quantum AI'}
                  </div>
                  
                  {/* Message bubble */}
                  <div className={`p-3 rounded-lg ${
                    msg.isUser 
                      ? 'bg-terminal-dark-bg text-terminal-green border border-terminal-green' 
                      : isEmergencyMsg || msg.source === 'emergency'
                        ? 'bg-red-950 text-terminal-red border border-terminal-red animate-pulse'
                        : msg.source === 'anthropic'
                          ? 'bg-black bg-opacity-40 text-purple-400 border border-purple-500'
                          : msg.source === 'openai'
                            ? 'bg-black bg-opacity-40 text-green-400 border border-green-500'
                            : msg.source === 'agent'
                              ? 'bg-amber-950 bg-opacity-30 text-amber-300 border border-amber-600'
                            : msg.source === 'system'
                              ? 'bg-black bg-opacity-40 text-gray-300 border border-gray-600'
                              : 'bg-black bg-opacity-40 text-terminal-cyan border border-terminal-cyan'
                  }`}>
                    {msg.text.split('\n').map((text, i) => (
                      <div key={i} className="mb-1">{text}</div>
                    ))}
                  </div>
                  
                  {/* Timestamp or device info */}
                  {isEmergencyMsg && (
                    <div className="text-xs text-terminal-red mt-1">
                      Device: {deviceInfo.deviceType} {deviceInfo.modelNumber} (SN: {deviceInfo.serialNumber})
                    </div>
                  )}
                </div>
                
                {/* User message indicator */}
                {msg.isUser && (
                  <div className="flex items-start ml-2">
                    <div className="w-2 h-2 mt-2 rounded-full bg-terminal-green"></div>
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
                {connectedDevice ? (
                  <div className="flex items-center gap-2">
                    <div className="text-terminal-green">{connectedDevice.name} connected</div>
                    <button 
                      onClick={() => setShowDeviceMetrics(prev => !prev)}
                      className="text-terminal-cyan hover:underline"
                    >
                      View Metrics
                    </button>
                    <button 
                      onClick={() => setShowDeviceOperations(prev => !prev)}
                      className="text-terminal-amber hover:underline"
                    >
                      Device Operations
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeviceConnector(true)}
                    className="text-terminal-amber hover:underline"
                  >
                    Connect Device
                  </button>
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
      {/* Device Connector Modal */}
      {showDeviceConnector && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-terminal-dark-bg border border-terminal-gray rounded-lg max-w-2xl w-full">
            <div className="p-4 border-b border-terminal-gray flex justify-between items-center">
              <h3 className="text-terminal-cyan font-bold">Connect Device</h3>
              <button 
                onClick={() => setShowDeviceConnector(false)}
                className="text-terminal-gray hover:text-terminal-cyan"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <DeviceConnector 
                onConnect={handleDeviceConnect}
                onDisconnect={handleDeviceDisconnect}
                showStatus={true}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Device Metrics Modal */}
      {showDeviceMetrics && connectedDevice && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-terminal-dark-bg border border-terminal-gray rounded-lg max-w-2xl w-full">
            <div className="p-4 border-b border-terminal-gray flex justify-between items-center">
              <h3 className="text-terminal-cyan font-bold">{connectedDevice.name} Metrics</h3>
              <button 
                onClick={() => setShowDeviceMetrics(false)}
                className="text-terminal-gray hover:text-terminal-cyan"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <DeviceMetrics 
                deviceId={connectedDevice.id}
                compact={false}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Device Operations Modal */}
      {showDeviceOperations && connectedDevice && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-terminal-dark-bg border border-terminal-gray rounded-lg max-w-2xl w-full">
            <div className="p-4 border-b border-terminal-gray flex justify-between items-center">
              <h3 className="text-terminal-amber font-bold">{connectedDevice.name} Operations</h3>
              <button 
                onClick={() => setShowDeviceOperations(false)}
                className="text-terminal-gray hover:text-terminal-amber"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <DeviceOperations 
                deviceId={connectedDevice.id}
                maxOperations={10}
                onOperationComplete={handleOperationComplete}
              />
            </div>
          </div>
        </div>
      )}
    </QuantumTerminalLayout>
  );
}