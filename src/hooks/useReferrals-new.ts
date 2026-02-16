import { useState, useEffect, useCallback } from 'react';
import { subscribeToTable } from '@/lib/socket-client';

export interface ReferralData {
  id: string;
  referredUserId: string;
  referredName: string | null;
  referredEmail: string;
  signupDate: string;
  status: 'pending' | 'active' | 'invalid';
  packagePurchased: string | null;
  commissionEarned: number;
  commissionStatus: string | null;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalCommissions: number;
}

export function useReferrals() {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    pendingReferrals: 0,
    totalCommissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch('/api/referrals', {
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }

      const data = await response.json();

      setReferrals(data.referrals || []);
      setStats(data.stats || {
        totalReferrals: 0,
        activeReferrals: 0,
        pendingReferrals: 0,
        totalCommissions: 0,
      });
    } catch (err) {
      console.error('Error in fetchReferrals:', err);
      setError('Failed to fetch referrals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();

    // Subscribe to real-time updates
    subscribeToTable('referrals', () => {
      fetchReferrals();
    });

    subscribeToTable('commission_ledger', () => {
      fetchReferrals();
    });

    subscribeToTable('purchases', () => {
      fetchReferrals();
    });
  }, [fetchReferrals]);

  return {
    referrals,
    stats,
    isLoading,
    error,
    refetch: fetchReferrals,
  };
}

// Map referral status to display status
export function getDisplayStatus(referral: ReferralData): string {
  if (referral.status === 'active' && referral.packagePurchased) {
    return 'Commissionable';
  }
  if (referral.status === 'active' && !referral.packagePurchased) {
    return 'Signed Up';
  }
  if (referral.status === 'pending') {
    return 'Pending Activation';
  }
  if (referral.status === 'invalid') {
    return 'Reversed';
  }
  return 'Inactive';
}
