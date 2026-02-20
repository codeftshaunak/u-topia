import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  ShoppingBag,
  LayoutDashboard,
  Shield,
  Compass,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckAdminQuery } from "@/store/features/admin/adminApi";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const { data: adminData } = useCheckAdminQuery(undefined, {
    skip: !user?.email,
  });
  const isAdmin = adminData?.isAdmin ?? false;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/explore", label: "Explore", icon: Compass },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/purchase", label: "Purchase", icon: ShoppingBag },
    ...(isAdmin ? [{ path: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  // Don't show on auth page
  if (
    location.pathname === "/auth" ||
    location.pathname === "/reset-password"
  ) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0f1a] border-t border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] ${
                active
                  ? "text-primary bg-primary/10"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
