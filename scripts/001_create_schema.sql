-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table public.profiles enable row level security;

-- Policies for profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Create analysis_results table
create table if not exists public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_type text not null check (analysis_type in ('resume', 'linkedin', 'github')),
  score integer not null check (score >= 0 and score <= 100),
  file_name text,
  input_data text,
  results jsonb not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table public.analysis_results enable row level security;

-- Policies for analysis_results
create policy "analysis_select_own" on public.analysis_results for select using (auth.uid() = user_id);
create policy "analysis_insert_own" on public.analysis_results for insert with check (auth.uid() = user_id);
create policy "analysis_update_own" on public.analysis_results for update using (auth.uid() = user_id);
create policy "analysis_delete_own" on public.analysis_results for delete using (auth.uid() = user_id);

-- Create indexes
create index if not exists analysis_results_user_id_idx on public.analysis_results(user_id);
create index if not exists analysis_results_created_at_idx on public.analysis_results(created_at desc);
create index if not exists analysis_results_type_idx on public.analysis_results(analysis_type);
