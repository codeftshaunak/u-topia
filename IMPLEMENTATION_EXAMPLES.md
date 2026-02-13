# Implementation Examples: Replacing Supabase Calls

This document provides concrete examples of how to replace Supabase calls with the new custom backend API.

## Table of Contents
- [Authentication](#authentication)
- [Protected Routes](#protected-routes)
- [Database Queries](#database-queries)
- [Real-time Subscriptions](#real-time-subscriptions)
- [File Uploads](#file-uploads)

## Authentication

### Sign Up

**Old (Supabase):**
```typescript
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.auth.signUp({
  email: formData.email.trim().toLowerCase(),
  password: formData.password,
  options: {
    emailRedirectTo: redirectUrl,
    data: {
      full_name: formData.name.trim(),
      mobile: formData.mobile.trim(),
    },
  },
});

if (error) {
  console.error("Sign up error:", error);
  return;
}

if (data.user) {
  console.log("User created:", data.user);
}
```

**New (Custom API):**
```typescript
import { useAuth } from "@/contexts/AuthContext";

const { signUp } = useAuth();

try {
  await signUp(
    formData.email.trim().toLowerCase(),
    formData.password,
    formData.name.trim(),
    formData.mobile.trim()
  );

  // User is automatically set in context
  toast({
    title: "Welcome!",
    description: "Your account has been created successfully.",
  });
} catch (error) {
  toast({
    title: "Sign Up Failed",
    description: error.message,
    variant: "destructive",
  });
}
```

### Sign In

**Old (Supabase):**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: formData.email.trim().toLowerCase(),
  password: formData.password,
});

if (error) {
  console.error("Sign in error:", error);
  return;
}
```

**New (Custom API):**
```typescript
import { useAuth } from "@/contexts/AuthContext";

const { signIn } = useAuth();

try {
  await signIn(
    formData.email.trim().toLowerCase(),
    formData.password
  );

  toast({
    title: "Welcome Back!",
    description: "You have signed in successfully.",
  });
} catch (error) {
  toast({
    title: "Sign In Failed",
    description: error.message,
    variant: "destructive",
  });
}
```

### Sign Out

**Old (Supabase):**
```typescript
await supabase.auth.signOut();
```

**New (Custom API):**
```typescript
import { useAuth } from "@/contexts/AuthContext";

const { signOut } = useAuth();

await signOut(); // Automatically redirects to /auth
```

### Get Current User

**Old (Supabase):**
```typescript
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user;
```

**New (Custom API):**
```typescript
import { useAuth } from "@/contexts/AuthContext";

const { user } = useAuth();
// user is available directly from context
```

### Password Reset

**Old (Supabase):**
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  formData.email.trim().toLowerCase(),
  {
    redirectTo: `${window.location.origin}/reset-password`,
  }
);
```

**New (Custom API):**
```typescript
import { useAuth } from "@/contexts/AuthContext";

const { resetPassword } = useAuth();

try {
  await resetPassword(formData.email.trim().toLowerCase());
  toast({
    title: "Check Your Email",
    description: "If an account exists, we've sent a reset link.",
  });
} catch (error) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive",
  });
}
```

## Protected Routes

**Old (Supabase):**
```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
```

**New (Custom API):**
```typescript
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
```

## Database Queries

### Fetch Referrals

**Old (Supabase):**
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data: session } = await supabase.auth.getSession();
const userId = session.session.user.id;

const { data: referralData, error } = await supabase
  .from('referrals')
  .select(`
    id,
    referred_user_id,
    status,
    created_at,
    verified_at
  `)
  .eq('referrer_user_id', userId)
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error fetching referrals:', error);
  return;
}
```

**New (Custom API):**
```typescript
const response = await fetch('/api/referrals');
const { referrals, stats } = await response.json();

// Or use the hook:
import { useReferrals } from '@/hooks/useReferrals-new';

const { referrals, stats, isLoading, error } = useReferrals();
```

### Fetch Admin Status

**Old (Supabase):**
```typescript
const { data, error } = await supabase
  .from('admin_whitelist')
  .select('id')
  .eq('email', session.user.email)
  .eq('is_active', true)
  .maybeSingle();

const isAdmin = !!data;
```

**New (Custom API):**
```typescript
const response = await fetch('/api/admin/check');
const { isAdmin, email } = await response.json();

// Or use the hook:
import { useAdmin } from '@/hooks/useAdmin-new';

const { isAdmin, isLoading } = useAdmin();
```

### Fetch Packages

**Old (Supabase):**
```typescript
const { data, error } = await supabase
  .from('packages')
  .select('*')
  .eq('is_active', true)
  .order('price_usd', { ascending: true });
```

**New (Custom API):**
```typescript
const response = await fetch('/api/packages');
const { packages } = await response.json();

// Or use the hook:
import { usePackages } from '@/hooks/usePackages-new';

const { packages, isLoading, error } = usePackages();
```

### Update Profile

**Old (Supabase):**
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: formData.fullName,
    avatar_url: formData.avatarUrl,
  })
  .eq('user_id', userId);
```

**New (Custom API):**
```typescript
const response = await fetch('/api/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: formData.fullName,
    avatarUrl: formData.avatarUrl,
  }),
});

const { profile } = await response.json();
```

## Real-time Subscriptions

### Subscribe to Table Changes

**Old (Supabase):**
```typescript
import { supabase } from '@/integrations/supabase/client';

const channel = supabase
  .channel('referrals-realtime')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'referrals' },
    (payload) => {
      console.log('Change received:', payload);
      fetchReferrals(); // Refetch data
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

**New (Socket.io):**
```typescript
import { subscribeToTable, unsubscribeFromTable } from '@/lib/socket-client';

useEffect(() => {
  subscribeToTable('referrals', (data) => {
    console.log('Change received:', data);
    fetchReferrals(); // Refetch data
  });

  return () => {
    unsubscribeFromTable('referrals');
  };
}, []);
```

### Multiple Table Subscriptions

**Old (Supabase):**
```typescript
const channel = supabase
  .channel('data-updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' },
    () => fetchReferrals()
  )
  .on('postgres_changes', { event: '*', schema: 'public', table: 'commission_ledger' },
    () => fetchReferrals()
  )
  .on('postgres_changes', { event: '*', schema: 'public', table: 'purchases' },
    () => fetchReferrals()
  )
  .subscribe();
