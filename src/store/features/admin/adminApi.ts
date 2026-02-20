/**
 * Admin feature API endpoints.
 * Covers:
 *  - GET  /api/admin/check       – verify current user is an admin
 *  - GET  /api/admin/users       – paginated user list (future)
 *  - GET  /api/admin/stats       – platform-wide stats (future)
 *
 * Supabase-direct admin hooks (useAdminStats, useAdminUsers, useAdminActivity,
 * useAdminUserDetail) can be progressively migrated into these endpoints by
 * adding the corresponding Next.js API routes when ready.
 */
import { baseApi } from "@/store/baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AdminCheckResponse {
  isAdmin: boolean;
  email: string | null;
}

// ── Injected endpoints ─────────────────────────────────────────────────────

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Check whether the current session user is a platform admin. */
    checkAdmin: builder.query<AdminCheckResponse, void>({
      query: () => "/admin/check",
      providesTags: ["AdminCheck"],
    }),
  }),
  overrideExisting: false,
});

export const { useCheckAdminQuery } = adminApi;
