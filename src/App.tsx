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
import Index from "./app-pages/Index";
import Auth from "./app-pages/Auth";
import ResetPassword from "./app-pages/ResetPassword";

// Membership & Purchase Pages
import Purchase from "./app-pages/Purchase";
import PurchaseSuccess from "./app-pages/PurchaseSuccess";
import ReferAndEarn from "./app-pages/ReferAndEarn";
import Onboarding from "./app-pages/Onboarding";

// Dashboard Pages
import Dashboard from "./app-pages/Dashboard";
import DashboardPurchase from "./app-pages/DashboardPurchase";
import AffiliateDashboard from "./app-pages/AffiliateDashboard";
import ProfileSettings from "./app-pages/ProfileSettings";

// Community Pages (from membership project)
import Explore from "./app-pages/Explore";
import Messages from "./app-pages/Messages";
import Members from "./app-pages/Members";
import Files from "./app-pages/Files";
import About from "./app-pages/About";
import Contact from "./app-pages/Contact";
import Settings from "./app-pages/Settings";

// Admin Pages
import AdminDashboard from "./app-pages/AdminDashboard";
import AdminUserDetail from "./app-pages/AdminUserDetail";
import ShareholderPortal from "./app-pages/ShareholderPortal";

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
                path="/dashboard/purchase"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPurchase />
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
                path="/explore"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Explore />
                    </Layout>
                  </ProtectedRoute>
                }
              />
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
