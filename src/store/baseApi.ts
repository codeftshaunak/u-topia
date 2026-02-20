/**
 * RTK Query base API configuration.
 * All feature APIs are injected into this single base so the Redux middleware
 * is registered only once and cache entries can share the same tags.
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: [
    "ReferralLink",
    "Referrals",
    "PackageReferrals",
    "Packages",
    "Commissions",
    "Profile",
    "AdminUsers",
    "AdminStats",
    "AdminCheck",
    "Session",
    "Checkout",
    "Contact",
    "Purchase",
  ],
  // Endpoints are injected per feature – see features/*/Api.ts
  endpoints: () => ({}),
});
