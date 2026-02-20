/**
 * usePackages – RTK Query backed hook.
 * Drop-in replacement for the previous useState/useEffect version.
 * Falls back to DEFAULT_PACKAGES when the API returns nothing.
 */
import { useMemo } from "react";
import { useGetPackagesQuery } from "@/store/features/packages/packagesApi";
import {
  DEFAULT_PACKAGES,
  PACKAGE_ORDER,
  REFERRAL_CAPACITY,
  COMMISSION_DEPTH,
} from "@/store/features/packages/packagesApi";

export type { Package, PackageKey } from "@/store/features/packages/packagesApi";
import type { Package, PackageKey } from "@/store/features/packages/packagesApi";

// Re-export constants for components that import them from this hook file
export { PACKAGE_ORDER as packageOrder, DEFAULT_PACKAGES };

export function usePackages() {
  const { data, isLoading, error } = useGetPackagesQuery();

  const packages: Package[] = useMemo(() => {
    const pkgs = data?.packages ?? [];
    return pkgs.length > 0 ? pkgs : DEFAULT_PACKAGES;
  }, [data]);

  const getPackageByName = (name: string): Package | undefined =>
    packages.find((p) => p.name.toLowerCase() === name.toLowerCase());

  const formatPrice = (price: number | undefined): string => {
    if (price === undefined || price === null) return "$0";
    return `$${price.toLocaleString()}`;
  };

  const getPackageFeatures = (pkg: Package): string[] => {
    const key = pkg.name.toLowerCase() as PackageKey;
    return [
      `${pkg.shares.toLocaleString()} Share Allocation`,
      `Maximum Referral Capacity: ${REFERRAL_CAPACITY[key] || 3}`,
      `Commission Depth: ${COMMISSION_DEPTH[key] || 1} layer${COMMISSION_DEPTH[key] > 1 ? "s" : ""}`,
      `Dividend Cap: ${pkg.dividendCapPercent}%`,
      `Maximum Reward Rate: Up to ${pkg.dividendCapPercent}%`,
    ];
  };

  const getPackageHighlights = (pkg: Package): string[] => {
    const key = pkg.name.toLowerCase() as PackageKey;
    const highlightTexts: Record<PackageKey, string> = {
      bronze: "Entry-level passive income",
      silver: "Mid-tier dividends",
      gold: "LP growth eligible",
      platinum: "Higher passive rewards",
      diamond: "Top-tier dividends",
    };
    return [
      `${pkg.shares.toLocaleString()} Shares`,
      `${REFERRAL_CAPACITY[key] || 3} Referrals`,
      highlightTexts[key] || "Passive income",
    ];
  };

  return {
    packages,
    isLoading: isLoading && !data,
    error: error ? new Error("Failed to fetch packages") : null,
    getPackageByName,
    formatPrice,
    getPackageFeatures,
    getPackageHighlights,
    packageOrder: PACKAGE_ORDER,
  };
}
