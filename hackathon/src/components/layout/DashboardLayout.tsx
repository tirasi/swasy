import { ReactNode, useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopNav } from "./TopNav";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { voiceAssistant } from "@/lib/voiceAssistant";


interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    setVoiceEnabled(voiceAssistant.isEnabled());
  }, []);

  const toggleVoice = () => {
    if (voiceEnabled) {
      voiceAssistant.disable();
      setVoiceEnabled(false);
    } else {
      voiceAssistant.enable('hi-IN');
      setVoiceEnabled(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppSidebar />
      <TopNav />
      
      {/* Global Voice Assistant Button */}
      <Button
        onClick={toggleVoice}
        className={`fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl transition-all duration-300 ${
          voiceEnabled 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 animate-pulse' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        }`}
        title={voiceEnabled ? 'Voice Assistant ON - Click to disable' : 'Voice Assistant OFF - Click to enable'}
      >
        {voiceEnabled ? (
          <Volume2 className="h-8 w-8 text-white" />
        ) : (
          <VolumeX className="h-8 w-8 text-white" />
        )}
      </Button>
      
      {voiceEnabled && (
        <div className="fixed bottom-24 right-6 z-50 glass-card rounded-lg p-3 shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-green-700">Voice Assistant Active</p>
          </div>
          <p className="text-xs text-gray-600 mt-1">Say "मदद" or "help" for commands</p>
        </div>
      )}
      
      <main className="ml-64 pt-16 transition-all duration-300 flex-1">
        <div className="p-6">{children}</div>
      </main>
      <footer className="ml-64 py-4 text-center text-xs text-muted-foreground border-t border-border">
        by team Elite Neurals
      </footer>
    </div>
  );
}
