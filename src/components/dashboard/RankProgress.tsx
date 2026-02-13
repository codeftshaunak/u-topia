import { Progress } from '@/components/ui/progress';
import { Trophy, ArrowUp } from 'lucide-react';

interface RankProgressProps {
  currentRank: string;
  nextRank: string;
  currentReferrals: number;
  requiredReferrals: number;
}

export function RankProgress({ 
  currentRank = 'Silver', 
  nextRank = 'Gold', 
  currentReferrals = 18, 
  requiredReferrals = 25 
}: Partial<RankProgressProps>) {
  const progress = Math.min((currentReferrals / requiredReferrals) * 100, 100);
  const remaining = Math.max(requiredReferrals - currentReferrals, 0);

  return (
    <div className="feature-card p-6 md:p-8 border-primary/20">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Next Rank Progress</h3>
          <p className="text-sm text-muted-foreground">Track your path to the next level</p>
        </div>
      </div>

      {/* Current and Next Rank */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary border border-border text-sm font-medium text-foreground">
            {currentRank}
          </span>
        </div>
        <ArrowUp className="w-4 h-4 text-primary" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Next:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
            {nextRank}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">{currentReferrals} referrals</span>
          <span className="text-muted-foreground">{requiredReferrals} needed</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Motivational Text */}
      <p className="text-sm text-center text-muted-foreground">
        {remaining > 0 ? (
          <>
            <span className="font-medium text-primary">{remaining} more referrals</span> needed to reach {nextRank}
          </>
        ) : (
          <span className="text-emerald-500 font-medium">You've reached the threshold! Rank upgrade pending.</span>
        )}
      </p>
    </div>
  );
}
