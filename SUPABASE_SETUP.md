# DevScorer AI - Supabase Integration Setup Guide

## Overview
DevScorer AI is now fully integrated with Supabase for authentication and data persistence. The application uses Supabase Auth for user management and real-time database operations.

## ✅ What's Been Set Up

### 1. **Authentication**
- Supabase Auth integration with email/password authentication
- Login page: `/app/login/page.tsx` - Sign in with email and password
- Sign-up page: `/app/register/page.tsx` - Create new accounts
- Logout functionality: Redirects to home page after logout
- Session management via middleware

### 2. **Supabase Files**
- `lib/supabase/client.ts` - Browser client for client-side operations
- `lib/supabase/server.ts` - Server client for API routes
- `lib/supabase/middleware.ts` - Session management
- `middleware.ts` - Route protection and token refresh

### 3. **Dashboard Integration**
- Logout button in sidebar redirects to home page (`/`)
- Theme toggle fully functional (Light/Dark/System modes)
- Ready for real data fetching from Supabase

## 🔧 Required Setup Steps

### Step 1: Configure Environment Variables
Your Supabase project should already be connected. Verify these environment variables are set in your project settings:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous API key

### Step 2: Create Supabase Database Tables
Execute this SQL in your Supabase dashboard (SQL Editor):

```sql
-- Profiles table (auto-created when users sign up)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Allow users to view their own profile
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Analysis Results table
create table if not exists public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_type text not null,
  file_path text,
  score numeric,
  strengths text[],
  improvements text[],
  recommendations text[],
  raw_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.analysis_results enable row level security;

-- Allow users to see only their own analyses
create policy "analysis_select_own" on public.analysis_results for select using (auth.uid() = user_id);
create policy "analysis_insert_own" on public.analysis_results for insert with check (auth.uid() = user_id);
create policy "analysis_update_own" on public.analysis_results for update using (auth.uid() = user_id);
create policy "analysis_delete_own" on public.analysis_results for delete using (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## 📱 Key Features

### Authentication Flow
1. User signs up at `/register` with email and password
2. Supabase creates user account and profile
3. User logs in at `/login`
4. Session is managed via middleware and stored in cookies
5. Logout button (`/components/dashboard/sidebar.tsx`) signs out and redirects to home

### Protected Routes
- `/dashboard` - Requires active session
- All analyzer pages require authentication
- Middleware auto-redirects to login if session expires

### Real-Time Features Ready
- Analysis results can be stored and retrieved in real-time
- User profiles sync across sessions
- Row Level Security protects user data

## 🚀 Next Steps

### 1. Connect Analysis APIs to Database
Update `/app/api/analyze/route.ts` to save results to Supabase:
```typescript
const { data, error } = await supabase
  .from('analysis_results')
  .insert({
    user_id: user.id,
    analysis_type: type,
    score: analysis.score,
    strengths: analysis.strengths,
    improvements: analysis.improvements,
    recommendations: analysis.recommendations,
    raw_data: analysis
  })
```

### 2. Update Dashboard to Load Real Data
Modify `/app/dashboard/page.tsx` to fetch from Supabase:
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: analyses } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
  
  // Use analyses data instead of mock data
}
```

### 3. Update History Page
Connect `/app/dashboard/history/page.tsx` to real data from database

## 🔐 Security Features

- Row Level Security (RLS) on all tables
- Users can only see their own data
- Secure API keys stored in environment variables
- Session tokens auto-refresh via middleware
- No sensitive data in browser

## 📞 Support

For Supabase documentation: https://supabase.com/docs
For Next.js Supabase integration: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
