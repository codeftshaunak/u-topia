# Supabase CORS Configuration Fix

## Issue
Your Supabase Edge Functions are returning CORS errors because they're configured to only allow requests from:
- `https://jhrsmjlvzfzdfbdfhwss.lovableproject.com`

But your Next.js app is running on:
- `http://localhost:3001`

## Solution

You need to update your Supabase Edge Functions to allow localhost origins. Here's how:

### Option 1: Update Edge Function CORS Headers

For each Edge Function (like `referral-link`), update the CORS headers to include localhost:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for development
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In your Edge Function handler:
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Your function logic here

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
```

### Option 2: Environment-Based CORS (Recommended for Production)

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://jhrsmjlvzfzdfbdfhwss.lovableproject.com',
  'https://yourdomain.com', // Add your production domain
]

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
})

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  // Your function logic...
})
```

### Affected Edge Functions

Based on the errors, you need to update these Edge Functions:
1. `referral-link` - Located in `supabase/functions/referral-link/`

## Quick Fix for Development

If you want to quickly test, you can temporarily set CORS to allow all origins:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**Note**: For production, use environment-based CORS with specific allowed origins for security.

## How to Deploy Edge Function Updates

```bash
# Navigate to your Supabase project
cd path/to/your/supabase/project

# Deploy the updated function
supabase functions deploy referral-link

# Or deploy all functions
supabase functions deploy
```
