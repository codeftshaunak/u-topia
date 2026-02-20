/**
 * usePackages – RTK Query backed hook.
 * All commission info comes directly from DB (pkg.commissionLevels).
 * No static COMMISSION_DEPTH / COMMISSION_LAYER_RATES constants.
 */
import { useMemo } from "react";
import { useGetPackagesQuery } from "@/store/features/packages/packagesApi";
import {
  DEFAULT_PACKAGES,
  PACKAGE_ORDER,
  getCommissionLevels,
  getTotalCommissionRate,
} from "@/store/features/packages/packagesApi";

export type { Package, PackageKey, CommissionLevel } from "@/store/features/packages/packagesApi";
import type { Package, PackageKey } from "@/store/features/packages/packagesApi";

// Re-export for consumers
export { PACKAGE_ORDER as packageOrder, DEFAULT_PACKAGES, getCommissionLevels, getTotalCommissionRate };

export function usePackages() {
  const { data, isLoading, isFetching, error } = useGetPackagesQuery(undefined, {
    // Always re-fetch from DB when the component mounts
    refetchOnMountOrArgChange: true,
  });

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
    const levels = getCommissionLevels(pkg);
    const depth = levels.length;
    const total = getTotalCommissionRate(pkg);
    return [
      `Unlimited Referrals`,
      `Commission Depth: ${depth} level${depth !== 1 ? "s" : ""}`,
      `Maximum Commission: Up to ${total.toFixed(depth > 0 ? (total % 1 === 0 ? 0 : 4) : 0)}%`,
      ...levels.map(l => `Level ${l.level}: ${l.rate}%`),
    ];
  };

  const getPackageHighlights = (pkg: Package): string[] => {
    const key = pkg.name.toLowerCase() as PackageKey;
    const highlightTexts: Record<PackageKey, string> = {
      bronze: "Entry-level passive income",
      silver: "Mid-tier commissions",
      gold: "3-level commission depth",
      platinum: "4-level commission depth",
      diamond: "6-level commission depth",
    };
    const levels = getCommissionLevels(pkg);
    return [
      `${levels.length} Commission Level${levels.length !== 1 ? "s" : ""}`,
      `Unlimited Referrals`,
      highlightTexts[key] || "Passive income",
    ];
  };

  return {
    packages,
    isLoading: isLoading && !data,
    isFetching,
    error: error ? new Error("Failed to fetch packages") : null,
    getPackageByName,
    formatPrice,
    getPackageFeatures,
    getPackageHighlights,
    packageOrder: PACKAGE_ORDER,
  };
}
