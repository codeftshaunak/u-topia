/**
 * Auth feature API endpoints.
 * Covers: session, sign-in, sign-up, sign-out, reset & update password.
 */
import { baseApi } from "@/store/baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  emailVerified: string | null;
  profile?: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
    email: string | null;
  } | null;
}

export interface SessionResponse {
  user: SessionUser | null;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  fullName?: string;
  mobile?: string;
}

export interface AuthResponse {
  user: SessionUser;
}

// ── Injected endpoints ─────────────────────────────────────────────────────

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Get the current authenticated session. */
    getSession: builder.query<SessionResponse, void>({
      query: () => "/auth/session",
      providesTags: ["Session"],
    }),

    /** Sign in with email and password. */
    signIn: builder.mutation<AuthResponse, SignInRequest>({
      query: (body) => ({
        url: "/auth/signin",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Session"],
    }),

    /** Sign up a new user. */
    signUp: builder.mutation<AuthResponse, SignUpRequest>({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Session"],
    }),

    /** Sign out the current user. */
    signOut: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/auth/signout",
        method: "POST",
      }),
      invalidatesTags: [
        "Session",
        "Profile",
        "ReferralLink",
        "Referrals",
        "Commissions",
        "PackageReferrals",
      ],
    }),

    /** Request a password reset email. */
    resetPassword: builder.mutation<{ success: boolean }, { email: string }>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    /** Update (reset) password via a reset token (PUT /auth/reset-password). */
    updatePassword: builder.mutation<
      { success: boolean },
      { token: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Session"],
    }),

    /** Permanently delete the current user's account. */
    deleteAccount: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/auth/delete",
        method: "DELETE",
      }),
      invalidatesTags: [
        "Session",
        "Profile",
        "ReferralLink",
        "Referrals",
        "Commissions",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSessionQuery,
  useSignInMutation,
  useSignUpMutation,
  useSignOutMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
  useDeleteAccountMutation,
} = authApi;
