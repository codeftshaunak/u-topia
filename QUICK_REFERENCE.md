# Quick Reference Card - Backend Migration

## 🎯 Most Common Tasks

### Authentication

```typescript
// Get auth context
import { useAuth } from '@/contexts/AuthContext';
const { user, signIn, signUp, signOut } = useAuth();

// Sign in
await signIn(email, password);

// Sign up
await signUp(email, password, fullName, mobile);

// Sign out
await signOut();

// Check if logged in
if (user) { /* user is logged in */ }
```

### Database Queries

```typescript
// Fetch referrals
const res = await fetch('/api/referrals');
const { referrals, stats } = await res.json();

// Fetch packages
const res = await fetch('/api/packages');
const { packages } = await res.json();

// Update profile
const res = await fetch('/api/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName: 'New Name' }),
});
```

### Real-Time Updates

```typescript
import { subscribeToTable } from '@/lib/socket-client';

// Subscribe to changes
subscribeToTable('referrals', (data) => {
  // Refetch or update UI
});
```

## 🔄 Supabase → Custom Backend Cheat Sheet

| Task | Supabase | Custom Backend |
|------|----------|----------------|
| **Sign In** | `supabase.auth.signInWithPassword()` | `useAuth().signIn()` |
| **Sign Up** | `supabase.auth.signUp()` | `useAuth().signUp()` |
| **Sign Out** | `supabase.auth.signOut()` | `useAuth().signOut()` |
| **Get User** | `supabase.auth.getSession()` | `useAuth().user` |
| **Query Data** | `supabase.from('table').select()` | `fetch('/api/endpoint')` |
| **Insert** | `supabase.from('table').insert()` | `fetch('/api/endpoint', {method: 'POST'})` |
| **Update** | `supabase.from('table').update()` | `fetch('/api/endpoint', {method: 'PATCH'})` |
| **Delete** | `supabase.from('table').delete()` | `fetch('/api/endpoint', {method: 'DELETE'})` |
| **Real-time** | `supabase.channel().on()` | `subscribeToTable()` |

## 🗄️ Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes data)
npx prisma migrate reset

# Open visual editor
npx prisma studio

# Push schema without migration
npx prisma db push
```

## 🌐 API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get session
- `POST /api/auth/reset-password` - Reset password

### Data
- `GET /api/referrals` - Get referrals
- `GET /api/referrals/link` - Get referral link
- `POST /api/referrals/use-code` - Use code
- `GET /api/commissions` - Get commissions
- `GET /api/packages` - Get packages
- `GET /api/profile` - Get profile
- `PATCH /api/profile` - Update profile
- `GET /api/admin/check` - Check admin

## 📝 Environment Variables

```env
# Required
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
AUTH_SECRET="32-character-random-string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🔧 Setup Checklist

- [ ] Install PostgreSQL
- [ ] Copy `.env.example` to `.env`
- [ ] Update DATABASE_URL in `.env`
- [ ] Generate random AUTH_SECRET
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Start dev server: `pnpm dev`

## 🐛 Troubleshooting

### Database Issues
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql@15

# Test connection
psql -d your_database
```

### Prisma Issues
```bash
# Regenerate client
npx prisma generate

# Format schema
npx prisma format
```

### Auth Issues
- Clear browser cookies
- Check AUTH_SECRET is set
- Verify cookie settings

## 📚 File Locations

- **Schema**: `prisma/schema.prisma`
- **API Routes**: `src/app/api/*`
- **Auth Utils**: `src/lib/auth.ts`
- **Database Client**: `src/lib/db.ts`
- **Auth Context**: `src/contexts/AuthContext.tsx`
- **Socket Client**: `src/lib/socket-client.ts`

## 🚀 Development Workflow

1. Start database: `brew services start postgresql@15`
2. Start dev server: `pnpm dev`
3. Make changes to schema: Edit `prisma/schema.prisma`
4. Create migration: `npx prisma migrate dev`
5. Update API routes: Edit files in `src/app/api/`
6. Test in browser: `http://localhost:3000`

## 🔗 Documentation Links

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Step-by-step migration
- [IMPLEMENTATION_EXAMPLES.md](./IMPLEMENTATION_EXAMPLES.md) - Code examples
- [BACKEND_README.md](./BACKEND_README.md) - Full API documentation
- [BACKEND_MIGRATION_SUMMARY.md](./BACKEND_MIGRATION_SUMMARY.md) - Overview

## 💡 Pro Tips

1. Use `npx prisma studio` to visually inspect/edit database
2. Keep old Supabase code until migration is 100% complete
3. Test auth flow first before migrating other features
4. Use TypeScript's type inference with Prisma
5. Add console.logs liberally during migration
6. Test real-time features in multiple browser tabs

## ⚡ Performance Tips

1. Add database indexes for frequently queried fields
2. Use connection pooling in production
3. Implement pagination for large datasets
4. Cache frequently accessed data
5. Use `include` and `select` in Prisma to fetch only needed data

---

**Keep this reference handy while migrating!**
