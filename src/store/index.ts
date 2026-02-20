/**
 * Redux store root.
 * RTK Query middleware and reducers are wired once here and shared
 * across every feature API slice (injected via baseApi).
 */
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";

// Import each feature slice to ensure endpoint injection runs BEFORE the
// store is exported. This is required when using injectEndpoints.
import "@/store/features/auth/authApi";
import "@/store/features/referrals/referralsApi";
import "@/store/features/packages/packagesApi";
import "@/store/features/commissions/commissionsApi";
import "@/store/features/profile/profileApi";
import "@/store/features/admin/adminApi";
import "@/store/features/checkout/checkoutApi";
import "@/store/features/contact/contactApi";
import "@/store/features/purchase/purchaseApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Inferred types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
