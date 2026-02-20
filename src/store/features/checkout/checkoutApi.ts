/**
 * Checkout feature API endpoints.
 * Covers:
 *  - GET  /api/checkout                          – list supported crypto assets
 *  - POST /api/checkout                          – create a payment session
 *  - GET  /api/checkout/fireblocks/session       – load an existing session
 *  - GET  /api/checkout/fireblocks/status        – poll payment status
 */
import { baseApi } from "@/store/baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SupportedAsset {
  id: string;
  name: string;
  symbol: string;
}

export interface SupportedAssetsResponse {
  supportedAssets: SupportedAsset[];
}

export interface CreateSessionRequest {
  tier: string;
  assetId: string;
  referralCode?: string;
}

export interface PaymentSessionData {
  sessionId: string;
  purchaseId: string;
  tier: string;
  tierName: string;
  priceUsd: number;
  amountCrypto: number;
  btcRateUsd: number;
  assetId: string;
  assetName: string;
  depositAddress: string;
  depositTag?: string;
  expiresAt: string;
  supportedAssets?: SupportedAsset[];
  instructions?: {
    title: string;
    steps: string[];
    note: string;
  };
}

export type PaymentStatusValue =
  | "pending"
  | "broadcasting"
  | "cancelling"
  | "confirming"
  | "completed"
  | "partial"
  | "failed"
  | "expired";

export interface PaymentStatusResponse {
  sessionId: string;
  purchaseId: string;
  tier: string;
  amountUsd: number;
  assetId: string;
  depositAddress: string;
  status: PaymentStatusValue;
  message: string;
  fireblocksStatus?: string | null;
  fireblocksStatusLabel?: string | null;
  fireblocksTxId?: string;
  txHash?: string;
  amountReceived?: number;
  amountCrypto?: string;
  expiresAt: string;
  createdAt: string;
}

// ── Injected endpoints ─────────────────────────────────────────────────────

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** List cryptocurrencies available for payment. */
    getSupportedAssets: builder.query<SupportedAssetsResponse, void>({
      query: () => "/checkout",
      providesTags: ["Checkout"],
    }),

    /** Create a new crypto payment session. */
    createCheckoutSession: builder.mutation<
      PaymentSessionData,
      CreateSessionRequest
    >({
      query: (body) => ({
        url: "/checkout",
        method: "POST",
        body,
      }),
    }),

    /** Load an existing payment session by ID. */
    getCheckoutSession: builder.query<PaymentSessionData, string>({
      query: (sessionId) =>
        `/checkout/fireblocks/session?sessionId=${sessionId}`,
      providesTags: (_result, _err, sessionId) => [
        { type: "Checkout", id: sessionId },
      ],
    }),

    /** Poll the status of an in-progress payment session. */
    getPaymentStatus: builder.query<PaymentStatusResponse, string>({
      query: (sessionId) =>
        `/checkout/fireblocks/status?sessionId=${sessionId}`,
      providesTags: (_result, _err, sessionId) => [
        { type: "Checkout", id: `status-${sessionId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSupportedAssetsQuery,
  useCreateCheckoutSessionMutation,
  useGetCheckoutSessionQuery,
  useGetPaymentStatusQuery,
} = checkoutApi;
