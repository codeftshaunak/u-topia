import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminUserDetailData {
  id: string;
  email: string;
  fullName: string | null;
  signupDate: Date;
  isVerified: boolean;
  tier: string;
  rank: string;
  totalReferrals: number;
  activeReferrals: number;
  convertedReferrals: number;
  rewardsEarned: number;
  rewardsPending: number;
  commissionEarned: number;
  bonusesEarned: number;
  dividendsEarned: number;
  lastActive: Date;
  purchases: { id: string; tier: string; amount: number; date: Date; status: string }[];
  payouts: { id: string; amount: number; date: Date; status: string }[];
  referrals: { id: string; email: string; status: string; date: Date }[];
}

export function useAdminUserDetail(userId: string | undefined) {
  const [user, setUser] = useState<AdminUserDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      setIsLoading(true);

      const [{ data: profile, error: profileError }, { data: affiliate }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, full_name, created_at, is_verified, last_active")
          .eq("id", userId)
          .maybeSingle(),
        supabase.from("affiliate_status").select("tier").eq("user_id", userId).maybeSingle(),
      ]);

      if (profileError) throw profileError;
      if (!profile?.email) {
        setUser(null);
        return;
      }

      const tier = (affiliate?.tier || "bronze") as string;
      const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

      const [referralsRes, purchasesRes, commissionsRes] = await Promise.all([
        supabase
          .from("referrals")
          .select("id, created_at, status, referred_user_id")
          .eq("referrer_user_id", userId)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("purchases")
          .select("id, tier, amount, created_at, status")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("commission_ledger")
          .select("id, amount_usd, created_at, status")
          .eq("beneficiary_user_id", userId)
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

      const referredIds = (referralsRes.data || []).map((r: any) => r.referred_user_id);
      const { data: referredProfiles } = referredIds.length
        ? await supabase.from("profiles").select("id, email").in("id", referredIds)
        : { data: [] as any[] };

      const referredEmailMap = new Map<string, string>();
      (referredProfiles || []).forEach((p: any) => referredEmailMap.set(p.id, p.email || "Unknown"));

      const totalReferrals = referralsRes.data?.length || 0;
      const convertedReferrals = (referralsRes.data || []).filter((r: any) => r.status === "active").length;
      const activeReferrals = (referralsRes.data || []).filter((r: any) => r.status === "pending").length;

      const commissions = commissionsRes.data || [];
      const commissionEarned = commissions
        .filter((c: any) => c.status === "paid")
        .reduce((sum: number, c: any) => sum + Number(c.amount_usd), 0);
      const rewardsPending = commissions
        .filter((c: any) => c.status === "pending" || c.status === "approved" || c.status === "held")
        .reduce((sum: number, c: any) => sum + Number(c.amount_usd), 0);

      const rewardsEarned = commissionEarned; // currently only commissions exist

      const mapped: AdminUserDetailData = {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        signupDate: new Date(profile.created_at),
        isVerified: !!profile.is_verified,
        tier: tierLabel,
        rank: tierLabel,
        totalReferrals,
        activeReferrals,
        convertedReferrals,
        rewardsEarned: Number(rewardsEarned.toFixed(2)),
        rewardsPending: Number(rewardsPending.toFixed(2)),
        commissionEarned: Number(commissionEarned.toFixed(2)),
        bonusesEarned: 0,
        dividendsEarned: 0,
        lastActive: profile.last_active ? new Date(profile.last_active) : new Date(profile.created_at),
        purchases: (purchasesRes.data || []).map((p: any) => ({
          id: p.id,
          tier: (p.tier || "").charAt(0).toUpperCase() + (p.tier || "").slice(1),
          amount: (p.amount || 0) / 100,
          date: new Date(p.created_at),
          status: p.status,
        })),
        payouts: commissions
          .filter((c: any) => c.status === "paid")
          .slice(0, 50)
          .map((c: any) => ({
            id: c.id,
            amount: Number(c.amount_usd),
            date: new Date(c.created_at),
            status: c.status,
          })),
        referrals: (referralsRes.data || []).map((r: any) => ({
          id: r.id,
          email: referredEmailMap.get(r.referred_user_id) || "Unknown",
          status: r.status,
          date: new Date(r.created_at),
        })),
      };

      setUser(mapped);
    } catch (e: any) {
      console.error("useAdminUserDetail error", e);
      setError("Failed to load user detail");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return useMemo(
    () => ({ user, isLoading, error, refetch: fetchDetail }),
    [user, isLoading, error, fetchDetail]
  );
}
