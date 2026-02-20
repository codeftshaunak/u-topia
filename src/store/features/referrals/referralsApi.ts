/**
 * Referrals feature API endpoints.
 * Covers:
 *  - GET  /api/referrals              – fetch referral list + stats
 *  - GET  /api/referrals/link         – get active referral link code
 *  - POST /api/referrals/link         – regenerate referral link
 *  - GET  /api/referrals/package-rewards  – package-level referral rewards
 *  - POST /api/referrals/use-code     – apply a referral code at signup
 */
import { baseApi } from "@/store/baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReferralData {
  id: string;
  referredUserId: string;
  referredName: string | null;
  referredEmail: string;
  signupDate: string;
  status: "pending" | "active" | "invalid";
  packagePurchased: string | null;
  commissionEarned: number;
  commissionStatus: string | null;
  referralType?: "signup" | "package";
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalCommissions: number;
}

export interface ReferralsResponse {
  referrals: ReferralData[];
  stats: ReferralStats;
}

export interface ReferralLinkResponse {
  code: string;
}

export interface ReferredUser {
  id: string;
  buyerUserId: string;
  buyerName: string | null;
  buyerEmail: string;
  buyerAvatar: string | null;
  tier: string;
  purchaseAmountUsd: number;
  rewardPercent: number;
  rewardAmountUsd: number;
  rewardStatus: string;
  purchaseDate: string;
}

export interface PackageReferralStats {
  totalReferredPurchases: number;
  totalRewardsEarned: number;
  pendingRewards: number;
  approvedRewards: number;
  paidRewards: number;
  tierBreakdown: { tier: string; count: number }[];
}

export interface PackageReferralsResponse {
  referredUsers: ReferredUser[];
  stats: PackageReferralStats;
}

export interface UseCodeRequest {
  /** The short referral code string. */
  code: string;
  /** Email of the new user who just signed up. */
  email?: string;
}

// ── Injected endpoints ─────────────────────────────────────────────────────

export const referralsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Fetch all referrals and aggregate stats for the current user. */
    getReferrals: builder.query<ReferralsResponse, void>({
      query: () => "/referrals",
      providesTags: ["Referrals"],
    }),

    /** Get the current user's active referral link code. */
    getReferralLink: builder.query<ReferralLinkResponse, void>({
      query: () => "/referrals/link",
      providesTags: ["ReferralLink"],
    }),

    /** Regenerate (or create) a new referral link for the current user. */
    regenerateReferralLink: builder.mutation<ReferralLinkResponse, void>({
      query: () => ({
        url: "/referrals/link",
        method: "POST",
      }),
      invalidatesTags: ["ReferralLink"],
    }),

    /** Fetch package-level referral rewards earned by the current user. */
    getPackageReferrals: builder.query<PackageReferralsResponse, void>({
      query: () => "/referrals/package-rewards",
      providesTags: ["PackageReferrals"],
    }),

    /** Apply a referral code for a signed-up user. */
    useReferralCode: builder.mutation<{ success: boolean }, UseCodeRequest>({
      query: (body) => ({
        url: "/referrals/use-code",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Referrals"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetReferralsQuery,
  useGetReferralLinkQuery,
  useRegenerateReferralLinkMutation,
  useGetPackageReferralsQuery,
  useUseReferralCodeMutation,
} = referralsApi;
