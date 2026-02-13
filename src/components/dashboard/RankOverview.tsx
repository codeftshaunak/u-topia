import { Progress } from '@/components/ui/progress';
import { Trophy, ChevronRight, Sparkles } from 'lucide-react';

// Rank definitions with thresholds and incremental bonus percentages
const RANKS = [
  { name: 'Representative', threshold: 0, bonusPercent: 0.0 },
  { name: 'Associate', threshold: 25, bonusPercent: 2.5 },
  { name: 'Consultant', threshold: 50, bonusPercent: 1.0 },
  { name: 'Team Leader', threshold: 100, bonusPercent: 1.0 },
  { name: 'Senior Manager', threshold: 250, bonusPercent: 2.5 },
  { name: 'Director', threshold: 1000, bonusPercent: 1.0 },
  { name: 'Senior Director', threshold: 5000, bonusPercent: 1.0 },
  { name: 'Executive', threshold: 10000, bonusPercent: 2.5 },
  { name: 'Executive Director', threshold: 100000, bonusPercent: 1.0 },
  { name: 'Partner', threshold: 1000000, bonusPercent: 1.0 },
] as const;

export type RankName = typeof RANKS[number]['name'];

interface RankInfo {
  currentRank: RankName;
  currentRankIndex: number;
  nextRank: RankName | null;
  nextRankThreshold: number | null;
  effectiveBonusPercent: number;
  referralsToNextRank: number | null;
  progressPercent: number;
}

export function calculateRankInfo(qualifyingReferrals: number): RankInfo {
  // Find current rank (highest threshold met)
  let currentRankIndex = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (qualifyingReferrals >= RANKS[i].threshold) {
      currentRankIndex = i;
      break;
    }
  }

  const currentRank = RANKS[currentRankIndex];
  const nextRank = currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;

  // Calculate cumulative bonus (sum of all bonuses up to current rank)
  let effectiveBonusPercent = 0;
  for (let i = 0; i <= currentRankIndex; i++) {
    effectiveBonusPercent += RANKS[i].bonusPercent;
  }

  // Calculate progress to next rank
  let progressPercent = 100;
  let referralsToNextRank: number | null = null;
  
  if (nextRank) {
    const currentThreshold = currentRank.threshold;
    const nextThreshold = nextRank.threshold;
    const rangeSize = nextThreshold - currentThreshold;
    const progressInRange = qualifyingReferrals - currentThreshold;
    progressPercent = Math.min((progressInRange / rangeSize) * 100, 100);
    referralsToNextRank = nextThreshold - qualifyingReferrals;
  }

  return {
    currentRank: currentRank.name,
    currentRankIndex,
    nextRank: nextRank?.name || null,
    nextRankThreshold: nextRank?.threshold || null,
    effectiveBonusPercent,
    referralsToNextRank,
    progressPercent,
  };
}

interface RankOverviewProps {
  qualifyingReferrals: number;
}

export function RankOverview({ qualifyingReferrals }: RankOverviewProps) {
  const rankInfo = calculateRankInfo(qualifyingReferrals);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="feature-card p-6 md:p-8 border-primary/20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Rank Overview</h3>
          <p className="text-sm text-muted-foreground">Your referral-based rank and bonus</p>
        </div>
      </div>

      {/* Current Rank - Prominent Display */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
        <p className="text-2xl md:text-3xl font-bold text-foreground">{rankInfo.currentRank}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Qualifying Referrals */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Qualifying Referrals</p>
          <p className="text-xl font-semibold text-foreground">{formatNumber(qualifyingReferrals)}</p>
          <p className="text-xs text-muted-foreground mt-1">Verified & active</p>
        </div>

        {/* Effective Rank Bonus */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Effective Rank Bonus</p>
              <p className="text-xl font-semibold text-primary">+{rankInfo.effectiveBonusPercent.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Cumulative bonus</p>
            </div>
            <Sparkles className="w-4 h-4 text-primary/60" />
          </div>
        </div>
      </div>

      {/* Next Rank Progress */}
      {rankInfo.nextRank ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{rankInfo.currentRank}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-primary">{rankInfo.nextRank}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatNumber(rankInfo.nextRankThreshold!)} referrals
            </span>
          </div>
          
          <Progress value={rankInfo.progressPercent} className="h-2" />
          
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-medium text-primary">{formatNumber(rankInfo.referralsToNextRank!)}</span> more qualifying referrals to reach {rankInfo.nextRank}
          </p>
        </div>
      ) : (
        <div className="text-center p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
            🎉 Congratulations! You've reached the highest rank: Partner
          </p>
        </div>
      )}
    </div>
  );
}
