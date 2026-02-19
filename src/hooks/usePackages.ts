import { useState, useEffect } from "react";

export interface Package {
  id: string;
  name: string;
  priceUsd: number;
  shares: number;
  dividendCapPercent: number;
  isActive: boolean;
}

export type PackageKey = "bronze" | "silver" | "gold" | "platinum" | "diamond";

const packageOrder: PackageKey[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
];

// Fallback packages used if the backend returns no rows (e.g. during RLS/config transitions).
// This prevents the UI from appearing "broken" while keeping dynamic package updates when available.
const DEFAULT_PACKAGES: Package[] = [
  {
    id: "default-bronze",
    name: "Bronze",
    priceUsd: 1,
    shares: 100,
    dividendCapPercent: 2,
    isActive: true,
  },
  {
    id: "default-silver",
    name: "Silver",
    priceUsd: 2,
    shares: 300,
    dividendCapPercent: 3,
    isActive: true,
  },
  {
    id: "default-gold",
    name: "Gold",
    priceUsd: 3,
    shares: 750,
    dividendCapPercent: 4,
    isActive: true,
  },
  {
    id: "default-platinum",
    name: "Platinum",
    priceUsd: 4,
    shares: 1800,
    dividendCapPercent: 5,
    isActive: true,
  },
  {
    id: "default-diamond",
    name: "Diamond",
    priceUsd: 5,
    shares: 5000,
    dividendCapPercent: 6,
    isActive: true,
  },
];

// Mapping for referral capacity based on tier
const referralCapacity: Record<PackageKey, number> = {
  bronze: 3,
  silver: 9,
  gold: 27,
  platinum: 81,
  diamond: 243,
};

// Commission depth is same as tier level (1-5)
const commissionDepth: Record<PackageKey, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  diamond: 5,
};

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }

      const data = await response.json();

      // If backend returns nothing, fall back so the marketing UI never looks empty.
      if (!data.packages || data.packages.length === 0) {
        setPackages(DEFAULT_PACKAGES);
      } else {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch packages"),
      );

      // On error, still show fallback packages for a functional UI.
      setPackages(DEFAULT_PACKAGES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const getPackageByName = (name: string): Package | undefined => {
    return packages.find((p) => p.name.toLowerCase() === name.toLowerCase());
  };

  const formatPrice = (price: number | undefined): string => {
    if (price === undefined || price === null) {
      return "$0";
    }
    return `$${price.toLocaleString()}`;
  };

  const getPackageFeatures = (pkg: Package): string[] => {
    const key = pkg.name.toLowerCase() as PackageKey;
    return [
      `${pkg.shares.toLocaleString()} Share Allocation`,
      `Maximum Referral Capacity: ${referralCapacity[key] || 3}`,
      `Commission Depth: ${commissionDepth[key] || 1} layer${commissionDepth[key] > 1 ? "s" : ""}`,
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
      `${referralCapacity[key] || 3} Referrals`,
      highlightTexts[key] || "Passive income",
    ];
  };

  return {
    packages,
    isLoading,
    error,
    getPackageByName,
    formatPrice,
    getPackageFeatures,
    getPackageHighlights,
    packageOrder,
  };
}
