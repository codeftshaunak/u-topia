/**
 * Packages feature API endpoints.
 * Covers:
 *  - GET  /api/packages   – list all available affiliate packages
 */
import { baseApi } from "@/store/baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Package {
  id: string;
  name: string;
  priceUsd: number;
  shares: number;
  dividendCapPercent: number;
  isActive: boolean;
}

export type PackageKey = "bronze" | "silver" | "gold" | "platinum" | "diamond";

/** Ordered list of tiers from lowest to highest. */
export const PACKAGE_ORDER: PackageKey[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
];

/** Fallback packages shown while the API loads or when it returns nothing. */
export const DEFAULT_PACKAGES: Package[] = [
  { id: "default-bronze",   name: "Bronze",   priceUsd: 1, shares: 100,  dividendCapPercent: 2, isActive: true },
  { id: "default-silver",   name: "Silver",   priceUsd: 2, shares: 300,  dividendCapPercent: 3, isActive: true },
  { id: "default-gold",     name: "Gold",     priceUsd: 3, shares: 750,  dividendCapPercent: 4, isActive: true },
  { id: "default-platinum", name: "Platinum", priceUsd: 4, shares: 1800, dividendCapPercent: 5, isActive: true },
  { id: "default-diamond",  name: "Diamond",  priceUsd: 5, shares: 5000, dividendCapPercent: 6, isActive: true },
];

/** Number of direct referrals a user at each tier can bring in. */
export const REFERRAL_CAPACITY: Record<PackageKey, number> = {
  bronze: 3,
  silver: 9,
  gold: 27,
  platinum: 81,
  diamond: 243,
};

/** Commission depth per tier. */
export const COMMISSION_DEPTH: Record<PackageKey, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  diamond: 5,
};

export interface PackagesResponse {
  packages: Package[];
}

// ── Injected endpoints ─────────────────────────────────────────────────────

export const packagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Fetch the active package list. Falls back to defaults on error in the UI hook. */
    getPackages: builder.query<PackagesResponse, void>({
      query: () => "/packages",
      providesTags: ["Packages"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPackagesQuery } = packagesApi;
