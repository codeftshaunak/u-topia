# U-Topia Custom Backend

A custom Next.js backend replacing Supabase, built with PostgreSQL, Prisma, JWT authentication, and Socket.io.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL 15+

### Setup

```bash
# 1. Install dependencies (already done)
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 3. Set up database (automated script)
./scripts/setup-db.sh

# OR manually:
npx prisma generate
npx prisma migrate dev --name init

# 4. Start development server
pnpm dev
```

## 📁 Project Structure

```
/src
├── /app
│   └── /api
│       ├── /auth              # Authentication endpoints
│       ├── /referrals         # Referral management
│       ├── /commissions       # Commission tracking
│       ├── /packages          # Package management
│       ├── /admin             # Admin operations
│       └── /profile           # User profile
├── /lib
│   ├── db.ts                  # Prisma client
│   ├── auth.ts                # Auth utilities
│   ├── socket.ts              # Socket.io server
│   └── socket-client.ts       # Socket.io client
├── /contexts
│   └── AuthContext.tsx        # Auth context provider
├── /hooks
│   ├── useAuth.ts             # Auth hook
│   ├── useReferrals-new.ts    # Referrals hook
│   ├── useAdmin-new.ts        # Admin hook
│   └── usePackages-new.ts     # Packages hook
└── /prisma
    └── schema.prisma          # Database schema
```

## 🔐 Authentication

### JWT-Based Auth

- Tokens stored in HTTP-only cookies
- 7-day expiration
- Automatic refresh
- Secure bcrypt hashing (12 rounds)

### Usage

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signUp, signOut } = useAuth();

  // Sign in
  await signIn(email, password);

  // Sign up
  await signUp(email, password, fullName, mobile);

  // Sign out
  await signOut();

  // Access user
  console.log(user);
}
```

### Protected Routes

```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/auth" />;

  return <>{children}</>;
}
```

## 🗄️ Database

### Prisma ORM

```typescript
import { prisma } from '@/lib/db';

// Query example
const users = await prisma.user.findMany({
  include: { profile: true },
});

// Create example
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashedPassword,
    profile: {
      create: { fullName: 'John Doe' },
    },
  },
});
```

### Schema

See [prisma/schema.prisma](./prisma/schema.prisma) for the complete database schema.

Key models:
- User
- Profile
- Referral
- Commission
- Package
- Purchase

### Useful Commands

```bash
# Visual database editor
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Push schema changes
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

## 🌐 API Routes

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "mobile": "+1234567890"
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "profile": { ... }
  },
  "token": "..."
}
```

#### POST /api/auth/signin
Sign in with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/signout
Sign out current user.

#### GET /api/auth/session
Get current session.

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "profile": { ... }
  }
}
```

#### POST /api/auth/reset-password
Request or complete password reset.

**Request (send reset email):**
```json
{
  "email": "user@example.com"
}
```

**Request (reset with token):**
```json
{
  "token": "...",
  "newPassword": "newpassword123"
}
```

### Referrals

#### GET /api/referrals
Get user's referrals and stats.

**Response:**
```json
{
  "referrals": [...],
  "stats": {
    "totalReferrals": 5,
    "activeReferrals": 3,
    "pendingReferrals": 2,
    "totalCommissions": 150.00
  }
}
```

#### GET /api/referrals/link
Get user's referral link.

**Response:**
```json
{
  "code": "abc123xyz"
}
```

#### POST /api/referrals/link
Generate new referral link.

**Response:**
```json
{
  "code": "newcode123"
}
```

#### POST /api/referrals/use-code
Use a referral code.

**Request:**
```json
{
  "code": "abc123xyz",
  "email": "newuser@example.com"
}
```

### Commissions

#### GET /api/commissions
Get user's commissions.

**Response:**
```json
{
  "commissions": [...]
}
```

### Packages

#### GET /api/packages
Get all active packages.

