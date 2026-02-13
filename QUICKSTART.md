# Quick Start Guide

Get your U-Topia Unified platform up and running in minutes!

## Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- A Supabase account (free tier works fine)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd u-topia-unified
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

To get these values:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Go to Project Settings → API
4. Copy the Project URL and anon/public key

### 3. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 4. First Login

1. Visit `http://localhost:5173`
2. Click "Sign Up" or navigate to `/auth`
3. Create a new account
4. You'll be redirected to the dashboard

## Project Structure at a Glance

```
u-topia-unified/
├── src/
│   ├── pages/           # All page components
│   ├── components/      # Reusable components
│   │   ├── ui/         # Base UI components
│   │   ├── admin/      # Admin features
│   │   ├── dashboard/  # Dashboard widgets
│   │   └── community/  # Community features
│   ├── hooks/          # Custom React hooks
│   └── integrations/   # Supabase & external services
└── [config files]
```

## Key Features & Routes

### Public Pages
- `/` - Landing page
- `/auth` - Login/Sign up
- `/refer-and-earn` - Referral program info

### After Login
- `/dashboard` - Your affiliate dashboard
- `/members` - Community member directory
- `/messages` - Real-time chat
- `/files` - File sharing
- `/profile` - Your profile settings

### Admin Only
- `/admin` - Admin dashboard
- `/admin/users/:id` - Manage users

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Building
npm run build        # Production build
npm run build:dev    # Development build

# Quality
npm run lint         # Run linter
npm run preview      # Preview production build
```

## Troubleshooting

### Build Errors

**Issue**: Module not found errors

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues

**Issue**: Can't connect to Supabase

**Solution**:
1. Verify your `.env` file exists
2. Check the credentials are correct
3. Ensure your Supabase project is active
4. Restart the dev server

### TypeScript Errors

**Issue**: Type errors during development

**Solution**:
```bash
# Regenerate types from Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

## Next Steps

1. ✅ **Configure Supabase Database**
   - Set up required tables (profiles, packages, referrals, etc.)
   - Configure Row Level Security policies
   - Set up storage buckets

2. ✅ **Customize Branding**
   - Replace logos in `src/assets/`
   - Update colors in `tailwind.config.ts`
   - Modify landing page content

3. ✅ **Test Features**
   - Try the referral system
   - Send messages in chat
   - Upload files
   - Test admin features (if admin)

## Need Help?

- 📖 Read [README.md](./README.md) for full documentation
- 🏗️ Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- 📋 See [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) for what was combined

## Development Tips

### Hot Module Replacement (HMR)
Changes to your code will automatically refresh the browser.

### Dark Mode
The app supports dark mode! Toggle it from the theme switcher (on community pages).

### Demo Mode
Some features support demo mode for testing without real data.

### Mobile Testing
The app is fully responsive. Test on mobile using:
```bash
npm run dev -- --host
```
Then access from your phone using your computer's IP.

## Production Deployment

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` directory.

### Deployment Options

**Vercel** (Recommended):
```bash
npm i -g vercel
vercel
```

**Netlify**:
```bash
npm i -g netlify-cli
netlify deploy
```

**Other Hosting**:
Upload the `dist/` folder to any static hosting service.

### Environment Variables in Production

Don't forget to set environment variables in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

**Ready to build something amazing!** 🚀
