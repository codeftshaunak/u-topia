/**
 * Contact feature API endpoint.
 * Covers:
 *  - POST /api/contact – send a contact/support message
 */
import { baseApi } from "@/store/baseApi";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
}

// ── Injected endpoints ─────────────────────────────────────────────────────

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Send a contact form submission. */
    sendContactMessage: builder.mutation<ContactResponse, ContactRequest>({
      query: (body) => ({
        url: "/contact",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useSendContactMessageMutation } = contactApi;
