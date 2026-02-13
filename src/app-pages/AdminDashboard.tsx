export const dynamic = "force-dynamic";


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { UsersTable } from "@/components/admin/UsersTable";
import { TierBreakdown } from "@/components/admin/TierBreakdown";
import { AdminSettings } from "@/components/admin/settings/AdminSettings";
import { CommissionManagement } from "@/components/admin/CommissionManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserCheck,
  Link2,
  DollarSign,
  Gift,
  Clock,
  Loader2,
  Shield,
  Calendar,
  LayoutDashboard,
  Activity,
  Settings,
  Wallet,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { stats, isLoading: statsLoading } = useAdminStats();
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have access to that page.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Use real stats from the hook
  const metrics = stats;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <section className="container mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                <Shield className="w-3 h-3" />
                Admin Mode
              </Badge>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground">
              Platform-wide overview and management
            </p>
          </div>
          {activeTab !== "settings" && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="container mx-auto px-6 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-xl grid-cols-5 h-12">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="commissions" className="gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Commissions</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-8 space-y-8">
            {/* Global Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminMetricCard
                label="Total Users"
                value={metrics.totalUsers}
                icon={<Users className="w-5 h-5 text-primary" />}
                subtext="Registered accounts"
                trend={{ value: "+12%", isPositive: true }}
              />
              <AdminMetricCard
                label="Verified Users"
                value={metrics.verifiedUsers}
                icon={<UserCheck className="w-5 h-5 text-primary" />}
                subtext={`${Math.round((metrics.verifiedUsers / metrics.totalUsers) * 100)}% verification rate`}
              />
              <AdminMetricCard
                label="Total Referrals"
                value={metrics.totalReferrals}
                icon={<Link2 className="w-5 h-5 text-primary" />}
                subtext="Referral links created"
              />
              <AdminMetricCard
                label="Active Referrals"
                value={metrics.activeReferrals}
                icon={<Link2 className="w-5 h-5 text-primary" />}
                subtext="Unconverted links"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminMetricCard
                label="Qualifying Revenue"
                value={`$${metrics.qualifyingRevenue.toLocaleString()}`}
                icon={<DollarSign className="w-5 h-5 text-primary" />}
                subtext="Total platform revenue"
              />
              <AdminMetricCard
                label="Rewards Paid"
                value={`$${metrics.rewardsPaid.toLocaleString()}`}
                icon={<Gift className="w-5 h-5 text-primary" />}
                subtext="Total paid to affiliates"
              />
              <AdminMetricCard
                label="Rewards Pending"
                value={`$${metrics.rewardsPending.toLocaleString()}`}
                icon={<Clock className="w-5 h-5 text-primary" />}
                subtext="Awaiting approval"
              />
              <AdminMetricCard
                label="Rewards Approved"
                value={`$${metrics.rewardsApproved.toLocaleString()}`}
                icon={<Gift className="w-5 h-5 text-primary" />}
                subtext="Ready for payout"
              />
            </div>

            {/* Tier Breakdown */}
            <TierBreakdown />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-8">
            <UsersTable />
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="mt-8">
            <CommissionManagement />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-8">
            <ActivityFeed />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-8">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0f1a] py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/utopia-logo.avif" alt="U-topia" className="h-8" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                U-topia puts YOU first – connecting modern banking, digital
                assets, and cross-chain opportunities in one universal wallet.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-5">Follow U-topia</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://t.me/+G6ntSwYCzjJkNzE0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    Telegram
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/UCoinOfficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    X (Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/company/u-topia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-5">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://docsend.com/view/3wjptrvw2c35gj8p"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://docsend.com/view/vkuhrcmbrhkqd7vp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} U-topia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