```

**New (Socket.io):**
```typescript
useEffect(() => {
  const handleUpdate = () => fetchReferrals();

  subscribeToTable('referrals', handleUpdate);
  subscribeToTable('commission_ledger', handleUpdate);
  subscribeToTable('purchases', handleUpdate);

  return () => {
    unsubscribeFromTable('referrals');
    unsubscribeFromTable('commission_ledger');
    unsubscribeFromTable('purchases');
  };
}, []);
```

## Edge Functions / Server Functions

### Use Referral Code

**Old (Supabase Edge Function):**
```typescript
const { data, error } = await supabase.functions.invoke("referral-link", {
  body: {
    action: "use",
    code: referralCode,
    email: formData.email.trim().toLowerCase(),
  },
});
```

**New (API Route):**
```typescript
const response = await fetch('/api/referrals/use-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: referralCode,
    email: formData.email.trim().toLowerCase(),
  }),
});

const data = await response.json();

if (!response.ok) {
  console.error('Error:', data.error);
}
```

### Generate Referral Code

**Old (Supabase RPC):**
```typescript
const { data, error } = await supabase.rpc('generate_referral_code');
```

**New (API Route):**
```typescript
const response = await fetch('/api/referrals/link', {
  method: 'POST',
});

const { code } = await response.json();
```

## Complete Component Example

Here's a complete example showing migration of the Auth component:

**Old (Supabase):**
```typescript
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }

    navigate("/dashboard");
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**New (Custom API):**
```typescript
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signIn(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      toast({ title: "Error", description: error.message });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Key Differences Summary

| Feature | Supabase | Custom Backend |
|---------|----------|----------------|
| Auth Context | `supabase.auth` | `useAuth()` hook |
| Database Queries | `supabase.from()` | `fetch('/api/...')` |
| Real-time | `supabase.channel()` | `subscribeToTable()` |
| Edge Functions | `supabase.functions.invoke()` | `fetch('/api/...')` |
| Session Management | `getSession()` | `useAuth().user` |

## Migration Checklist

- [ ] Replace all `import { supabase }` with appropriate hooks/functions
- [ ] Update authentication flows to use `useAuth()`
- [ ] Convert database queries to API calls
- [ ] Replace real-time subscriptions with Socket.io
- [ ] Update environment variables
- [ ] Test all features thoroughly
- [ ] Remove Supabase dependencies
