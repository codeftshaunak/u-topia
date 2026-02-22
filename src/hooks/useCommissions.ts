/**
 * useCommissions – RTK Query backed hook.
 * Derives the commission summary from the raw ledger returned by /api/commissions
 * and composes extra context from /api/referrals and /api/profile via RTK Query.
 */
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCommissionsQuery } from "@/store/features/commissions/commissionsApi";
import { useGetReferralsQuery } from "@/store/features/referrals/referralsApi";
import { useGetProfileQuery } from "@/store/features/profile/profileApi";

export interface CommissionSummary {
  total_earned: number;
  pending: number;
  approved: number;
  paid: number;
  held: number;
  reversed: number;
  by_layer: Record<number, number>;
}

export interface AffiliateStatus {
  user_id: string;
  tier: string;
  tier_depth_limit: number;
  is_active: boolean;
  updated_at: string;
}

export interface CommissionEntry {
  id: string;
  beneficiaryUserId: string;
  sourceRevenueEventId: string;
  layer: number;
  referredUserId: string;
  amountUsd: number;
  ratePercent: number;
  status: string;
  createdAt: string;
  notes: string | null;
}

interface UseCommissionsResult {
  summary: CommissionSummary | null;
  affiliateStatus: AffiliateStatus | null;
  activeReferrals: number;
  recentCommissions: CommissionEntry[];
  totalPoints: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function buildSummary(commissions: CommissionEntry[]): CommissionSummary {
  const summary: CommissionSummary = {
    total_earned: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    held: 0,
    reversed: 0,
    by_layer: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  for (const comm of commissions) {
    const amount = Number(comm.amountUsd);
    if (comm.status === "pending") {
      summary.pending += amount;
    } else if (comm.status === "approved") {
      summary.approved += amount;
      summary.total_earned += amount;
    } else if (comm.status === "paid") {
      summary.paid += amount;
      summary.total_earned += amount;
    } else if (comm.status === "held") {
      summary.held += amount;
    } else if (comm.status === "reversed") {
      summary.reversed += amount;
    }

    if (comm.status !== "reversed") {
      summary.by_layer[comm.layer] =
        (summary.by_layer[comm.layer] || 0) + amount;
    }
  }

  return summary;
}

export function useCommissions(): UseCommissionsResult {
  const { user } = useAuth();

  const {
    data: commissionsData,
    isLoading: commissionsLoading,
    error: commissionsError,
    refetch: refetchCommissions,
  } = useGetCommissionsQuery(undefined, { skip: !user });

  const {
    data: referralsData,
    isLoading: referralsLoading,
    refetch: refetchReferrals
  } = useGetReferralsQuery(undefined, { skip: !user });

  const { data: profileData, refetch: refetchProfile } =
    useGetProfileQuery(undefined, { skip: !user });

  const summary = useMemo<CommissionSummary | null>(() => {
    if (!commissionsData) return null;
    return buildSummary(commissionsData.commissions ?? []);
  }, [commissionsData]);

  const affiliateStatus = useMemo<AffiliateStatus | null>(() => {
    const as = profileData?.affiliateStatus;
    if (!as) return null;
    return {
      user_id: as.userId,
      tier: as.tier,
      tier_depth_limit: as.tierDepthLimit,
      is_active: as.isActive,
      updated_at: as.updatedAt,
    };
  }, [profileData]);

  const activeReferrals = referralsData?.stats?.activeReferrals ?? 0;

  const recentCommissions = useMemo(
    () => (commissionsData?.commissions ?? []).slice(0, 10),
    [commissionsData]
  );

  const totalPoints = profileData?.totalPoints ?? 0;

  const refetch = async () => {
    await Promise.all([refetchCommissions(), refetchReferrals(), refetchProfile()]);
  };

  return {
    summary,
    affiliateStatus,
    activeReferrals,
    recentCommissions,
    totalPoints,
    isLoading: (commissionsLoading && !commissionsData) || (referralsLoading && !referralsData),
    error: commissionsError ? "Failed to fetch commission data" : null,
    refetch,
  };
}

// Utility function to format currency
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Tier display helpers
export const tierColors: Record<string, string> = {
  bronze: "text-amber-700 bg-amber-100",
  silver: "text-gray-600 bg-gray-100",
  gold: "text-yellow-700 bg-yellow-100",
  platinum: "text-cyan-700 bg-cyan-100",
  diamond: "text-purple-700 bg-purple-100",
};

export function getTierLabel(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
