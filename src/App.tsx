import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { DemoProvider } from "./contexts/DemoContext";
import Layout from "./components/layout";
import ProtectedRoute from "./components/ProtectedRoute";
import BottomNav from "./components/BottomNav";

// Landing & Auth Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";

// Membership & Purchase Pages
import Purchase from "./pages/Purchase";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import ReferAndEarn from "./pages/ReferAndEarn";
import Onboarding from "./pages/Onboarding";
import Upgrade from "./pages/Upgrade";

// Dashboard Pages
import Dashboard from "./pages/Dashboard";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import ProfileSettings from "./pages/ProfileSettings";

// Community Pages (from membership project)
import Messages from "./pages/Messages";
import Members from "./pages/Members";
import Files from "./pages/Files";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Settings from "./pages/Settings";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetail from "./pages/AdminUserDetail";
import ShareholderPortal from "./pages/ShareholderPortal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="app-theme">
      <DemoProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/refer-and-earn" element={<ReferAndEarn />} />

              {/* Purchase Flow */}
              <Route path="/purchase" element={<Purchase />} />
              <Route path="/purchase-success" element={<PurchaseSuccess />} />

              {/* Onboarding */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard & Profile */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/affiliate"
                element={
                  <ProtectedRoute>
                    <AffiliateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                }
              />

              {/* Community Features (Membership) */}
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Messages />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages/channel/:channelName"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Messages />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Members />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/files"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Files />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/about"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <About />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contact"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Contact />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upgrade"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Upgrade />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Pages */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:id"
                element={
                  <ProtectedRoute>
                    <AdminUserDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shareholder-portal"
                element={
                  <ProtectedRoute>
                    <ShareholderPortal />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-all */}
              <Route path="*" element={<Index />} />
            </Routes>
            <BottomNav />
          </BrowserRouter>
        </TooltipProvider>
      </DemoProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
