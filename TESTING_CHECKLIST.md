# Supabase Removal - Testing Checklist

## 🧪 Core Authentication Tests

### Sign Up Flow

- [ ] Navigate to `/auth` with mode=signup
- [ ] Enter email, password, full name
- [ ] Account created successfully
- [ ] Redirect to dashboard
- [ ] User appears in session

### Sign In Flow

- [ ] Navigate to `/auth`
- [ ] Enter existing email and password
- [ ] Successful login
- [ ] Redirect to home page
- [ ] User logged in state visible

### Password Reset Flow

- [ ] Click "Forgot Password" on auth page
- [ ] Enter email
- [ ] Receive success message (even if email doesn't exist - for security)
- [ ] Check email for reset link (if email was sent)
- [ ] Click reset link with token
- [ ] Reset page loads with valid state
- [ ] Enter new password
- [ ] Password updated successfully
- [ ] Can login with new password

### Session Management

- [ ] Login and refresh page
- [ ] Session persists (no redirect to auth)
- [ ] Logout clears session
- [ ] Cannot access protected routes when logged out

## 👤 Profile Tests

### Profile Settings Page

- [ ] Navigate to profile settings when authenticated
- [ ] Profile data loads
- [ ] Update full name
- [ ] Changes save successfully
- [ ] Avatar gallery works
- [ ] Select different avatar
- [ ] Avatar updates immediately

### Profile Visibility

- [ ] User name shows in header
- [ ] Avatar shows in header
- [ ] Email shows in dropdown
- [ ] Admin badge shows if admin

## 💼 Affiliate Dashboard Tests

### Dashboard Access

- [ ] Redirect to auth if not logged in
- [ ] Dashboard loads for authenticated users
- [ ] Shows active referrals count
- [ ] Shows commission data
- [ ] Shows tier information

### Referral Code Tests

- [ ] Generate referral code
- [ ] Copy code works
- [ ] Share link pre-fills code
- [ ] Signup with referral code works
- [ ] Referral appears in dashboard after signup

## 👨‍💼 Admin Tests

### Admin Dashboard Access

- [ ] Non-admin users cannot access
- [ ] Admin users can access
- [ ] Redirects non-admin to dashboard with error
- [ ] Admin dashboard loads properly

### Admin Features

- [ ] User list loads
- [ ] Can view user details
- [ ] Can view activity feed
- [ ] Can view statistics
- [ ] Admin controls functional

## 📧 Contact Form Tests

### Contact Submission

- [ ] Navigate to contact page
- [ ] Fields pre-populated if logged in
- [ ] Submit contact form
- [ ] Success message shown
- [ ] Form clears after submit
- [ ] Submission recorded in database

## 🛒 Checkout Tests

### Purchase Flow

- [ ] Navigate to purchase page
- [ ] Select tier
- [ ] Click checkout button
- [ ] (Stripe integration needed - placeholder for now)
- [ ] Success page after purchase

## 🔄 Session Persistence Tests

### Cookie Tests

- [ ] Auth token stored in cookies
- [ ] Cookie is HTTP-only
- [ ] Cookie has SameSite attribute
- [ ] Cookie expires after 7 days
- [ ] Cookie removed on logout

### API Tests

- [ ] API calls include token automatically
- [ ] Unauthorized requests rejected (401)
- [ ] Invalid tokens rejected
- [ ] Session endpoint returns current user

## 🚫 Security Tests

### Auth Validation

- [ ] Empty email rejected
- [ ] Invalid email rejected
- [ ] Short password rejected
- [ ] Duplicate email rejected on signup
- [ ] Wrong password rejected on signin

### Admin Access Control

- [ ] Admin check verified server-side
- [ ] Cannot access admin endpoints without token
- [ ] Cannot fake admin status
- [ ] Admin list checked from database

### CSRF Protection

- [ ] Cookies set with SameSite=Lax
- [ ] Cross-site requests properly restricted
- [ ] Same-site requests work normally

## 📊 Console Tests

### No Errors

- [ ] No "supabase is not defined" errors
- [ ] No Supabase client errors
- [ ] No 404 errors for API endpoints
- [ ] No console warnings about auth

### Network Tests

- [ ] All API calls go to `/api/*` endpoints
- [ ] No calls to Supabase domain
- [ ] Proper HTTP status codes returned
- [ ] Response times reasonable

## 🔌 Integration Tests

### Multiple Tabs

- [ ] Login in one tab
- [ ] Refresh other tab
- [ ] Session persists across tabs
- [ ] Logout in one tab affects others

### Browser Storage

- [ ] Check localStorage has saved accounts (if rememberMe enabled)
- [ ] Saved accounts filled on auth page
- [ ] Can switch between accounts

### Mobile Tests

- [ ] Auth flow works on mobile
- [ ] Profile settings responsive
- [ ] Dashboard mobile layout works
- [ ] Bottom nav shows on mobile

## 📋 Test Results Template

```
Date: ___________
Tester: ___________
Build/Version: ___________

### Pass Rate: ___ / ___ tests passed

### Failed Tests:
1.
2.
3.

### Notes:
-
-
-

### Sign-Off: ___________
```

## ⚠️ Known Issues / TODOs

1. **Stripe Integration** - `/api/checkout` and `/api/verify-purchase` are placeholders
2. **Admin Hooks** - Some admin hooks still use Supabase client
3. **File Uploads** - Avatar upload functionality simplified (using gallery)
4. **Email Services** - Contact form doesn't actually send emails yet
5. **Email Verification** - Signup doesn't require email verification

## ✅ Sign-Off Checklist

- [ ] All critical auth tests pass
- [ ] No Supabase errors in console
- [ ] API endpoints functional
- [ ] Session management working
- [ ] Admin access control working
- [ ] Profile updates working
- [ ] Contact form working
- [ ] Ready for deployment review

---

**Test Environment:** Development
**Backend:** Custom Next.js API with PostgreSQL/Prisma
**Framework:** React 18 + Next.js 15
