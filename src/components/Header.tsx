import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, X, User, Settings } from "lucide-react";
const logoLight = "/u-topia-logo-light.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email) {
        try {
          const response = await fetch("/api/admin/check");
          const data = await response.json();
          setIsAdmin(data.isAdmin || false);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

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

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/refer-and-earn", label: "Refer & Earn" },
    { path: "/purchase", label: "Purchase" },
    { path: "/dashboard", label: "Dashboard" },
    ...(isAdmin ? [{ path: "/admin", label: "Admin", isAdmin: true }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0f1a] border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src={logoLight} alt="U-topia" className="h-8 md:h-10" />
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center justify-center gap-8 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={
                  isActive(link.path)
                    ? "text-white font-medium"
                    : "text-gray-400 hover:text-white transition-colors"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Button / User Avatar - Right */}
          <div className="hidden md:flex items-center flex-shrink-0">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <Avatar className="h-9 w-9 border-2 border-primary/50 cursor-pointer hover:border-primary transition-colors">
                      <AvatarImage
                        src={user?.profile?.avatarUrl || undefined}
                        alt="Profile"
                      />
                      <AvatarFallback className="bg-primary/20 text-white text-sm font-medium">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">
                      {user?.profile?.fullName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
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
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  Join Now
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white ml-auto"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col gap-4">
              {/* User info in mobile menu */}
              {user && (
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 pb-3 border-b border-white/10 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/50">
                    <AvatarImage
                      src={user?.profile?.avatarUrl || undefined}
                      alt="Profile"
                    />
                    <AvatarFallback className="bg-primary/20 text-white text-sm font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden flex-1">
                    <p className="text-white text-sm font-medium truncate">
                      {user?.profile?.fullName || "User"}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Settings className="h-4 w-4 text-gray-400" />
                </Link>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={
                    isActive(link.path)
                      ? "text-white font-medium"
                      : "text-gray-400 hover:text-white transition-colors"
                  }
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2 w-fit border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="default" size="sm">
                    Join Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
