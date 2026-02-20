/**
 * Packages feature API endpoints.
 * Covers:
 *  - GET   /api/packages       – list all available affiliate packages
 *  - PATCH /api/admin/packages – update a package (admin only)
 */
import { baseApi } from "@/store/baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

/** One row in the commissionLevels array stored as JSON */
export interface CommissionLevel {
  level: number;
  rate: number; // percent, e.g. 10 = 10%
}

export interface Package {
  id: string;
  name: string;
  priceUsd: number;
  isActive: boolean;
  /** Ordered array of unlocked commission levels from the DB */
  commissionLevels: CommissionLevel[] | null;
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

/** Fallback packages used while the API loads (mirrors commission table). */
export const DEFAULT_PACKAGES: Package[] = [
  {
    id: "default-bronze", name: "Bronze", priceUsd: 100, isActive: true,
    commissionLevels: [{ level: 1, rate: 10 }],
  },
  {
    id: "default-silver", name: "Silver", priceUsd: 250, isActive: true,
    commissionLevels: [{ level: 1, rate: 10 }, { level: 2, rate: 5 }],
  },
  {
    id: "default-gold", name: "Gold", priceUsd: 500, isActive: true,
    commissionLevels: [{ level: 1, rate: 10 }, { level: 2, rate: 5 }, { level: 3, rate: 2.5 }],
  },
  {
    id: "default-platinum", name: "Platinum", priceUsd: 1000, isActive: true,
    commissionLevels: [{ level: 1, rate: 10 }, { level: 2, rate: 5 }, { level: 3, rate: 2.5 }, { level: 4, rate: 1.25 }],
  },
  {
    id: "default-diamond", name: "Diamond", priceUsd: 2500, isActive: true,
    commissionLevels: [
      { level: 1, rate: 10 }, { level: 2, rate: 5 }, { level: 3, rate: 2.5 },
      { level: 4, rate: 1.25 }, { level: 5, rate: 0.625 }, { level: 6, rate: 0.3125 },
    ],
  },
];

/**
 * Returns the active commission levels for a package from DB data.
 */
export function getCommissionLevels(pkg: Package): CommissionLevel[] {
  return (pkg.commissionLevels as CommissionLevel[]) ?? [];
}

/**
 * Total commission rate a package earns across all its levels.
 */
export function getTotalCommissionRate(pkg: Package): number {
  return getCommissionLevels(pkg).reduce((sum, l) => sum + l.rate, 0);
}

export interface PackagesResponse {
  packages: Package[];
}

export interface UpdatePackageRequest {
  id: string;
  priceUsd?: number;
  isActive?: boolean;
  commissionLevels?: CommissionLevel[];
}

// ── Injected endpoints ─────────────────────────────────────────────────────

export const packagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPackages: builder.query<PackagesResponse, void>({
      query: () => "/packages",
      providesTags: ["Packages"],
    }),
    updatePackage: builder.mutation<{ package: Package }, UpdatePackageRequest>({
      query: (body) => ({
        url: "/admin/packages",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Packages"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPackagesQuery, useUpdatePackageMutation } = packagesApi;
