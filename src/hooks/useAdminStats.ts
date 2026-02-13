import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  totalReferrals: number;
  activeReferrals: number;
  qualifyingRevenue: number;
  rewardsPaid: number;
  rewardsPending: number;
  rewardsApproved: number;
}

export interface TierStats {
  tier: string;
  count: number;
  revenue: number;
}

export interface CommissionRecord {
  id: string;
  beneficiaryEmail: string;
  beneficiaryName: string | null;
  referredEmail: string;
  amount: number;
  layer: number;
  status: string;
  createdAt: string;
  source: string;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    qualifyingRevenue: 0,
    rewardsPaid: 0,
    rewardsPending: 0,
    rewardsApproved: 0,
  });
  const [tierStats, setTierStats] = useState<TierStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);

      // Fetch all data in parallel
      const [
        profilesResult,
        referralsResult,
        purchasesResult,
        commissionsResult,
        affiliateResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id, is_verified', { count: 'exact' }),
        supabase.from('referrals').select('id, status', { count: 'exact' }),
        supabase.from('purchases').select('tier, amount').eq('status', 'completed'),
        supabase.from('commission_ledger').select('amount_usd, status'),
        supabase.from('affiliate_status').select('tier'),
      ]);

      // Calculate user stats
      const totalUsers = profilesResult.count || 0;
      const verifiedUsers = profilesResult.data?.filter(p => p.is_verified).length || 0;

      // Calculate referral stats
      const totalReferrals = referralsResult.count || 0;
      const activeReferrals = referralsResult.data?.filter(r => r.status === 'active').length || 0;

      // Calculate revenue
      const qualifyingRevenue = (purchasesResult.data || []).reduce(
        (sum, p) => sum + (p.amount / 100), // Convert cents to dollars
        0
      );

      // Calculate commission stats
      const commissions = commissionsResult.data || [];
      const rewardsPaid = commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + Number(c.amount_usd), 0);
      const rewardsPending = commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + Number(c.amount_usd), 0);
      const rewardsApproved = commissions
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + Number(c.amount_usd), 0);

      setStats({
        totalUsers,
        verifiedUsers,
        totalReferrals,
        activeReferrals,
        qualifyingRevenue,
        rewardsPaid,
        rewardsPending,
        rewardsApproved,
      });

      // Calculate tier breakdown from purchases
      const tierCounts: Record<string, { count: number; revenue: number }> = {
        bronze: { count: 0, revenue: 0 },
        silver: { count: 0, revenue: 0 },
        gold: { count: 0, revenue: 0 },
        platinum: { count: 0, revenue: 0 },
        diamond: { count: 0, revenue: 0 },
      };

      (purchasesResult.data || []).forEach(p => {
        const tier = p.tier.toLowerCase();
        if (tierCounts[tier]) {
          tierCounts[tier].count += 1;
          tierCounts[tier].revenue += p.amount / 100; // Convert cents to dollars
        }
      });

      setTierStats(
        Object.entries(tierCounts).map(([tier, data]) => ({
          tier: tier.charAt(0).toUpperCase() + tier.slice(1),
          count: data.count,
          revenue: data.revenue,
        }))
      );

    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to fetch statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-stats-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'referrals' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchases' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commission_ledger' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return {
    stats,
    tierStats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

export function useAdminCommissions() {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommissions = useCallback(async () => {
    try {
      setError(null);

      // Fetch all commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commission_ledger')
        .select(`
          id,
          beneficiary_user_id,
          referred_user_id,
          amount_usd,
          layer,
          status,
          created_at,
          source_revenue_event_id
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (commissionsError) {
        throw commissionsError;
      }

      if (!commissionsData || commissionsData.length === 0) {
        setCommissions([]);
        setIsLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [
        ...new Set([
          ...commissionsData.map(c => c.beneficiary_user_id),
          ...commissionsData.map(c => c.referred_user_id),
        ]),
      ];

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      // Fetch revenue events for source info
      const eventIds = [...new Set(commissionsData.map(c => c.source_revenue_event_id))];
      const { data: eventsData } = await supabase
        .from('revenue_events')
        .select('id, source')
        .in('id', eventIds);

      const eventsMap = new Map(eventsData?.map(e => [e.id, e.source]) || []);

      // Build commission records
      const mappedCommissions: CommissionRecord[] = commissionsData.map(c => {
        const beneficiary = profilesMap.get(c.beneficiary_user_id);
        const referred = profilesMap.get(c.referred_user_id);

        return {
          id: c.id,
          beneficiaryEmail: beneficiary?.email || 'Unknown',
          beneficiaryName: beneficiary?.full_name || null,
          referredEmail: referred?.email || 'Unknown',
          amount: Number(c.amount_usd),
          layer: c.layer,
          status: c.status,
          createdAt: c.created_at,
          source: eventsMap.get(c.source_revenue_event_id) || 'Unknown',
        };
      });

      setCommissions(mappedCommissions);
    } catch (err) {
      console.error('Error fetching commissions:', err);
      setError('Failed to fetch commissions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCommissionStatus = useCallback(async (
    commissionIds: string[],
    newStatus: 'pending' | 'approved' | 'paid' | 'held' | 'reversed'
  ) => {
    try {
      const { error } = await supabase
        .from('commission_ledger')
        .update({ status: newStatus })
        .in('id', commissionIds);

      if (error) throw error;

      // Refetch commissions
      await fetchCommissions();
      return { success: true };
    } catch (err) {
      console.error('Error updating commission status:', err);
      return { success: false, error: 'Failed to update commission status' };
    }
  }, [fetchCommissions]);

  useEffect(() => {
    fetchCommissions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-commissions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commission_ledger' },
        () => fetchCommissions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCommissions]);

  return {
    commissions,
    isLoading,
    error,
    refetch: fetchCommissions,
    updateCommissionStatus,
  };
}
