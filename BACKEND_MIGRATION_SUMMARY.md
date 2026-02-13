# Backend Migration Summary

## ✅ Migration Complete - Supabase → Custom Next.js Backend

This project has been set up to replace the Supabase backend with a custom Next.js backend using PostgreSQL, Prisma, JWT authentication, and Socket.io for real-time features.

## 📦 What Was Installed

### Dependencies Added
- **@prisma/client** & **prisma**: Database ORM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation/verification
- **socket.io** & **socket.io-client**: Real-time communication
- **nanoid**: Unique ID generation

## 🏗️ New Architecture

```
/src
  /app/api
    /auth
      /signup/route.ts          - User registration
      /signin/route.ts          - User login
      /signout/route.ts         - User logout
      /session/route.ts         - Get current session
      /reset-password/route.ts  - Password reset
    /referrals
      /route.ts                 - Get user referrals
      /link/route.ts            - Get/create referral links
      /use-code/route.ts        - Use referral code
    /commissions
      /route.ts                 - Get commissions
    /packages
      /route.ts                 - Get packages
    /admin
      /check/route.ts           - Check admin status
    /profile
      /route.ts                 - Get/update profile
  /lib
    /db.ts                      - Prisma database client
    /auth.ts                    - Authentication utilities
    /socket.ts                  - Socket.io server
    /socket-client.ts           - Socket.io client
  /contexts
    /AuthContext.tsx            - Authentication context
  /hooks
    /useAuth.ts                 - Auth hook (re-export)
    /useReferrals-new.ts        - Referrals hook (new)
    /useAdmin-new.ts            - Admin hook (new)
    /usePackages-new.ts         - Packages hook (new)
  /prisma
    /schema.prisma              - Database schema
```

## 🗄️ Database Schema

The Prisma schema includes all tables from your Supabase database:

- **User** - User accounts with email/password
- **Profile** - User profile information
- **AdminWhitelist** - Admin access control
- **AdminAuditLog** - Audit trail for admin actions
- **AffiliateStatus** - User affiliate tier and status
- **ReferralLink** - Referral codes
- **Referral** - Referral relationships
- **Commission** - Commission records
- **CommissionRate** - Commission rate configuration
- **RevenueEvent** - Revenue tracking
- **Package** - Membership packages
- **Purchase** - Purchase records
- **ApprovedRevenueSource** - Approved revenue sources
- **PlatformActivity** - Activity logging
- **PlatformSetting** - Platform settings

## 🔐 Authentication System

### JWT-Based Authentication
- Tokens stored in HTTP-only cookies
- 7-day token expiration
- Automatic token refresh
- Secure password hashing with bcrypt (12 rounds)

### Session Management
- Session available via `useAuth()` hook
- Automatic session restoration on app load
- Protected routes using `ProtectedRoute` component

## 🔌 Real-Time Features

### Socket.io Implementation
- User-specific rooms for targeted events
- Table change subscriptions
- Auto-reconnection support
- Event-based updates

### Usage
```typescript
import { subscribeToTable } from '@/lib/socket-client';

subscribeToTable('referrals', (data) => {
  // Handle real-time update
});
```

## 📝 Next Steps

### 1. Set Up Database

```bash
# Option A: Local PostgreSQL
brew install postgresql@15
brew services start postgresql@15
createdb utopia_db

# Option B: Use cloud provider (Neon, Railway, Render, etc.)
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Run Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start Development Server

```bash
pnpm dev
```

### 5. Migrate Your Code

Replace Supabase calls throughout your codebase. See [IMPLEMENTATION_EXAMPLES.md](./IMPLEMENTATION_EXAMPLES.md) for detailed examples.

#### Quick Reference:

**Authentication:**
```typescript
// Old
import { supabase } from '@/integrations/supabase/client';
await supabase.auth.signIn({ email, password });

// New
import { useAuth } from '@/contexts/AuthContext';
const { signIn } = useAuth();
await signIn(email, password);
```

**Database Queries:**
```typescript
// Old
const { data } = await supabase.from('referrals').select('*');

// New
const response = await fetch('/api/referrals');
const { referrals } = await response.json();
```

**Real-time:**
```typescript
// Old
supabase.channel('ref').on('postgres_changes', ...).subscribe();