**Response:**
```json
{
  "packages": [
    {
      "id": "...",
      "name": "Bronze",
      "priceUsd": 100,
      "shares": 10,
      ...
    }
  ]
}
```

### Profile

#### GET /api/profile
Get user profile.

**Response:**
```json
{
  "profile": {
    "id": "...",
    "fullName": "John Doe",
    "avatarUrl": "...",
    ...
  }
}
```

#### PATCH /api/profile
Update user profile.

**Request:**
```json
{
  "fullName": "Jane Doe",
  "avatarUrl": "https://..."
}
```

### Admin

#### GET /api/admin/check
Check if user is admin.

**Response:**
```json
{
  "isAdmin": true,
  "email": "admin@example.com"
}
```

## 🔌 Real-Time (Socket.io)

### Client Usage

```typescript
import { getSocket, subscribeToTable } from '@/lib/socket-client';

// Subscribe to table changes
subscribeToTable('referrals', (data) => {
  console.log('Table changed:', data);
  // Refetch data or update UI
});

// Join user-specific room
const socket = getSocket();
socket.emit('join', userId);

// Listen for user-specific events
socket.on('notification', (data) => {
  console.log('Notification:', data);
});
```

### Server Usage

```typescript
import { emitTableChange, emitToUser } from '@/lib/socket';

// Emit table change
emitTableChange('referrals', 'INSERT', newReferral);

// Emit to specific user
emitToUser(userId, 'notification', {
  message: 'New referral!',
});
```

## 🔒 Security

### Authentication
- JWT tokens in HTTP-only cookies
- Tokens expire after 7 days
- Passwords hashed with bcrypt (12 rounds)
- CSRF protection ready

### Database
- Prisma prevents SQL injection
- All queries are parameterized
- Type-safe queries

### API Routes
- Session validation on protected routes
- Input validation recommended
- Rate limiting recommended (add middleware)

## 📊 Monitoring & Debugging

### Prisma Studio
Visual database editor:
```bash
npx prisma studio
```

### Logs
Database queries are logged in development:
```typescript
// lib/db.ts
new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### Socket.io Debugging
Enable in browser console:
```javascript
localStorage.debug = 'socket.io-client:*';
```

## 🚀 Production Deployment

### Environment Variables

Required in production:
```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="long-random-secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXTAUTH_URL="https://yourdomain.com"
```

### Database Migration

```bash
# Use migrate deploy instead of migrate dev
npx prisma migrate deploy
```

### Security Checklist

- [ ] Use HTTPS
- [ ] Set secure cookie flags
- [ ] Use strong AUTH_SECRET (32+ chars)
- [ ] Enable database connection pooling
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Sanitize database queries
- [ ] Enable monitoring

### Performance

- Use database connection pooling
- Add caching layer (Redis)
- Implement pagination
- Add database indexes
- Monitor slow queries

## 🧪 Testing

### Test Authentication
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Database Connection
```bash
npx prisma db execute --stdin < test.sql
```

### Test Socket.io
Open browser console and connect:
```javascript
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('Connected'));
```

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Socket.io Documentation](https://socket.io/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## 🐛 Common Issues

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### "Database connection failed"
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Test connection: `psql -d your_database`

### "Invalid token" errors
- Clear browser cookies
- Check AUTH_SECRET is set
- Verify token expiration

### Socket.io connection fails
- Check NEXT_PUBLIC_APP_URL
- Verify CORS settings
- Check firewall/network

## 🤝 Contributing

When adding new features:

1. Update Prisma schema if needed
2. Create migration: `npx prisma migrate dev --name feature_name`
3. Add API routes in `/src/app/api`
4. Update types and hooks
5. Add tests
6. Update documentation

## 📝 License

Same as main project.

---

For migration from Supabase, see:
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- [IMPLEMENTATION_EXAMPLES.md](./IMPLEMENTATION_EXAMPLES.md)
- [BACKEND_MIGRATION_SUMMARY.md](./BACKEND_MIGRATION_SUMMARY.md)
