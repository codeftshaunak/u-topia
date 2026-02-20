/**
 * Purchase feature API endpoint.
 * Covers:
 *  - POST /api/verify-purchase – verify a completed crypto payment
 */
import { baseApi } from "@/store/baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

export interface VerifyPurchaseRequest {
  paymentId: string;
  tier: string;
}

export interface VerifyPurchaseResponse {
  verified: boolean;
  emailSent?: boolean;
  message?: string;
}

// ── Injected endpoints ─────────────────────────────────────────────────────

export const purchaseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Verify a completed purchase by payment/session ID. */
    verifyPurchase: builder.mutation<
      VerifyPurchaseResponse,
      VerifyPurchaseRequest
    >({
      query: (body) => ({
        url: "/verify-purchase",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile", "Session"],
    }),
  }),
  overrideExisting: false,
});

export const { useVerifyPurchaseMutation } = purchaseApi;
