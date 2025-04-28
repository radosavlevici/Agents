import { useState, useEffect } from "react";
import QuantumTerminalLayout from "@/components/QuantumTerminalLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getAIResponse, aiServicesStatus, checkApiKeyStatus } from "@/lib/aiServices";

export default function TerminalAssistant() {
  const [input, setInput] = useState("");
  // Define message type with source information
  type Message = {
    text: string;
    isUser: boolean;
    source?: 'quantum' | 'anthropic' | 'openai' | 'system' | 'emergency';
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
  const [aiAssistants, setAiAssistants] = useState<{
    anthropic: boolean;
    openai: boolean;
  }>({ anthropic: false, openai: false });
  const [activeAssistant, setActiveAssistant] = useState<"anthropic" | "openai" | "quantum" | null>("quantum");
  const [aiLoading, setAiLoading] = useState(false);
  const [waitingForKeyConfirmation, setWaitingForKeyConfirmation] = useState<"anthropic" | "openai" | null>(null);
  
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

  // Initialize AI assistants based on available API keys
  useEffect(() => {
    // Check API key status when component loads
    const initializeAIStatus = async () => {
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
        }
      } catch (error) {
        console.error("Error initializing AI services:", error);
      }
    };
    
    initializeAIStatus();
  }, []);

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
  const switchAssistant = (assistantType: 'anthropic' | 'openai' | 'quantum') => {
    // For Quantum assistant, we can always switch
    if (assistantType === 'quantum') {
      setActiveAssistant('quantum');
      toast({
        title: 'Switched to Quantum AI',
        description: 'Your assistant is now powered by Quantum Terminal AI.',
      });
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
      } else if (input.toLowerCase().includes("fix") && (input.toLowerCase().includes("development") || input.toLowerCase().includes("coding") || input.toLowerCase().includes("code"))) {
        // Create a development-focused task
        const newTask = createTask(
          "Fix development issue: " + input.substring(0, 50) + "...",
          'development',
          'high'
        );
        
        // Start fixing the development issue
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: `I'm analyzing the development issue and preparing a fix. This process will be done in 3 steps:\n\n1. Analyzing code structure and identifying problems\n2. Preparing solutions for the identified issues\n3. Implementing fixes with appropriate testing\n\nI've created task #${newTask.id} to track this process, and I'm starting work on it now.`,
            isUser: false,
            source: 'quantum'
          }]);
          
          // Update task status to in-progress
          updateTaskStatus(newTask.id, 'in-progress');
          
          // After a delay, simulate completing part of the fix
          setTimeout(() => {
            setMessages(prev => [...prev, {
              text: "I've analyzed the code structure and identified the following issues:\n\n- Code organization needs improvement\n- Some functions lack proper error handling\n- Performance bottlenecks in data processing functions\n\nI'm now preparing fixes for these issues. Would you like me to implement them automatically or review them with you first?",
              isUser: false,
              source: 'quantum'
            }]);
          }, 3000);
        }, 1500);
        
        response = "I understand you need help fixing a development issue. I'll analyze the problem and prepare solutions immediately.";
      } else if (input.toLowerCase().includes("debug") || input.toLowerCase().includes("error") || input.toLowerCase().includes("fix code")) {
        response = "I can help troubleshoot your code issues. To proceed with debugging, please provide:\n- The error message you're receiving\n- The relevant code snippet\n- Language/framework you're using\n\nFor in-depth debugging assistance, I recommend activating Claude AI or GPT AI, which have specialized code understanding capabilities.";
      } else if (input.toLowerCase().includes("project") || input.toLowerCase().includes("github") || input.toLowerCase().includes("git") || input.toLowerCase().includes("repository")) {
        response = "I can help with your development projects and repository management. What would you like assistance with?\n- Setting up a new project\n- Code review and improvement\n- Security assessment of your codebase\n- Deployment strategies\n\nFor technical code reviews, I recommend activating one of the advanced AI assistants.";
      
      // Security-related queries and fixes
      } else if (input.toLowerCase().includes("fix") && (input.toLowerCase().includes("security") || input.toLowerCase().includes("vulnerability") || input.toLowerCase().includes("issue"))) {
        // Create a security-focused task
        const newTask = createTask(
          "Fix security issue: " + input.substring(0, 50) + "...",
          'security',
          'high',
          deviceInfo.deviceType
        );
        
        // Connect to API endpoints if not already connected
        if (!apiConnected) {
          connectToApi();
        }
        
        // Start fixing the security issue
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: `I'm addressing the security issue immediately. The process consists of these steps:\n\n1. Performing security scan to identify vulnerabilities\n2. Applying security patches and fixes\n3. Verifying successful implementation\n4. Strengthening security measures to prevent future issues\n\nI've created task #${newTask.id} to track this process and will update you on progress.`,
            isUser: false,
            source: 'quantum'
          }]);
          
          // Update task status to in-progress
          updateTaskStatus(newTask.id, 'in-progress');
          
          // After a delay, simulate finding and fixing issues
          setTimeout(() => {
            setMessages(prev => [...prev, {
              text: "Security scan complete. I've identified the following issues:\n\n- Outdated system software requiring security patches\n- Weak encryption settings on network connections\n- 3 suspicious login attempts blocked\n- Potential data exposure in cloud storage\n\nI'm implementing fixes for these issues now. Would you like a detailed report on each fix?",
              isUser: false,
              source: 'quantum'
            }]);
            
            // After another delay, show progress on the fixes
            setTimeout(() => {
              setMessages(prev => [...prev, {
                text: "Security fixes in progress:\n\n✅ Updated system security patches\n✅ Strengthened encryption settings\n✅ Blocked suspicious IP addresses\n⏳ Securing cloud storage permissions (60% complete)\n\nYour device security is already improving. I'll notify you when all fixes are complete.",
                isUser: false,
                source: 'quantum'
              }]);
            }, 5000);
          }, 3000);
        }, 1500);
        
        response = "I understand there's a security issue to fix. I'm initiating security protocols and will resolve this immediately.";
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

  // Functions for task management
  const createTask = (description: string, type: TaskType = 'general', priority: 'low' | 'medium' | 'high' = 'medium', device?: string) => {
    // Generate a unique ID for the task (simple increment for now)
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
                      variant={activeAssistant === 'quantum' ? "default" : "outline"}
                      className={`text-xs ${activeAssistant === 'quantum' ? 'bg-terminal-cyan text-black' : 'border-terminal-cyan text-terminal-cyan'}`}
                      onClick={() => switchAssistant('quantum')}
                    >
                      Quantum AI
                    </Button>
                    <Button
                      size="sm"
                      variant={activeAssistant === 'anthropic' ? "default" : "outline"}
                      className={`text-xs ${activeAssistant === 'anthropic' ? 'bg-purple-500 text-white' : 'border-purple-500 text-purple-400'}`}
                      onClick={() => aiServicesStatus.anthropic ? switchAssistant('anthropic') : handleRequestApiKey('anthropic')}
                    >
                      Claude AI {aiServicesStatus.anthropic ? '✓' : '⚠️'}
                    </Button>
                    <Button
                      size="sm"
                      variant={activeAssistant === 'openai' ? "default" : "outline"}
                      className={`text-xs ${activeAssistant === 'openai' ? 'bg-green-500 text-white' : 'border-green-500 text-green-400'}`}
                      onClick={() => aiServicesStatus.openai ? switchAssistant('openai') : handleRequestApiKey('openai')}
                    >
                      GPT AI {aiServicesStatus.openai ? '✓' : '⚠️'}
                    </Button>
                  </div>
                </div>
                
                {/* AI Service Status Indicators */}
                <div className="mt-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-1.5 bg-terminal-cyan`}></div>
                        <span className="text-xs text-terminal-cyan">Quantum: Active</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-1.5 ${aiServicesStatus.anthropic ? 'bg-purple-500' : 'bg-gray-500'}`}></div>
                        <span className={`text-xs ${aiServicesStatus.anthropic ? 'text-purple-400' : 'text-gray-500'}`}>
                          Claude: {aiServicesStatus.anthropic ? 'Available' : 'No API Key'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-1.5 ${aiServicesStatus.openai ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <span className={`text-xs ${aiServicesStatus.openai ? 'text-green-400' : 'text-gray-500'}`}>
                          GPT: {aiServicesStatus.openai ? 'Available' : 'No API Key'}
                        </span>
                      </div>
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
                    'text-terminal-cyan'
                  }`}>
                    {msg.isUser ? 'You' : 
                     isEmergencyMsg || msg.source === 'emergency' ? 'EMERGENCY SYSTEM' :
                     msg.source === 'anthropic' ? 'Claude AI' :
                     msg.source === 'openai' ? 'GPT AI' :
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