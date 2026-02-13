import { DollarSign, Clock, CheckCircle, AlertCircle, Layers, Loader2 } from 'lucide-react';
import { useCommissions, formatUSD, CommissionSummary } from '@/hooks/useCommissions';

interface RewardCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant?: 'default' | 'pending' | 'paid' | 'held';
  subtext?: string;
}

function RewardCard({ label, value, icon, variant = 'default', subtext }: RewardCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'pending':
        return 'border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent';
      case 'paid':
        return 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent';
      case 'held':
        return 'border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent';
      default:
        return '';
    }
  };

  return (
    <div className={`feature-card p-5 ${getVariantStyles()}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
    </div>
  );
}

interface LayerBreakdownProps {
  byLayer: Record<number, number>;
}

function LayerBreakdown({ byLayer }: LayerBreakdownProps) {
  const layers = [1, 2, 3, 4, 5];
  const rates = [12, 8, 4, 2, 1];
  
  return (
    <div className="feature-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
          <Layers className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground">Commission by Layer</span>
      </div>
      <div className="space-y-2">
        {layers.map((layer) => {
          const amount = byLayer[layer] || 0;
          return (
            <div key={layer} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Layer {layer} <span className="text-xs">({rates[layer - 1]}%)</span>
              </span>
              <span className="font-medium text-foreground">{formatUSD(amount)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface RewardsBreakdownProps {
  summary?: CommissionSummary | null;
  isLoading?: boolean;
}

export function RewardsBreakdown({ summary: propSummary, isLoading: propLoading }: RewardsBreakdownProps) {
  // Use hook if no props provided
  const hookData = useCommissions();
  const summary = propSummary !== undefined ? propSummary : hookData.summary;
  const isLoading = propLoading !== undefined ? propLoading : hookData.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Rewards Breakdown</h3>
          <p className="text-sm text-muted-foreground">View your earnings by category</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const displaySummary = summary || {
    total_earned: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    held: 0,
    reversed: 0,
    by_layer: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Rewards Breakdown</h3>
        <p className="text-sm text-muted-foreground">View your earnings by category</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RewardCard
          label="Total Earned"
          value={formatUSD(displaySummary.total_earned)}
          icon={<DollarSign className="w-4 h-4 text-primary" />}
          subtext="Approved + Paid commissions"
        />
        <RewardCard
          label="Pending Approval"
          value={formatUSD(displaySummary.pending)}
          icon={<Clock className="w-4 h-4 text-amber-500" />}
          variant="pending"
          subtext="Awaiting admin review"
        />
        <RewardCard
          label="Paid Out"
          value={formatUSD(displaySummary.paid)}
          icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
          variant="paid"
          subtext="Successfully transferred"
        />
        <RewardCard
          label="Approved (Unpaid)"
          value={formatUSD(displaySummary.approved)}
          icon={<CheckCircle className="w-4 h-4 text-primary" />}
          subtext="Ready for payout"
        />
        {displaySummary.held > 0 && (
          <RewardCard
            label="On Hold"
            value={formatUSD(displaySummary.held)}
            icon={<AlertCircle className="w-4 h-4 text-red-500" />}
            variant="held"
            subtext="Pending compliance review"
          />
        )}
        <LayerBreakdown byLayer={displaySummary.by_layer} />
      </div>
    </div>
  );
}
