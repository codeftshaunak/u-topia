export const dynamic = "force-dynamic";


import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import logoLight from "@/assets/u-topia-logo-light.png";
import {
  ArrowLeft,
  Loader2,
  Shield,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Award,
  Link2,
  DollarSign,
  Gift,
  Clock,
  CreditCard,
  Flag,
  Ban,
} from "lucide-react";
import { format } from "date-fns";

import { useAdminUserDetail } from "@/hooks/useAdminUserDetail";

const tierColors: Record<string, string> = {
  Bronze: "bg-amber-700/10 text-amber-700",
  Silver: "bg-gray-400/10 text-gray-400",
  Gold: "bg-yellow-500/10 text-yellow-500",
  Platinum: "bg-blue-400/10 text-blue-400",
  Diamond: "bg-purple-400/10 text-purple-400",
};

const AdminUserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();

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

  const {
    user: detailUser,
    isLoading: userLoading,
    error: userError,
  } = useAdminUserDetail(id);

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

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userError || !detailUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="container mx-auto px-6 py-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Button>
          <div className="mt-8 text-muted-foreground">User not found.</div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <section className="container mx-auto px-6 py-12 md:py-16">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Button>
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
            <Shield className="w-3 h-3" />
            Admin Mode
          </Badge>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {detailUser.fullName || "Unknown User"}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {detailUser.email}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 text-yellow-600 border-yellow-600/30 hover:bg-yellow-600/10"
            >
              <Ban className="w-4 h-4" />
              Suspend Rewards
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-red-600 border-red-600/30 hover:bg-red-600/10"
            >
              <Flag className="w-4 h-4" />
              Flag Account
            </Button>
          </div>
        </div>
      </section>

      {/* User Overview */}
      <section className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="feature-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Signup Date</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {format(detailUser.signupDate, "MMM d, yyyy")}
            </p>
          </div>
          <div className="feature-card p-6">
            <div className="flex items-center gap-3 mb-3">
              {detailUser.isVerified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="text-sm text-muted-foreground">
                Verification
              </span>
            </div>
            <Badge
              variant="outline"
              className={
                detailUser.isVerified
                  ? "bg-green-500/10 text-green-500 border-0"
                  : "bg-yellow-500/10 text-yellow-500 border-0"
              }
            >
              {detailUser.isVerified ? "Verified" : "Pending"}
            </Badge>
          </div>
          <div className="feature-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Package Tier
              </span>
            </div>
            <Badge
              variant="outline"
              className={`${tierColors[detailUser.tier] || tierColors.Bronze} border-0`}
            >
              {detailUser.tier}
            </Badge>
          </div>
          <div className="feature-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Last Active</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {format(detailUser.lastActive, "MMM d, HH:mm")}
            </p>
          </div>
        </div>
      </section>

      {/* Referral & Rewards Summary */}
      <section className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Stats */}
          <div className="feature-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Referral Stats
                </h3>
                <p className="text-sm text-muted-foreground">
                  User's referral network
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-foreground">
                  {detailUser.totalReferrals}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-green-500">
                  {detailUser.convertedReferrals}
                </p>
                <p className="text-xs text-muted-foreground">Converted</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-yellow-500">
                  {detailUser.activeReferrals}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
            <div className="space-y-2">
              {detailUser.referrals.slice(0, 3).map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <span className="text-sm text-foreground">{ref.email}</span>
                  <Badge
                    variant="outline"
                    className={
                      ref.status === "verified"
                        ? "bg-green-500/10 text-green-500 border-0"
                        : "bg-yellow-500/10 text-yellow-500 border-0"
                    }
                  >
                    {ref.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards Breakdown */}
          <div className="feature-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Rewards Breakdown
                </h3>
                <p className="text-sm text-muted-foreground">
                  Earnings by category
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">Commissions</span>
                </div>
                <span className="text-lg font-semibold text-primary">
                  ${detailUser.commissionEarned}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">Bonuses</span>
                </div>
                <span className="text-lg font-semibold text-primary">
                  ${detailUser.bonusesEarned}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">Dividends</span>
                </div>
                <span className="text-lg font-semibold text-primary">
                  ${detailUser.dividendsEarned}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-foreground">Pending</span>
                </div>
                <span className="text-lg font-semibold text-yellow-500">
                  ${detailUser.rewardsPending}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  Total Earned
                </span>
                <span className="text-xl font-bold text-primary">
                  ${detailUser.rewardsEarned}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase & Payout History */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Purchases */}
          <div className="feature-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Purchase History
                </h3>
                <p className="text-sm text-muted-foreground">
                  {detailUser.purchases.length} purchases
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {detailUser.purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {purchase.tier} Package
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(purchase.date, "MMM d, yyyy")}
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-primary">
                    ${purchase.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payouts */}
          <div className="feature-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Payout History
                </h3>
                <p className="text-sm text-muted-foreground">
                  {detailUser.payouts.length} payouts
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {detailUser.payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Payout
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(payout.date, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 border-0"
                    >
                      {payout.status}
                    </Badge>
                    <span className="text-lg font-semibold text-primary">
                      ${payout.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0f1a] py-16">
        <div className="container mx-auto px-6">
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

export default AdminUserDetail;
