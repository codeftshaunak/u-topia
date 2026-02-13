export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
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
const logoLight = "/u-topia-logo-light.png";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const { user } = useAuth();
  const { summary, affiliateStatus, activeReferrals } = useCommissions();
  const { packages, formatPrice } = usePackages();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      setIsAuthenticated(true);
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
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <section className="container mx-auto px-6 py-12 md:py-16">
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

      {/* Footer */}
      <footer className="bg-[#0a0f1a] py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoLight} alt="U-topia" className="h-8" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                U-topia puts YOU first – connecting modern banking, digital
                assets, and cross-chain opportunities in one universal wallet.
              </p>
            </div>

            {/* Follow U-topia */}
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
                <li>
                  <a
                    href="https://www.instagram.com/ucoinofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/qZB83k5HmX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
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

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} U-topia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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
    </div>
  );
};

export default Dashboard;
