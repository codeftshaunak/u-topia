/**
 * useReferralLink – RTK Query backed hook.
 * Drop-in replacement for the previous useState/useEffect version.
 *
 * IMPORTANT: Referral links are only available to users who have purchased a package.
 * The API returns a 403 with `hasPackage: false` if the user hasn't bought one yet.
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

  // Detect if the user doesn't have a package (403 from API)
  const hasPackage = useMemo(() => {
    if (data?.hasPackage === true) return true;
    if (data?.hasPackage === false) return false;
    // Check the error response for the hasPackage flag
    if (error && "data" in error) {
      const errData = error.data as Record<string, unknown>;
      if (errData?.hasPackage === false) return false;
    }
    // Default: if we have data, user has a package
    if (data?.code) return true;
    return null; // Unknown (loading)
  }, [data, error]);

  const { fullReferralUrl } = useMemo(() => {
    if (!referralCode) return { fullReferralUrl: null };
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://u-topia.com";
    return {
      fullReferralUrl: `${base}/auth?ref=${referralCode}`,
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
    hasPackage,
    isLoading: isLoading && !data,
    isRefreshing: isRefreshing || isRegenerating,
    error: error && hasPackage !== false ? "Failed to fetch referral link" : null,
    regenerateLink,
    refetch: () => { refetch(); },
  };
}
