import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

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
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

async function fetchCommissionData() {
  // Fetch commissions from custom API
  const commissionsResponse = await fetch("/api/commissions", {
    method: "GET",
    credentials: "include",
  });

  if (!commissionsResponse.ok) {
    return null;
  }

  const { commissions } = await commissionsResponse.json();

  // Fetch referrals stats from custom API
  const referralsResponse = await fetch("/api/referrals", {
    method: "GET",
    credentials: "include",
  });

  let activeReferrals = 0;
  let affiliateStatus: AffiliateStatus | null = null;

  if (referralsResponse.ok) {
    const referralsData = await referralsResponse.json();
    activeReferrals = referralsData.stats?.activeReferrals || 0;
  }

  // Fetch profile to get affiliate status
  const profileResponse = await fetch("/api/profile", {
    method: "GET",
    credentials: "include",
  });

  if (profileResponse.ok) {
    const profileData = await profileResponse.json();
    if (profileData.affiliateStatus) {
      affiliateStatus = {
        user_id: profileData.affiliateStatus.userId,
        tier: profileData.affiliateStatus.tier,
        tier_depth_limit: profileData.affiliateStatus.tierDepthLimit,
        is_active: profileData.affiliateStatus.isActive,
        updated_at: profileData.affiliateStatus.updatedAt,
      };
    }
  }

  // Calculate summary from commissions
  const summary: CommissionSummary = {
    total_earned: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    held: 0,
    reversed: 0,
    by_layer: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  for (const comm of commissions || []) {
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

  return {
    summary,
    affiliateStatus,
    activeReferrals,
    recentCommissions: (commissions || []).slice(0, 10) as CommissionEntry[],
  };
}

export function useCommissions(): UseCommissionsResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["commissions"],
    queryFn: fetchCommissionData,
    staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    summary: data?.summary || null,
    affiliateStatus: data?.affiliateStatus || null,
    activeReferrals: data?.activeReferrals || 0,
    recentCommissions: data?.recentCommissions || [],
    isLoading,
    error: error ? "Failed to fetch commission data" : null,
    refetch: async () => {
      await refetch();
    },
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
