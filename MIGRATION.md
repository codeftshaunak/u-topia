# Migration to Next.js

This project has been successfully migrated from Vite + React to Next.js 15 with pnpm.

## What Changed

### Build Tool & Framework
- **From**: Vite + React SPA
- **To**: Next.js 15 (App Router) with React 18
- **Package Manager**: Now using pnpm instead of npm

### Key Configuration Changes

1. **Package.json**
   - Updated scripts to use Next.js commands (`next dev`, `next build`, `next start`)
   - Added Next.js dependencies
   - Kept react-router-dom for client-side routing within the app

2. **TypeScript Configuration**
   - Updated to Next.js-compatible tsconfig.json
   - Added Next.js plugin
   - Maintained path aliases (`@/*`)

3. **Environment Variables**
   - Changed from `VITE_*` prefix to `NEXT_PUBLIC_*` prefix
   - Updated `.env.local` with new variable names
   - Updated Supabase client to use new environment variables

4. **Project Structure**
   - Added `src/app/` directory for Next.js App Router
   - Created `layout.tsx` for root layout and metadata
   - Created `providers.tsx` for client-side providers
   - Created `AppRouter.tsx` to maintain existing React Router structure

5. **Removed Files**
   - `vite.config.ts`
   - `index.html`

6. **New Files**
   - `next.config.mjs` - Next.js configuration
   - `src/app/layout.tsx` - Root layout
   - `src/app/providers.tsx` - Client providers
   - `src/app/page.tsx` - Home page
   - `src/components/AppRouter.tsx` - Router wrapper
   - `.env.local` - Local environment variables

## Running the Application

### Development
```bash
pnpm dev
```

The app will be available at http://localhost:3000

### Build
```bash
pnpm build
```

### Production
```bash
pnpm start
```

## Environment Variables

Make sure to update your `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Notes

- All existing React components remain unchanged
- React Router is still used for client-side routing
- The migration maintains backward compatibility with existing code
- All UI components and pages work as before
- Supabase integration continues to function normally

## Deployment

When deploying to production:
1. Set environment variables on your hosting platform
2. Run `pnpm build` to create an optimized production build
3. Deploy the generated `.next` folder

For Vercel (recommended for Next.js):
- Connect your repository
- Vercel will automatically detect Next.js
- Add environment variables in project settings
