import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const DEMO_STORAGE_KEY = "utopia_demo_mode";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check for demo mode
    const demoMode = localStorage.getItem(DEMO_STORAGE_KEY) === "true";
    setIsDemoMode(demoMode);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow access if in demo mode or authenticated
  if (isDemoMode || user) {
    return <>{children}</>;
  }

  return <Navigate to="/auth" replace />;
}
