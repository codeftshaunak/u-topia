import { Package, Loader2 } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';

const tierColors: Record<string, string> = {
  Bronze: 'bg-amber-700',
  Silver: 'bg-gray-400',
  Gold: 'bg-yellow-500',
  Platinum: 'bg-blue-400',
  Diamond: 'bg-purple-400',
};

export function TierBreakdown() {
  const { tierStats, isLoading } = useAdminStats();

  const totalCount = tierStats.reduce((sum, t) => sum + t.count, 0);
  const totalRevenue = tierStats.reduce((sum, t) => sum + t.revenue, 0);

  if (isLoading) {
    return (
      <div className="feature-card p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="feature-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Packages by Tier</h3>
          <p className="text-sm text-muted-foreground">{totalCount} total packages sold</p>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No packages sold yet
        </div>
      ) : (
        <div className="space-y-4">
          {tierStats.map((tier) => {
            const percentage = totalCount > 0 ? (tier.count / totalCount) * 100 : 0;
            const color = tierColors[tier.tier] || 'bg-gray-400';
            
            return (
              <div key={tier.tier}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm font-medium text-foreground">{tier.tier}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{tier.count} sold</span>
                    <span className="text-sm text-primary font-medium">${tier.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Total Revenue</span>
          <span className="text-lg font-bold text-primary">
            ${totalRevenue.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
