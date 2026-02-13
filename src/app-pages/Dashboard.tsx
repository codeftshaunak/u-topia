export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ReferralToolsCard } from "@/components/ReferralToolsCard";
import { ReferralChart } from "@/components/dashboard/ReferralChart";
import { ReferralTable } from "@/components/dashboard/ReferralTable";
import { RewardsBreakdown } from "@/components/dashboard/RewardsBreakdown";
import {
  useCommissions,
  formatUSD,
  getTierLabel,
} from "@/hooks/useCommissions";
import {
  calculateRankInfo,
  RankOverview,
} from "@/components/dashboard/RankOverview";
import { usePackages, PackageKey } from "@/hooks/usePackages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import NetworkVisualization from "@/components/community/NetworkVisualization";
const badgeBronze = "/badge-bronze.png";
const badgeSilver = "/badge-silver.png";
const badgeGold = "/badge-gold.png";
const badgePlatinum = "/badge-platinum.png";
const badgeDiamond = "/badge-diamond.png";
import {
  Users,
  DollarSign,
  Award,
  TrendingUp,
  BookOpen,
  History,
  Loader2,
  ArrowUpCircle,
  ArrowUpRight,
  Copy,
  Wallet,
} from "lucide-react";

const tierBadges: Record<string, string> = {
  bronze: badgeBronze,
  silver: badgeSilver,
  gold: badgeGold,
  platinum: badgePlatinum,
  diamond: badgeDiamond,
};

const tierOrder: PackageKey[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
];

