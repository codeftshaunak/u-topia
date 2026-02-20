/**
 * useReferralLink – RTK Query backed hook.
 * Drop-in replacement for the previous useState/useEffect version.
 */
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useGetReferralLinkQuery,
  useRegenerateReferralLinkMutation,
} from "@/store/features/referrals/referralsApi";

export function useReferralLink() {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data,
    isLoading,
    isFetching: isRefreshing,
    error,
    refetch,
  } = useGetReferralLinkQuery(undefined, { skip: !user });

  const [regenerate, { isLoading: isRegenerating }] =
    useRegenerateReferralLinkMutation();

  const referralCode = data?.code ?? null;

  const { fullReferralUrl, fullPurchaseReferralUrl } = useMemo(() => {
    if (!referralCode) return { fullReferralUrl: null, fullPurchaseReferralUrl: null };
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://u-topia.com";
    return {
      fullReferralUrl: `${base}/auth?ref=${referralCode}`,
      fullPurchaseReferralUrl: `${base}/purchase?ref=${referralCode}`,
    };
  }, [referralCode]);

  const regenerateLink = async () => {
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to generate a referral link.",
        variant: "destructive",
      });
      return;
    }
    try {
      await regenerate().unwrap();
      toast({
        title: "Link Refreshed",
        description: "Your new referral link is ready.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate a new referral link.",
        variant: "destructive",
      });
    }
  };

  return {
    referralLink: referralCode,
    fullReferralUrl,
    fullPurchaseReferralUrl,
    isLoading: isLoading && !data,
    isRefreshing: isRefreshing || isRegenerating,
    error: error ? "Failed to fetch referral link" : null,
    regenerateLink,
    refetch: () => { refetch(); },
  };
}
