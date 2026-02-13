import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  exitDemoMode: () => void;
  demoUser: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
  };
}

const DEMO_STORAGE_KEY = "utopia_demo_mode";

const demoUser = {
  id: "demo-user-id",
  email: "demo@utopia.com",
  full_name: "Demo User",
  avatar_url: "",
};

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (stored === "true") {
      setIsDemoMode(true);
    }
  }, []);

  const enableDemoMode = () => {
    localStorage.setItem(DEMO_STORAGE_KEY, "true");
    setIsDemoMode(true);
  };

  const exitDemoMode = () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setIsDemoMode(false);
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, enableDemoMode, exitDemoMode, demoUser }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoProvider");
  }
  return context;
}
