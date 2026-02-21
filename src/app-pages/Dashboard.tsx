export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
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
// Dialog imports kept for package upgrade UI (commented out, moved to purchase page)
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import NetworkVisualization from "@/components/community/NetworkVisualization";
import { StatCard } from "@/components/dashboard/StatCard";
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
  // ArrowUpCircle, // package upgrade UI — commented out
  ArrowUpRight,
  Copy,
  Wallet,
} from "lucide-react";
import { useReferralLink } from "@/hooks/useReferralLink";
import { ReferralToolsCard } from "@/components/ReferralToolsCard";

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
  // isUpgradeDialogOpen kept for package upgrade dialog (commented out)
  // const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const { user } = useAuth();
  const { summary, affiliateStatus, activeReferrals, isLoading: dataLoading } = useCommissions();
  const { packages, formatPrice } = usePackages();
  const { toast } = useToast();
  const { referralLink } = useReferralLink();

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

  // Package upgrade vars — kept for future use (upgrade dialog commented out)
  // const currentTierIndex = tierOrder.indexOf(currentTier);
  // const availableUpgrades = tierOrder.slice(currentTierIndex + 1);
  // const hasUpgradesAvailable = availableUpgrades.length > 0;

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
          <StatCard
            title="Total Earnings"
            value={formatUSD(summary?.total_earned || 0)}
            icon={DollarSign}
            backgroundImage={cardEarnings}
            isLoading={dataLoading}
          >
            <p className="text-sm text-white/80 flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-emerald-400 mr-1" />
              <span className="text-white/80">All-time earnings</span>
            </p>
          </StatCard>

          {/* Available to Withdraw Card */}
          <StatCard
            title="Available to Withdraw"
            value={formatUSD(summary?.approved || 0)}
            icon={Wallet}
            backgroundImage={cardPending}
            isLoading={dataLoading}
          >
            <Button
              size="sm"
              className="mt-2 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
              disabled={(summary?.approved || 0) === 0}
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
          </StatCard>

          {/* Referral Code Card */}
          <Card className="overflow-hidden h-40">
            <div className="h-full p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your Referral Code</span>
                <Copy className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg px-3 py-2 font-mono text-lg font-bold tracking-widest text-center mb-2">
                  {referralLink || "━━━━━━"}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!referralLink}
                  onClick={() => {
                    if (referralLink) {
                      navigator.clipboard.writeText(referralLink);
                      toast({
                        title: "Copied!",
                        description: "Referral code copied to clipboard.",
                      });
                    }
                  }}
                >
                  {referralLink ? "Copy Code" : "No Code Yet"}
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
                {dataLoading ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <p className="text-2xl font-bold text-muted-foreground">...</p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {activeReferrals ?? 0}
                  </p>
                )}
              </div>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              {activeReferrals > 0
                ? "Users who purchased packages"
                : "Invite users to earn commissions"}
            </p>
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
            {/* Upgrade Tier button moved to purchase page */}
          </div>
        </div>
      </section>

      {/* Referred Users */}
      <section className="container mx-auto px-6 pb-12">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Referred Users
          </h2>
          <p className="text-sm text-muted-foreground">
            Your referrals, commission status, and rewards breakdown.
          </p>
        </div>
        <ReferralToolsCard />
      </section>


      <section className="container mx-auto px-6 pb-12">
        <ReferralChart />
      </section>

      <section className="container mx-auto px-6 pb-12">
        <ReferralTable />
      </section>

      <section className="container mx-auto px-6 pb-12">
        <RewardsBreakdown />
      </section>

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

      {/* Package Upgrade Dialog moved to purchase page */}
    </>
  );
}
