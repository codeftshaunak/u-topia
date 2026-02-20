/**
 * Commissions feature API endpoints.
 * Covers:
 *  - GET  /api/commissions  – fetch commission ledger entries for current user
 */
import { baseApi } from "@/store/baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

export interface CommissionEntry {
  id: string;
  beneficiaryUserId: string;
  sourceRevenueEventId: string;
  layer: number;
  referredUserId: string;
  amountUsd: number;
  ratePercent: number;
  status: "pending" | "approved" | "paid" | "held" | "reversed";
  createdAt: string;
  notes: string | null;
}

export interface CommissionsResponse {
  commissions: CommissionEntry[];
}

export interface CommissionSummary {
  total_earned: number;
  pending: number;
  approved: number;
  paid: number;
  held: number;
  reversed: number;
  by_layer: Record<number, number>;
}

// ── Injected endpoints ─────────────────────────────────────────────────────

export const commissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Fetch all commission ledger entries for the authenticated user. */
    getCommissions: builder.query<CommissionsResponse, void>({
      query: () => "/commissions",
      providesTags: ["Commissions"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCommissionsQuery } = commissionsApi;
