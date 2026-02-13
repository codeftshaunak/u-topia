import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Settings,
  Info,
  ChevronRight,
  Gem,
  TrendingUp,
  Compass,
} from "lucide-react";
const utopiaLogoLight = "/utopia-logo.avif";
const utopiaLogoOriginal = "/u-topia-logo-dark.png";
import { useTheme } from "@/components/theme-provider";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainItems = [
  { title: "Explore", url: "/explore", icon: Compass },
  { title: "Dashboard", url: "/dashboard", icon: TrendingUp },
  { title: "My Network", url: "/members", icon: Users },
  { title: "About U-topia", url: "/about", icon: Info },
  { title: "Upgrade", url: "/upgrade", icon: Gem },
];

const channels = [
  { name: "announcements", unread: 2 },
  { name: "u-topia-materials", unread: 0 },
  { name: "events-calendar", unread: 1 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

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

  // Only show theme-dependent content after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolve the actual theme (handle system preference)
  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  console.log({ theme, resolvedTheme, mounted });

  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Use original logo for light mode, light logo for dark mode
  // Default to original logo if theme is not yet loaded
  const logo =
    mounted && resolvedTheme === "dark" ? utopiaLogoLight : utopiaLogoOriginal;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card">
        {/* Header */}
        <div className="p-4 border-b">
          {!collapsed && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-28 overflow-hidden">
                  <img
                    src={logo}
                    alt="U-topia"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <SidebarTrigger className="h-6 w-6" />
            </div>
          )}
          {collapsed && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative h-8 w-8 rounded-lg overflow-hidden">
                <img
                  src={logo}
                  alt="U-topia"
                  className="h-full w-full object-contain"
                />
              </div>
              <SidebarTrigger className="h-6 w-6" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Channels */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between text-foreground">
              <span>Channels</span>
              <ChevronRight className="h-4 w-4" />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {channels.map((channel) => (
                  <SidebarMenuItem key={channel.name}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/messages/channel/${channel.name}`}
                        className="flex items-center justify-between hover:bg-muted/50 text-foreground"
                      >
                        <span className="text-foreground">
                          # {channel.name}
                        </span>
                        {channel.unread > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                            {channel.unread}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Profile */}
        <div className="mt-auto p-4 border-t">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 border-2 border-primary/50">
                <AvatarImage
                  src={user?.profile?.avatarUrl || undefined}
                  alt="Profile"
                />
                <AvatarFallback className="bg-primary/20 text-foreground text-sm font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.profile?.fullName || user?.email || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || "Member"}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <NavLink to="/settings">
                  <Settings className="h-4 w-4" />
                </NavLink>
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar className="h-8 w-8 border-2 border-primary/50">
                <AvatarImage
                  src={user?.profile?.avatarUrl || undefined}
                  alt="Profile"
                />
                <AvatarFallback className="bg-primary/20 text-foreground text-sm font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
