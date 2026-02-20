/**
 * usePackageReferrals – RTK Query backed hook.
 * Drop-in replacement for the previous useState/useEffect version.
 */
import { useAuth } from "@/contexts/AuthContext";
import { useGetPackageReferralsQuery } from "@/store/features/referrals/referralsApi";

export type { ReferredUser, PackageReferralStats } from "@/store/features/referrals/referralsApi";
import type { ReferredUser, PackageReferralStats } from "@/store/features/referrals/referralsApi";

export function usePackageReferrals() {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useGetPackageReferralsQuery(
    undefined,
    { skip: !user }
  );

  return {
    referredUsers: data?.referredUsers ?? [],
    stats: data?.stats ?? null,
    isLoading: isLoading && !data,
    error: error ? "Failed to load referrals" : null,
    refetch: () => { refetch(); },
  };
}
