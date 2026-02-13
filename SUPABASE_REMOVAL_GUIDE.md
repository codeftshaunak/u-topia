# Supabase Removal - Migration Guide

## Current Status

✅ **Completed:**

- `src/pages/Auth.tsx` - Now uses custom JWT auth via AuthContext
- `src/pages/ResetPassword.tsx` - Password reset via API endpoint
- `src/pages/AffiliateDashboard.tsx` - Auth check via useAuth
- `src/pages/AdminDashboard.tsx` - Admin check via useAdmin hook
- `src/pages/AdminUserDetail.tsx` - Auth check via useAuth
- `src/pages/Contact.tsx` - Contact submission via /api/contact
- `src/pages/Purchase.tsx` - Checkout via /api/checkout
- `src/pages/PurchaseSuccess.tsx` - Purchase verification via /api/verify-purchase
- `src/pages/ProfileSettings.tsx` - Profile updates via /api/profile
- `src/components/Header.tsx` - User data from AuthContext
- `src/components/BottomNav.tsx` - Admin check via /api/admin/check -`src/contexts/AuthContext.tsx` - Fully custom with custom backend

⏳ **Remaining Work (Lower Priority):**

- Hooks: `useReferrals`, `useCommissions`, `useAdmin`, `useAdminStats`, etc.
- Components: `ReferralToolsCard`, `AdminControls`, various admin settings
- These use Supabase for table queries but can be migrated to equivalent API endpoints

## Backend APIs Available/Required

### Existing Endpoints (Already Built)

- `GET /api/auth/session` - Get current session
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/signout` - Sign out
- `PUT /api/auth/reset-password` - Reset password with token
- `GET/PATCH /api/profile` - Profile operations
- `GET /api/referrals` - Get user referrals
- `GET /api/commissions` - Get commissions
- `GET /api/admin/check` - Check if user is admin

### Endpoints Needed (To be created)

- `POST /api/contact` - Submit contact form
- `POST /api/checkout` - Initiate Stripe checkout
- `POST /api/verify-purchase` - Verify purchase after checkout
- `GET /api/admin/stats` - Admin dashboard stats
- `GET /api/admin/users` - List all users (admin)
- `GET /api/admin/activity` - Activity feed (admin)
- `POST /api/referrals/use-code` - Use referral code during signup

## How to Complete Migration

### For React Hooks

Replace all Supabase client calls with fetch() to custom API endpoints.

**Pattern Before:**

```typescript
import { supabase } from "@/integrations/supabase/client";

const data = await supabase.from("table").select("*");
```

**Pattern After:**

```typescript
const response = await fetch("/api/endpoint");
const data = await response.json();
```

### For Admin Components

All admin components using `supabase` should use equivalent API endpoints instead.

### Steps to Continue Migration

1. **Create remaining API endpoints** in `src/app/api/`
2. **Update hooks** to call new endpoints instead of Supabase
3. **Update admin components** to use new endpoints
4. **Test auth flow** - Sign up, sign in, password reset
5. **Test affiliate features** - Referrals, commissions
6. **Test admin dashboard** - Stats, users, activity
7. **Remove Supabase client** from integrations folder

## Testing Checklist

- [ ] Sign up works
- [ ] Sign in works
- [ ] Session persists
- [ ] Sign out works
- [ ] Password reset works
- [ ] Profile updates work
- [ ] Avatar selection works
- [ ] Referral code processing works
- [ ] Dashboard loads correctly
- [ ] Admin dashboard accessible to admins only
- [ ] Affiliate dashboard shows accurate data
- [ ] Contact form submission works
- [ ] Purchase flow works
- [ ] No Supabase errors in browser console

## Important Notes

- **AuthContext** is the single source of truth for user state
- All API calls should use the authenticated session (JWT in cookies)
- The backend validates all requests using the JWT token
- Admin checks are done server-side for security
- All Supabase storage calls need custom file upload endpoints if needed

## Next Steps

Focus on:

1. Creating the remaining critical API endpoints
2. Updating the admin hooks (useAdminStats, useAdminUsers, etc.)
3. Removing Supabase import from integrations/supabase/

The application will be fully functional once hooks are updated.
