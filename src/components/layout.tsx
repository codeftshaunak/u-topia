import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Search, Settings, X, User, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatBot } from "@/components/community/ChatBot";
import { useDemoMode } from "@/contexts/DemoContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDemoMode, exitDemoMode, demoUser } = useDemoMode();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getInitials = () => {
    if (user?.profile?.fullName) {
      return user.profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const handleExitDemo = () => {
    exitDemoMode();
    navigate("/auth");
    toast({
      title: "Demo mode ended",
      description: "Sign in to access your account",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Demo Mode Banner */}
          {isDemoMode && (
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-primary/20 text-primary border-primary/30"
                >
                  Demo Mode
                </Badge>
                <span className="text-sm text-muted-foreground">
                  You're viewing sample data. Sign in to access your account.
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExitDemo}
                className="text-primary hover:text-primary/80"
              >
                <X className="h-4 w-4 mr-1" />
                Exit Demo
              </Button>
            </div>
          )}

          {/* Top Header */}
          <header className="h-16 border-b bg-card px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="w-96 pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-3 pl-3 border-l cursor-pointer">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">
                        {isDemoMode
                          ? demoUser.full_name
                          : user?.profile?.fullName || user?.email || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isDemoMode ? "Demo Account" : user?.email || "Member"}
                      </p>
                    </div>
                    <Avatar className="h-8 w-8 border-2 border-primary/50 cursor-pointer hover:border-primary transition-colors">
                      <AvatarImage
                        src={
                          isDemoMode
                            ? undefined
                            : user?.profile?.avatarUrl || undefined
                        }
                        alt="Profile"
                      />
                      <AvatarFallback className="bg-primary/20 text-foreground text-sm font-medium">
                        {isDemoMode ? "DU" : getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">
                      {isDemoMode
                        ? demoUser.full_name
                        : user?.profile?.fullName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {isDemoMode ? demoUser.email : user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/explore" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>

        {/* Chat Bot */}
        <ChatBot />
      </div>
    </SidebarProvider>
  );
}
