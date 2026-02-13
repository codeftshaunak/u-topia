import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, ShoppingCart, Link2, CheckCircle, Gift, CreditCard, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useAdminActivity } from '@/hooks/useAdminActivity';

interface Activity {
  id: string;
  timestamp: Date;
  userEmail: string;
  eventType: string;
  status: 'success' | 'pending' | 'failed';
  amount?: number;
}

const eventTypeConfig: Record<string, { label: string; icon: typeof UserPlus; color: string }> = {
  signup: { label: 'New Signup', icon: UserPlus, color: 'text-blue-500' },
  purchase: { label: 'Package Purchase', icon: ShoppingCart, color: 'text-green-500' },
  referral_created: { label: 'Referral Created', icon: Link2, color: 'text-primary' },
  referral_conversion: { label: 'Referral Converted', icon: CheckCircle, color: 'text-teal-500' },
  reward_issued: { label: 'Reward Issued', icon: Gift, color: 'text-yellow-500' },
  payout: { label: 'Payout Processed', icon: CreditCard, color: 'text-purple-500' },
  failed: { label: 'Failed Attempt', icon: AlertTriangle, color: 'text-red-500' },
};

const statusColors = {
  success: 'bg-green-500/10 text-green-500',
  pending: 'bg-yellow-500/10 text-yellow-500',
  failed: 'bg-red-500/10 text-red-500',
};

export function ActivityFeed() {
  const { activities, isLoading, error } = useAdminActivity(200);

  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredActivities = useMemo(() => {
    const normalized: Activity[] = activities as any;

    return normalized.filter((activity) => {
      const matchesSearch = activity.userEmail.toLowerCase().includes(search.toLowerCase());
      const matchesEvent = eventFilter === 'all' || activity.eventType === eventFilter;
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [activities, eventFilter, search, statusFilter]);

  return (
    <div className="feature-card p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Platform Activity</h3>
          <p className="text-sm text-muted-foreground">Live activity feed across all users</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-48"
            />
          </div>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="signup">Signups</SelectItem>
              <SelectItem value="purchase">Purchases</SelectItem>
              <SelectItem value="referral_created">Referrals</SelectItem>
              <SelectItem value="referral_conversion">Conversions</SelectItem>
              <SelectItem value="reward_issued">Rewards</SelectItem>
              <SelectItem value="payout">Payouts</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading activity…</div>
      ) : error ? (
        <div className="text-center py-10 text-muted-foreground">Failed to load activity.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Event</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => {
                  const config = eventTypeConfig[activity.eventType] || eventTypeConfig.signup;
                  const Icon = config.icon;
                  return (
                    <tr key={activity.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {format(activity.timestamp, 'MMM d, HH:mm')}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground font-medium">{activity.userEmail}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className="text-sm text-foreground">{config.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`${statusColors[activity.status]} border-0`}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {activity.amount != null ? (
                          <span className="text-primary font-medium">${activity.amount}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activities found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
