import { useState, useEffect } from "react";
import { User, ChevronDown, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authService } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "@/components/ui/notification-bell";

interface TopNavProps {
  sidebarCollapsed?: boolean;
}

export function TopNav({ sidebarCollapsed = false }: TopNavProps) {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // Listen for auth changes
    const unsubscribe = authService.onUserChange((user) => {
      setCurrentUser(user);
    });
    
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      authService.logout();
      setCurrentUser(null);
      navigate('/login');
    }
  };

  const getUserDisplayName = () => {
    if (!currentUser) return 'Guest User';
    const emailName = currentUser.email?.split('@')[0] || 'User';
    return currentUser.role === 'DOCTOR' ? `Dr. ${emailName}` : emailName;
  };

  const getUserRole = () => {
    if (!currentUser) return 'Guest';
    return currentUser.role === 'DOCTOR' ? `License: ${currentUser.licenseNumber || 'N/A'}` :
           currentUser.role === 'PHARMACY' ? 'Pharmacy Staff' : 'Patient';
  };

  return (
    <header
      className="fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg px-6 transition-all duration-300"
      style={{ left: sidebarCollapsed ? "4rem" : "16rem" }}
    >
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search queries, reports, insights..."
          className="pl-10 bg-secondary/50 border-transparent focus:bg-background focus:border-input"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <StatusIndicator />
        
        {/* Help */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[hsl(199,89%,48%)]">
                <User className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium">{getUserDisplayName()}</span>
                <span className="text-xs text-muted-foreground">{getUserRole()}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Team Management</DropdownMenuItem>
            <DropdownMenuItem>Billing & Usage</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
