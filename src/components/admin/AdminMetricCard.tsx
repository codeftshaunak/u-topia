import { ReactNode } from 'react';

interface AdminMetricCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function AdminMetricCard({ label, value, icon, subtext, trend }: AdminMetricCardProps) {
  return (
    <div className="feature-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.isPositive 
              ? 'bg-green-500/10 text-green-500' 
              : 'bg-red-500/10 text-red-500'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {subtext && <p className="text-xs text-muted-foreground/70 mt-2">{subtext}</p>}
    </div>
  );
}