const cardEarnings = "/card-portfolio.jpg";
const cardPending = "/card-shares.jpg";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const { user } = useAuth();
  const { summary, affiliateStatus, activeReferrals } = useCommissions();
  const { packages, formatPrice } = usePackages();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      setIsLoading(false);
    }
  }, [user, navigate]);

  // Only block on auth check, not data loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use actual values or sensible defaults while data loads in background
  const currentTier = (affiliateStatus?.tier || "bronze") as PackageKey;
  const displayActiveReferrals = activeReferrals;
  const rankInfo = calculateRankInfo(displayActiveReferrals);

  // Get available upgrades (tiers higher than current)
  const currentTierIndex = tierOrder.indexOf(currentTier);
  const availableUpgrades = tierOrder.slice(currentTierIndex + 1);
  const hasUpgradesAvailable = availableUpgrades.length > 0;

  return (
    <>
      {/* My Network Header */}
      {/* <section className="container mx-auto px-6 pt-6">
        <div>
          <h1 className="text-3xl font-bold">My Network</h1>
          <p className="text-muted-foreground">
            Connect and collaborate with fellow shareholders
          </p>
        </div>
      </section> */}

      {/* Network Visualization */}
      {/* <section className="container mx-auto px-6 pb-6">
        <NetworkVisualization />
      </section> */}

      {/* Page Header */}
      <section className="container mx-auto px-6 py-8 md:py-10">
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Dashboard
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-4">
            Track your referrals, rewards, and progress
          </p>
          {/* Current Rank Display */}
          <p className="text-base text-muted-foreground">
            Current Rank:{" "}
            <span className="font-semibold bg-gradient-to-r from-[#f97316] to-[#fb923c] bg-clip-text text-transparent">
              {rankInfo.currentRank}
            </span>
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Earnings Card */}
          <div className="relative overflow-hidden rounded-xl h-40 group">
            <img
              src={cardEarnings}
              alt="Earnings background"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
            <div className="relative h-full p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/90">
                  Total Earnings
                </span>
                <DollarSign className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">$12,450</div>
                <p className="text-sm text-white/80 flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400 mr-1" />
                  <span className="text-emerald-400 font-medium">+8.2%</span>
                  <span className="ml-1">this month</span>
                </p>
              </div>
            </div>
          </div>

          {/* Available to Withdraw Card */}
          <div className="relative overflow-hidden rounded-xl h-40 group">
            <img
              src={cardPending}
              alt="Withdraw background"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
            <div className="relative h-full p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/90">
                  Available to Withdraw
                </span>
                <Wallet className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">$1,250</div>
                <Button
                  size="sm"
                  className="mt-2 bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => {
                    toast({
                      title: "Withdrawal Requested",
                      description:
                        "Your withdrawal request is being processed.",
                    });
                  }}
                >
                  Withdraw Funds
                </Button>
              </div>
            </div>
          </div>

          {/* Referral Code Card */}
          <Card className="overflow-hidden h-40">
            <div className="h-full p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your Referral Code</span>
                <Copy className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg px-3 py-2 font-mono text-lg font-bold tracking-widest text-center mb-2">
                  UTOPIA-2847X
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText("UTOPIA-2847X");
                    toast({
                      title: "Copied!",
                      description: "Referral code copied to clipboard.",
                    });
                  }}
                >
                  Copy Code
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Metrics Summary */}
      <section className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="feature-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Referrals
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {activeReferrals}
                </p>
              </div>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Verified referrals</p>
          </div>
          <div className="feature-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Commissions
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatUSD(summary?.pending || 0)}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </div>
          <div className="feature-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatUSD(summary?.total_earned || 0)}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              Approved + paid commissions
            </p>
          </div>
          <div className="feature-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <img
                src={tierBadges[currentTier] || badgeBronze}
                alt={`${currentTier} Badge`}
                className="w-10 h-10 object-contain"
              />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              {getTierLabel(currentTier)}
            </p>
            <p className="text-sm text-muted-foreground mb-3">Current Tier</p>
            {hasUpgradesAvailable && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsUpgradeDialogOpen(true)}
                className="w-full gap-2 text-primary border-primary/30 hover:bg-primary/10 hover:border-primary/50"
              >
                <ArrowUpCircle className="w-4 h-4" />
                Upgrade Tier
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Referral Tools */}
      <section className="container mx-auto px-6 pb-12">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Your Referral Tools
          </h2>
          <p className="text-sm text-muted-foreground">
            Share your link to invite new users and businesses.
          </p>
        </div>
        <ReferralToolsCard />
      </section>

      {/* Referral Chart */}
      <section className="container mx-auto px-6 pb-12">
        <ReferralChart />
      </section>

      {/* Referral Table */}
      <section className="container mx-auto px-6 pb-12">
        <ReferralTable />
      </section>

      {/* Rewards Breakdown */}
      <section className="container mx-auto px-6 pb-12">
        <RewardsBreakdown />
      </section>

      {/* Rank Overview */}
      <section className="container mx-auto px-6 pb-12">
        <RankOverview qualifyingReferrals={displayActiveReferrals} />
      </section>

      {/* Action Buttons */}
      <section className="container mx-auto px-6 pb-20">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/refer-and-earn" className="flex-1">
            <Button
              variant="outline"
              className="w-full gap-3 py-6 text-base rounded-xl border-border hover:border-primary/50 hover:bg-primary/5"
            >
              <BookOpen className="w-5 h-5" />
              View Referral Rules
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex-1 gap-3 py-6 text-base rounded-xl border-border hover:border-primary/50 hover:bg-primary/5"
            disabled
          >
            <History className="w-5 h-5" />
            Go to Rewards History
            <span className="text-xs text-muted-foreground">(Coming Soon)</span>
          </Button>
        </div>
      </section>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Upgrade Your Tier
            </DialogTitle>
            <DialogDescription>
              Unlock deeper commission layers and increased earning potential.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {availableUpgrades.map((tierKey) => {
              const pkg = packages.find(
                (p) => p.name.toLowerCase() === tierKey,
              );
              if (!pkg) return null;

              const tierIndex = tierOrder.indexOf(tierKey);
              const depthLimit = tierIndex + 1;

              return (
                <button
                  key={tierKey}
                  onClick={() => {
                    setIsUpgradeDialogOpen(false);
                    navigate(`/purchase?tier=${tierKey}`);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <img
                    src={tierBadges[tierKey]}
                    alt={pkg.name}
                    className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground">{pkg.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Up to {depthLimit} commission layer
                      {depthLimit > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(pkg.priceUsd)}
                    </p>
                    <p className="text-xs text-muted-foreground">One-time</p>
                  </div>
                </button>
              );
            })}
          </div>

          {currentTier === "diamond" && (
            <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <p className="text-sm text-primary font-medium">
                🎉 You're already at the highest tier!
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
