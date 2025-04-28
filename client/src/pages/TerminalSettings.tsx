import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import QuantumTerminalLayout from "@/components/QuantumTerminalLayout";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export default function TerminalSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    autoScan: true,
    darkMode: true,
    soundEffects: true,
    scanFrequency: 75, // percentage
    privacyLevel: 85, // percentage
    assistantEnabled: true,
    assistantVoice: true,
    language: "English"
  });
  
  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };
  
  const handleSliderChange = (setting: string, value: number[]) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value[0]
    }));
  };
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your Quantum Terminal settings have been updated successfully.",
    });
  };
  
  const languageOptions = ["English", "Spanish", "French", "German", "Chinese", "Japanese"];
  
  return (
    <QuantumTerminalLayout title="Settings">
      <div className="text-terminal-cyan font-bold mb-4 text-xl">QUANTUM TERMINAL SETTINGS</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-terminal-dark-bg p-4 rounded border border-gray-700">
          <div className="text-terminal-green font-bold mb-4">System Settings</div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-white">Dark Mode</div>
              <Switch 
                checked={settings.darkMode} 
                onCheckedChange={() => handleToggle("darkMode")} 
                className="data-[state=checked]:bg-terminal-cyan" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-white">Sound Effects</div>
              <Switch 
                checked={settings.soundEffects} 
                onCheckedChange={() => handleToggle("soundEffects")} 
                className="data-[state=checked]:bg-terminal-cyan" 
              />
            </div>
            
            <div className="mt-3">
              <div className="text-white mb-2">Interface Language</div>
              <div className="grid grid-cols-2 gap-2">
                {languageOptions.map(lang => (
                  <Button 
                    key={lang}
                    variant={settings.language === lang ? "default" : "outline"}
                    className={settings.language === lang 
                      ? "bg-terminal-cyan text-black hover:bg-terminal-cyan/80" 
                      : "border-terminal-gray text-terminal-gray hover:bg-terminal-dark-bg hover:text-terminal-cyan"}
                    onClick={() => setSettings(prev => ({ ...prev, language: lang }))}
                    size="sm"
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-terminal-dark-bg p-4 rounded border border-gray-700">
          <div className="text-terminal-green font-bold mb-4">Security Settings</div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-white">Automatic Scans</div>
              <Switch 
                checked={settings.autoScan} 
                onCheckedChange={() => handleToggle("autoScan")} 
                className="data-[state=checked]:bg-terminal-green" 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <div className="text-white text-sm">Scan Frequency</div>
                <div className="text-terminal-green text-sm">{settings.scanFrequency}%</div>
              </div>
              <Slider 
                defaultValue={[settings.scanFrequency]} 
                max={100} 
                step={5}
                onValueChange={(value) => handleSliderChange("scanFrequency", value)} 
                className="data-[state=checked]:bg-terminal-green" 
              />
              <div className="flex justify-between text-xs text-terminal-gray mt-1">
                <div>Low</div>
                <div>High</div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <div className="text-white text-sm">Privacy Level</div>
                <div className="text-terminal-amber text-sm">{settings.privacyLevel}%</div>
              </div>
              <Slider 
                defaultValue={[settings.privacyLevel]} 
                max={100} 
                step={5}
                onValueChange={(value) => handleSliderChange("privacyLevel", value)} 
                className="data-[state=checked]:bg-terminal-amber" 
              />
              <div className="flex justify-between text-xs text-terminal-gray mt-1">
                <div>Standard</div>
                <div>Maximum</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-terminal-dark-bg p-4 rounded border border-gray-700">
          <div className="text-terminal-green font-bold mb-4">Notifications</div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-white">Enable Notifications</div>
              <Switch 
                checked={settings.notifications} 
                onCheckedChange={() => handleToggle("notifications")} 
                className="data-[state=checked]:bg-terminal-amber" 
              />
            </div>
            
            <div className="p-3 bg-black bg-opacity-30 rounded">
              <div className="flex justify-between items-center mb-2">
                <div className="text-terminal-gray text-sm">Critical Alerts</div>
                <Badge className="bg-terminal-red/20 text-terminal-red">Always On</Badge>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-terminal-gray text-sm">Security Updates</div>
                <Badge className="bg-terminal-green/20 text-terminal-green">Enabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-terminal-gray text-sm">System Messages</div>
                <Badge className="bg-terminal-amber/20 text-terminal-amber">Enabled</Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-terminal-dark-bg p-4 rounded border border-gray-700">
          <div className="text-terminal-green font-bold mb-4">Assistant Settings</div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-white">Enable Assistant</div>
              <Switch 
                checked={settings.assistantEnabled} 
                onCheckedChange={() => handleToggle("assistantEnabled")} 
                className="data-[state=checked]:bg-terminal-purple" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-white">Voice Interaction</div>
              <Switch 
                checked={settings.assistantVoice} 
                onCheckedChange={() => handleToggle("assistantVoice")} 
                className="data-[state=checked]:bg-terminal-purple" 
                disabled={!settings.assistantEnabled}
              />
            </div>
            
            <div className="p-3 bg-black bg-opacity-30 rounded">
              <div className="text-terminal-cyan text-sm mb-1">Assistant Configuration</div>
              <div className="text-terminal-gray text-sm">User ID: ervin210@icloud.com</div>
              <div className="text-terminal-gray text-sm">Mode: Advanced Cybersecurity</div>
              <div className="text-terminal-gray text-sm">Access Level: Root</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" className="border-terminal-gray text-terminal-gray hover:bg-terminal-dark-bg">
          Reset to Default
        </Button>
        <Button 
          className="bg-terminal-green text-black hover:bg-terminal-green/80"
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </div>
    </QuantumTerminalLayout>
  );
}