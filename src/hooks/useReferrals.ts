import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface ReferralData {
  id: string;
  referredUserId: string;
  referredName: string | null;
  referredEmail: string;
  signupDate: string;
  status: "pending" | "active" | "invalid";
  packagePurchased: string | null;
  commissionEarned: number;
  commissionStatus: string | null;
  referralType?: "signup" | "package";
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalCommissions: number;
}

export function useReferrals() {
  const { user } = useAuth();
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

      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch referrals from custom API
      const response = await fetch("/api/referrals", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Error fetching referrals");
        setError("Failed to fetch referrals");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (!data.referrals || data.referrals.length === 0) {
        setReferrals([]);
        setStats({
          totalReferrals: 0,
          activeReferrals: 0,
          pendingReferrals: 0,
          totalCommissions: 0,
        });
        setIsLoading(false);
        return;
      }

      setReferrals(data.referrals);
      setStats(
        data.stats || {
          totalReferrals: data.referrals.length,
          activeReferrals: data.referrals.filter(
            (r: ReferralData) => r.status === "active",
          ).length,
          pendingReferrals: data.referrals.filter(
            (r: ReferralData) => r.status === "pending",
          ).length,
          totalCommissions: data.referrals.reduce(
            (sum: number, r: ReferralData) => sum + r.commissionEarned,
            0,
          ),
        },
      );
    } catch (err) {
      console.error("Error in fetchReferrals:", err);
      setError("Failed to fetch referrals");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReferrals();
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
  // Package purchase referrals are always commissionable
  if (referral.referralType === "package") {
    return "Commissionable";
  }
  if (referral.status === "active" && referral.packagePurchased) {
    return "Commissionable";
  }
  if (referral.status === "active" && !referral.packagePurchased) {
    return "Signed Up";
  }
  if (referral.status === "pending") {
    return "Pending Activation";
  }
  if (referral.status === "invalid") {
    return "Reversed";
  }
  return "Inactive";
}
