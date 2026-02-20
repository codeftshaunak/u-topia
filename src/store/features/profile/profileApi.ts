/**
 * Profile feature API endpoints.
 * Covers:
 *  - GET   /api/profile  – fetch current user profile and affiliate status
 *  - PATCH /api/profile  – update profile fields
 */
import { baseApi } from "@/store/baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AffiliateStatus {
  userId: string;
  tier: string;
  tierDepthLimit: number;
  isActive: boolean;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  lastActive: string | null;
  notificationPreferences: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  profile: UserProfile;
  affiliateStatus: AffiliateStatus | null;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
  notificationPreferences?: Record<string, unknown>;
}

// ── Injected endpoints ─────────────────────────────────────────────────────

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Get the current user's profile and affiliate status. */
    getProfile: builder.query<ProfileResponse, void>({
      query: () => "/profile",
      providesTags: ["Profile"],
    }),

    /** Partially update profile fields. */
    updateProfile: builder.mutation<ProfileResponse, UpdateProfileRequest>({
      query: (body) => ({
        url: "/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Profile", "Session"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
