# U-Topia Unified - Architecture Overview

## Project Origin

This project is a unified combination of two separate U-Topia applications:

1. **u-topia-membership-main** - Community collaboration and membership management platform
2. **remix-of-u-topia-affiliate-hub-64-main** - Affiliate referral hub with monetization features

## Architecture Patterns

### Feature-Based Organization

The application is organized by feature domains:

```
src/
├── pages/              # Route-based page components
├── components/
│   ├── ui/            # Shared UI primitives (shadcn)
│   ├── admin/         # Admin-specific features
│   ├── dashboard/     # Dashboard analytics components
│   ├── community/     # Community collaboration features
│   └── layout/        # Layout and navigation
├── hooks/             # Custom React hooks for business logic
├── contexts/          # React Context providers
├── integrations/      # External service integrations
├── lib/               # Utility functions
└── data/              # Static data and constants
```

### Key Architectural Decisions

#### 1. Routing Strategy
- **Public Routes**: Landing page, auth, password reset
- **Protected Routes**: All authenticated user features
- **Admin Routes**: Role-based protected routes for admins
- **Layout Wrapper**: Community features use Layout component for sidebar navigation

#### 2. State Management
- **Server State**: TanStack React Query for data fetching and caching
- **UI State**: React hooks (useState, useReducer)
- **Global State**: React Context for theme and demo mode
- **Authentication**: Supabase Auth with session management

#### 3. Component Patterns
- **Container/Presentational**: Separation of data fetching and UI
- **Custom Hooks**: Business logic extraction (usePackages, useReferrals, etc.)
- **Compound Components**: Complex UI with multiple sub-components
- **Protected Routes**: Higher-order component for authentication

#### 4. Data Flow
```
Supabase Database
    ↓
React Query (Server State)
    ↓
Custom Hooks (Business Logic)
    ↓
Page Components
    ↓
UI Components
```

## Feature Integration Points

### Shared Features
Both original projects share:
- Authentication (Supabase)
- User profiles
- UI component library (shadcn)
- Styling system (Tailwind CSS)
- Data fetching (React Query)

### Membership-Specific Features
Located primarily in:
- `pages/Messages.tsx`
- `pages/Members.tsx`
- `pages/Files.tsx`
- `components/community/`
- Uses `Layout` component with sidebar

### Affiliate-Specific Features
Located primarily in:
- `pages/Dashboard.tsx` (affiliate dashboard)
- `pages/Purchase.tsx`
- `pages/AdminDashboard.tsx`
- `components/admin/`
- `components/dashboard/`
- `hooks/useReferrals.ts`, `useCommissions.ts`, etc.

## Navigation Structure

### Primary Navigation (Header/BottomNav)
- Home/Landing
- Dashboard (affiliate features)
- Profile Settings
- Admin (role-based)

### Secondary Navigation (Sidebar in Layout)
- Messages
- Members
- Files
- About
- Contact
- Settings
- Upgrade

### User Journey

1. **New Visitor**
   - Lands on Index (landing page)
   - Views membership tiers
   - Signs up via Auth page
   - Completes Onboarding

2. **Authenticated Member**
   - Access Dashboard (affiliate view)
   - Navigate to Community features via sidebar
   - Use referral tools
   - Track commissions

3. **Admin**
   - All member features
   - Admin Dashboard access
   - User management
   - Commission controls
   - Platform settings

## Database Schema

### Core Tables
- `profiles` - User profiles with membership tier
- `packages` - Membership package definitions
- `referrals` - Referral tracking
- `commissions` - Commission records
- `messages` - Chat messages
- `files` - File uploads
- `audit_logs` - Admin action tracking

### Key Relationships
- User → Referrals (1:many)
- User → Commissions (1:many)
- Package → User (1:many)
- User → Messages (1:many)

## Authentication & Authorization

### Authentication
- Supabase Auth handles all authentication
- Email/password login
- Session persistence
- Password reset flow

### Authorization Levels
1. **Public** - Landing page, auth pages
2. **Authenticated** - Dashboard, community features
3. **Admin** - Admin dashboard and controls
4. **Shareholder** - Shareholder portal

### Protection Mechanism
```tsx
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

## Theme System

### Dark/Light Mode
- Implemented via `next-themes`
- ThemeProvider wraps entire app
- Persisted to localStorage
- Toggle component available

### Tailwind Configuration
- Custom color scheme
- Gradient utilities
- Responsive breakpoints
- Dark mode variants

## Performance Optimizations

### Code Splitting
- Route-based code splitting via React.lazy (potential)
- Component lazy loading where appropriate

### Data Fetching
- React Query caching
- Background refetching
- Optimistic updates
- Query invalidation

### Asset Optimization
- Image optimization
- Lazy loading images
- SVG icons (Lucide)

## Testing Strategy (Recommended)

### Unit Tests
- Custom hooks
- Utility functions
- Component logic

### Integration Tests
- User flows
- Form submissions
- API interactions

### E2E Tests
- Critical user journeys
- Purchase flow
- Admin operations

## Deployment Considerations

### Environment Variables
- `VITE_SUPABASE_URL` - Required
- `VITE_SUPABASE_ANON_KEY` - Required

### Build Process
```bash
npm run build  # Production build
npm run preview  # Test production build locally
```

### Hosting Options
- Vercel (recommended for Vite projects)
- Netlify
- Cloudflare Pages
- Traditional hosting with Node.js

## Security Considerations

### Row Level Security (RLS)
- All Supabase tables should have RLS policies
- Users can only access their own data
- Admin role checks in database

### Input Validation
- Zod schemas for form validation
- Server-side validation via Supabase
- XSS protection via React's escaping

### Authentication
- Secure password requirements
- Session timeout
- CSRF protection via Supabase

## Future Enhancements

### Potential Improvements
1. Real-time notifications
2. Advanced analytics dashboard
3. Mobile app (React Native)
4. Email notifications
5. Payment gateway integration
6. Advanced referral tiers
7. Gamification features
8. Social sharing integrations

### Technical Debt
- Add comprehensive error boundaries
- Implement proper loading states
- Add unit tests
- Performance monitoring
- Accessibility audit

## Development Workflow

### Getting Started
1. Clone repository
2. Install dependencies: `npm install`
3. Set up `.env` file
4. Configure Supabase
5. Run development server: `npm run dev`

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Consistent file naming
- Component composition patterns

### Git Workflow
- Feature branches
- Pull request reviews
- Semantic versioning
- Conventional commits

## Support & Documentation

### Internal Resources
- README.md - Setup and features
- ARCHITECTURE.md (this file) - Technical overview
- Component documentation in code

### External Dependencies
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)

---

**Last Updated**: February 12, 2026
**Version**: 1.0.0
