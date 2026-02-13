import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminUserRow {
  id: string;
  email: string;
  fullName: string | null;
  signupDate: Date;
  isVerified: boolean;
  tier: string;
  rank: string;
  totalReferrals: number;
  rewardsEarned: number;
  rewardsPending: number;
  lastActive: Date;
}

type DbProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  is_verified: boolean;
  last_active: string | null;
};

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Keep this bounded; the UI paginates client-side.
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at, is_verified, last_active")
        .order("created_at", { ascending: false })
        .limit(500);

      if (profilesError) throw profilesError;

      const safeProfiles: DbProfile[] = (profiles || []) as any;
      const userIds = safeProfiles.map((p) => p.id);

      const [affiliateRes, referralsRes, commissionsRes] = await Promise.all([
        supabase.from("affiliate_status").select("user_id, tier").in("user_id", userIds),
        supabase.from("referrals").select("referrer_user_id").in("referrer_user_id", userIds),
        supabase
          .from("commission_ledger")
          .select("beneficiary_user_id, amount_usd, status")
          .in("beneficiary_user_id", userIds),
      ]);

      // Tier map
      const tierMap = new Map<string, string>();
      (affiliateRes.data || []).forEach((a: any) => tierMap.set(a.user_id, a.tier));

      // Referral counts
      const referralCountMap = new Map<string, number>();
      (referralsRes.data || []).forEach((r: any) => {
        referralCountMap.set(r.referrer_user_id, (referralCountMap.get(r.referrer_user_id) || 0) + 1);
      });

      // Commission sums
      const earnedMap = new Map<string, number>();
      const pendingMap = new Map<string, number>();
      (commissionsRes.data || []).forEach((c: any) => {
        const amount = Number(c.amount_usd) || 0;
        if (c.status === "paid") {
          earnedMap.set(c.beneficiary_user_id, (earnedMap.get(c.beneficiary_user_id) || 0) + amount);
        } else if (c.status === "pending" || c.status === "approved" || c.status === "held") {
          pendingMap.set(c.beneficiary_user_id, (pendingMap.get(c.beneficiary_user_id) || 0) + amount);
        }
      });

      const mapped: AdminUserRow[] = safeProfiles
        .filter((p) => !!p.email)
        .map((p) => {
          const tier = tierMap.get(p.id) || "bronze";
          const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
          return {
            id: p.id,
            email: p.email || "",
            fullName: p.full_name,
            signupDate: new Date(p.created_at),
            isVerified: !!p.is_verified,
            tier: tierLabel,
            rank: tierLabel,
            totalReferrals: referralCountMap.get(p.id) || 0,
            rewardsEarned: Number((earnedMap.get(p.id) || 0).toFixed(2)),
            rewardsPending: Number((pendingMap.get(p.id) || 0).toFixed(2)),
            lastActive: p.last_active ? new Date(p.last_active) : new Date(p.created_at),
          };
        });

      setUsers(mapped);
    } catch (e: any) {
      console.error("useAdminUsers error", e);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-users-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchUsers()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'referrals' },
        () => fetchUsers()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commission_ledger' },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);

  return useMemo(
    () => ({ users, isLoading, error, refetch: fetchUsers }),
    [users, isLoading, error, fetchUsers]
  );
}
