# Migration Guide: Supabase to Custom Next.js Backend

This guide will help you migrate from Supabase to a custom Next.js backend with PostgreSQL, Prisma, and Socket.io.

## Prerequisites

- PostgreSQL installed locally or access to a PostgreSQL database
- Node.js 18+ and pnpm installed

## Step 1: Set Up PostgreSQL Database

### Option A: Local PostgreSQL (macOS)

```bash
# Install PostgreSQL using Homebrew
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb utopia_db

# Create user (optional)
createuser -P utopia_user
# Grant privileges
psql -d utopia_db -c "GRANT ALL PRIVILEGES ON DATABASE utopia_db TO utopia_user;"
```

### Option B: Cloud PostgreSQL

Use any PostgreSQL hosting service:
- **Neon** (https://neon.tech) - Free tier available
- **Supabase** (keep using Supabase's PostgreSQL, just replace the auth/SDK)
- **Railway** (https://railway.app)
- **Render** (https://render.com)

## Step 2: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/utopia_db"
   AUTH_SECRET="generate-a-random-32-character-string-here"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

   To generate a secure AUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

## Step 3: Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Seed initial data (optional)
npx prisma db seed
```

## Step 4: Update Your Application Code

### 4.1: Wrap App with AuthProvider

Update your root layout or App component:

```tsx
// src/app/layout.tsx or src/App.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 4.2: Replace Supabase Auth Calls

**Before (Supabase):**
```typescript
import { supabase } from '@/integrations/supabase/client';

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

// Sign out
await supabase.auth.signOut();

// Get session
const { data: { session } } = await supabase.auth.getSession();
```

**After (Custom Backend):**
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { signIn, signUp, signOut, user } = useAuth();

// Sign in
await signIn(email, password);

// Sign up
await signUp(email, password, fullName, mobile);

// Sign out
await signOut();

// Get user
const currentUser = user; // From context
```

### 4.3: Replace Database Queries

**Before (Supabase):**
```typescript
// Get referrals
const { data, error } = await supabase
  .from('referrals')
  .select('*')
  .eq('referrer_user_id', userId);
```

**After (API Routes):**
```typescript
// Get referrals
const response = await fetch('/api/referrals');
const { referrals, stats } = await response.json();
```

### 4.4: Replace Real-time Subscriptions

**Before (Supabase):**
```typescript
const channel = supabase
  .channel('referrals-realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' },
    (payload) => console.log(payload)
  )
  .subscribe();
```

**After (Socket.io):**
```typescript
import { subscribeToTable } from '@/lib/socket-client';

subscribeToTable('referrals', (data) => {
  console.log('Table changed:', data);
  // Refetch data
});
```

## Step 5: API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session
- `POST /api/auth/reset-password` - Request/complete password reset

### Referrals
- `GET /api/referrals` - Get user's referrals and stats
- `GET /api/referrals/link` - Get referral link
- `POST /api/referrals/link` - Generate new referral link
- `POST /api/referrals/use-code` - Use a referral code

### Commissions
- `GET /api/commissions` - Get user's commissions

### Packages
- `GET /api/packages` - Get all active packages

### Admin
- `GET /api/admin/check` - Check if user is admin

### Profile
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update user profile

## Step 6: Remove Supabase Dependencies

Once migration is complete and tested:

```bash
pnpm remove @supabase/supabase-js
```

Delete Supabase-related files:
```bash
rm -rf src/integrations/supabase
```

## Step 7: Testing

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Test the following flows:
   - [ ] User signup
   - [ ] User signin
   - [ ] User signout
   - [ ] Password reset
   - [ ] Fetching referrals
   - [ ] Generating referral links
   - [ ] Viewing commissions
   - [ ] Admin access
   - [ ] Profile updates

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -d utopia_db -U username

# Check if PostgreSQL is running
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql@15
```

### Prisma Issues

```bash
# Reset database (⚠️ WARNING: Deletes all data)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

### Auth Token Issues

- Clear browser cookies
- Check AUTH_SECRET is set in .env
- Verify cookie settings in production (httpOnly, secure, sameSite)

## Production Deployment

### Environment Variables

Ensure these are set in your production environment:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="long-random-secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXTAUTH_URL="https://yourdomain.com"
```

### Database Migration

```bash
# In production, use migrate deploy instead of migrate dev
npx prisma migrate deploy
```

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure cookie flags
- [ ] Use strong AUTH_SECRET
- [ ] Enable database connection pooling
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Rate limit API endpoints
- [ ] Validate all user inputs
- [ ] Sanitize database queries

## Next Steps

After successful migration:

1. Set up email service for password resets
2. Configure Stripe for payments
3. Set up monitoring and logging
4. Implement rate limiting
5. Add API documentation
6. Set up automated backups
7. Configure CI/CD pipeline

## Support

For issues or questions, refer to:
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
- Socket.io Docs: https://socket.io/docs
