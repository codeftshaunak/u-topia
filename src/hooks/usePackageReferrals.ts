import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ReferredUser {
  id: string;
  buyerUserId: string;
  buyerName: string | null;
  buyerEmail: string;
  buyerAvatar: string | null;
  tier: string;
  purchaseAmountUsd: number;
  rewardPercent: number;
  rewardAmountUsd: number;
  rewardStatus: string;
  purchaseDate: string;
}

interface PackageReferralStats {
  totalReferredPurchases: number;
  totalRewardsEarned: number;
  pendingRewards: number;
  approvedRewards: number;
  paidRewards: number;
  tierBreakdown: { tier: string; count: number }[];
}

export function usePackageReferrals() {
  const { user } = useAuth();
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [stats, setStats] = useState<PackageReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch("/api/referrals/package-rewards", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch package referrals");
      }

      const data = await response.json();
      setReferredUsers(data.referredUsers || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Error fetching package referrals:", err);
      setError(err instanceof Error ? err.message : "Failed to load referrals");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  return {
    referredUsers,
    stats,
    isLoading,
    error,
    refetch: fetchReferrals,
  };
}
