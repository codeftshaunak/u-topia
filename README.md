# U-Topia Unified Platform

A comprehensive platform combining membership community features with an affiliate referral hub. This unified application integrates community collaboration tools, messaging, member management with a powerful affiliate program, commission tracking, and admin controls.

## Features

### Landing & Public Pages
- **Landing Page** - Hero section with membership tier showcase
- **Authentication** - Sign up / Login with Supabase Auth
- **Password Reset** - Secure password recovery flow
- **Refer & Earn** - Educational page about the referral program

### Membership & Community Features
- **Member Directory** - Browse and connect with community members
- **Messaging System** - Real-time chat with multiple channels:
  - Announcements
  - U-Topia Materials
  - Events Calendar
  - General Discussion
- **File Sharing** - Upload and manage shared documents
- **Network Visualization** - Interactive community network graph
- **Member Profiles** - Detailed profiles with expertise tags
- **Activity Tracking** - Recent member activities and updates

### Affiliate & Monetization
- **Referral System**
  - Unique referral links for each member
  - QR code generation for easy sharing
  - Multi-tier commission structure
  - Real-time referral tracking
- **Membership Packages**
  - Bronze, Silver, Gold, Platinum, Diamond tiers
  - Share allocation per tier
  - Dividend cap percentages
- **Commission Management**
  - Real-time earnings tracking
  - Commission breakdown by tier
  - Historical commission data
  - Payout tracking
- **Dashboard Analytics**
  - Earnings overview
  - Referral charts and statistics
  - Rank progression tracking
  - Performance metrics

### Admin Portal
- **User Management** - View and manage all users
- **Commission Controls** - Approve and manage commissions
- **Analytics Dashboard** - Platform-wide statistics
- **Tier Breakdown** - User distribution across tiers
- **Audit Logging** - Track admin actions and changes
- **Admin Settings**
  - Whitelist management
  - Package configuration
  - Platform settings

### Additional Features
- **Theme Support** - Light/Dark mode toggle
- **Demo Mode** - Test features without real data
- **Profile Settings** - Avatar selection and profile customization
- **Responsive Design** - Mobile-first with bottom navigation
- **Shareholder Portal** - Dedicated section for shareholders
- **Onboarding Flow** - Guided setup for new users

## Technology Stack

### Frontend
- **React 18.3.1** - Modern React with hooks
- **TypeScript 5.8.3** - Type-safe development
- **Vite 5.4.19** - Lightning-fast build tool
- **React Router 6.30.1** - Client-side routing

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components built on Radix UI
- **Lucide React** - Beautiful icon library
- **Recharts** - Composable charting library

### Backend & Data
- **Supabase 2.89.0** - PostgreSQL database + Auth + Real-time
- **TanStack React Query 5.83.0** - Powerful data fetching and caching
- **React Hook Form 7.61.1** - Performant form handling
- **Zod 3.25.76** - Schema validation

### Additional Libraries
- **qrcode.react** - QR code generation for referral links
- **date-fns** - Date manipulation
- **Sonner** - Toast notifications
- **next-themes** - Theme management

## Project Structure

```
u-topia-unified/
├── src/
│   ├── pages/                      # Route pages
│   │   ├── Index.tsx               # Landing page
│   │   ├── Auth.tsx                # Authentication
│   │   ├── Dashboard.tsx           # User dashboard
│   │   ├── Messages.tsx            # Messaging/chat
│   │   ├── Members.tsx             # Member directory
│   │   ├── Files.tsx               # File management
│   │   ├── Purchase.tsx            # Package purchase
│   │   ├── AdminDashboard.tsx      # Admin controls
│   │   └── ...                     # Additional pages
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn-ui components
│   │   ├── layout/                 # Layout components
│   │   ├── dashboard/              # Dashboard components
│   │   ├── admin/                  # Admin components
│   │   ├── community/              # Community features
│   │   ├── Header.tsx              # Navigation header
│   │   ├── BottomNav.tsx           # Mobile navigation
│   │   └── ...                     # Shared components
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── usePackages.ts          # Package data
│   │   ├── useReferrals.ts         # Referral tracking
│   │   ├── useCommissions.ts       # Commission calculations
│   │   ├── useAdmin.ts             # Admin utilities
│   │   └── ...                     # Additional hooks
│   │
│   ├── contexts/                   # React contexts
│   │   └── DemoContext.tsx         # Demo mode state
│   │
│   ├── integrations/
│   │   └── supabase/               # Supabase client & types
│   │
│   ├── lib/                        # Utility functions
│   ├── data/                       # Static data
│   └── assets/                     # Images and media
│
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd u-topia-unified
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Supabase Setup

This project requires a Supabase backend. You'll need to set up the following:

### Database Tables
- `profiles` - User profiles and membership information
- `packages` - Membership tier packages
- `referrals` - Referral tracking
- `commissions` - Commission records
- `messages` - Chat messages
- `files` - Shared files
- Additional tables for admin and analytics

### Authentication
- Enable Email/Password authentication
- Configure redirect URLs
- Set up RLS (Row Level Security) policies

### Storage
- Create buckets for avatars and file uploads
- Configure storage policies

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (optional)

## Key Features Integration

### Community + Affiliate
The unified platform seamlessly integrates:
- Members can access both community features and affiliate tools
- Single authentication system across all features
- Unified user profiles with both community and affiliate data
- Integrated navigation between features

### Role-Based Access
- **Regular Users** - Access to community features and personal dashboard
- **Affiliates** - Access to referral tools and commission tracking
- **Admins** - Full platform control via admin dashboard
- **Shareholders** - Access to shareholder portal

### Navigation Structure
- Public landing page for new visitors
- Dashboard hub after login
- Community section for collaboration
- Affiliate tools for monetization
- Admin panel for platform management

## Contributing

This is a unified project combining two separate U-Topia applications. When contributing:
- Maintain separation of concerns between community and affiliate features
- Follow existing component patterns
- Update types when modifying database schema
- Test across both feature sets

## License

Private - All rights reserved

## Support

For issues or questions, please contact the U-Topia development team.

---

**Built with** ❤️ **by the U-Topia Team**