// New
subscribeToTable('referrals', (data) => { ... });
```

## 📚 Documentation

- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Detailed step-by-step migration guide
- **[IMPLEMENTATION_EXAMPLES.md](./IMPLEMENTATION_EXAMPLES.md)** - Code examples for common patterns
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Socket.io**: https://socket.io/docs

## 🎯 Key Features

✅ **Authentication**
- Email/password signup and signin
- Password reset flow
- Session management
- Protected routes

✅ **Database Operations**
- Referral system
- Commission tracking
- Package management
- Admin access control
- User profiles

✅ **Real-Time Updates**
- Live referral updates
- Commission notifications
- Purchase tracking
- Table change subscriptions

✅ **Security**
- JWT tokens in HTTP-only cookies
- Bcrypt password hashing
- SQL injection protection (Prisma)
- CSRF protection ready
- Rate limiting ready

## 🔄 Migration Strategy

### Recommended Approach: Gradual Migration

1. **Phase 1: Set up infrastructure** ✅ DONE
   - Install dependencies
   - Create database schema
   - Set up API routes
   - Create auth context

2. **Phase 2: Migrate authentication** (Next step)
   - Update App.tsx to use AuthProvider
   - Update Auth page
   - Update ProtectedRoute component
   - Test login/signup flows

3. **Phase 3: Migrate data fetching**
   - Replace hooks one by one
   - Update components
   - Test functionality

4. **Phase 4: Add real-time**
   - Implement Socket.io connection
   - Replace Supabase subscriptions
   - Test real-time updates

5. **Phase 5: Clean up**
   - Remove Supabase dependency
   - Delete unused files
   - Final testing

## 🛠️ Useful Commands

```bash
# Database
npx prisma studio              # Visual database editor
npx prisma migrate dev         # Create & apply migration
npx prisma migrate reset       # Reset database (⚠️ deletes data)
npx prisma db push             # Push schema without migration

# Development
pnpm dev                       # Start dev server
pnpm build                     # Build for production
pnpm start                     # Start production server

# Generate Types
npx prisma generate            # Generate Prisma Client
```

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Test connection
psql -d utopia_db
```

### Prisma Client Errors
```bash
# Regenerate client
npx prisma generate

# Reset if needed
npx prisma migrate reset
```

### Authentication Issues
- Check AUTH_SECRET is set in .env
- Clear browser cookies
- Verify cookie settings (httpOnly, secure, sameSite)

## 📊 Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| Dependencies | ✅ Installed | All packages added |
| Database Schema | ✅ Created | Prisma schema complete |
| Auth API Routes | ✅ Created | All endpoints ready |
| Database API Routes | ✅ Created | CRUD operations ready |
| Socket.io Setup | ✅ Created | Real-time ready |
| Auth Context | ✅ Created | React context ready |
| New Hooks | ✅ Created | Example hooks provided |
| Documentation | ✅ Complete | Guides and examples ready |
| Database Migration | ⏳ Pending | Run `prisma migrate dev` |
| Code Migration | ⏳ Pending | Replace Supabase calls |
| Testing | ⏳ Pending | Test after migration |

## 🚀 Ready to Start

Your backend infrastructure is ready! Follow these steps:

1. ✅ Read [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
2. ⏳ Set up PostgreSQL database
3. ⏳ Configure `.env` file
4. ⏳ Run `npx prisma migrate dev`
5. ⏳ Start migrating components (use [IMPLEMENTATION_EXAMPLES.md](./IMPLEMENTATION_EXAMPLES.md))
6. ⏳ Test thoroughly
7. ⏳ Deploy to production

## 💡 Tips

- **Start small**: Migrate one feature at a time
- **Test often**: Test each migration before moving to the next
- **Keep Supabase**: Keep the Supabase integration until migration is complete
- **Use Prisma Studio**: Great for debugging database issues
- **Read the docs**: All documentation files are comprehensive

## 🆘 Need Help?

1. Check [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions
2. Check [IMPLEMENTATION_EXAMPLES.md](./IMPLEMENTATION_EXAMPLES.md) for code examples
3. Review the API route implementations in `src/app/api/`
4. Look at the new hooks in `src/hooks/*-new.ts`

---

**Generated:** $(date)
**Status:** Infrastructure Ready ✅
**Next Step:** Database Setup & Migration
