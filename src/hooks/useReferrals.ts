/**
 * useReferrals – RTK Query backed hook.
 * Drop-in replacement for the previous useState/useEffect version.
 */
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetReferralsQuery } from "@/store/features/referrals/referralsApi";

export type { ReferralData, ReferralStats } from "@/store/features/referrals/referralsApi";
import type { ReferralData, ReferralStats } from "@/store/features/referrals/referralsApi";

const EMPTY_STATS: ReferralStats = {
  totalReferrals: 0,
  activeReferrals: 0,
  pendingReferrals: 0,
  totalCommissions: 0,
};

export function useReferrals() {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useGetReferralsQuery(undefined, {
    skip: !user,
  });

  const stats = useMemo<ReferralStats>(() => {
    if (data?.stats) return data.stats;
    const referrals = data?.referrals ?? [];
    return {
      totalReferrals: referrals.length,
      activeReferrals: referrals.filter((r) => r.status === "active").length,
      pendingReferrals: referrals.filter((r) => r.status === "pending").length,
      totalCommissions: referrals.reduce((s, r) => s + r.commissionEarned, 0),
    };
  }, [data]);

  return {
    referrals: data?.referrals ?? [],
    stats: data ? stats : EMPTY_STATS,
    isLoading: isLoading && !data,
    error: error ? "Failed to fetch referrals" : null,
    refetch: () => { refetch(); },
  };
}

// Map referral status to display status
export function getDisplayStatus(referral: ReferralData): string {
  if (referral.status === "active" && referral.packagePurchased) {
    return "Commissionable";
  }
  if (referral.status === "active" && !referral.packagePurchased) {
    return "Signed Up";
  }
  if (referral.status === "pending") {
    return "Signed Up";
  }
  if (referral.status === "invalid") {
    return "Reversed";
  }
  return "Inactive";
}
