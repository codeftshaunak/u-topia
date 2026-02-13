import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useReferralLink() {
  const { user } = useAuth();
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReferralLink = useCallback(async () => {
    try {
      setError(null);

      if (!user) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/referrals/link", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to fetch referral link" }));
        console.error("Error fetching referral link:", errorData);
        setError("Failed to fetch referral link");
        return;
      }

      const data = await response.json();

      if (data?.code) {
        setReferralLink(data.code);
      }
    } catch (err) {
      console.error("Error in fetchReferralLink:", err);
      setError("Failed to fetch referral link");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const regenerateLink = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      if (!user) {
        toast({
          title: "Not Authenticated",
          description: "Please log in to generate a referral link.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/referrals/link", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to generate referral link" }));
        console.error("Error generating referral link:", errorData);
        toast({
          title: "Error",
          description: "Failed to generate a new referral link.",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      if (data?.code) {
        setReferralLink(data.code);
        toast({
          title: "Link Refreshed",
          description: "Your new referral link is ready.",
        });
      }
    } catch (err) {
      console.error("Error in regenerateLink:", err);
      toast({
        title: "Error",
        description: "Failed to generate a new referral link.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchReferralLink();
  }, [fetchReferralLink]);

  // Build the full referral URL
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://u-topia.com";
  const fullReferralUrl = referralLink
    ? `${baseUrl}/auth?ref=${referralLink}`
    : null;

  return {
    referralLink,
    fullReferralUrl,
    isLoading,
    isRefreshing,
    error,
    regenerateLink,
    refetch: fetchReferralLink,
  };
}
