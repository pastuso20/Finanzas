-- Run this in the Supabase SQL Editor to enable login functionality
-- This creates the profile table needed for user data

-- Profile table (links auth.users to app data)
create table if not exists public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  user_name text not null default 'User',
  initial_balance numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profile enable row level security;

-- Security policies for profile table
create policy "Users can view own profile"
  on public.profile for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profile for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profile for update
  using (auth.uid() = id);

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for profile table
drop trigger if exists update_profile_updated_at on public.profile;
create trigger update_profile_updated_at
  before update on public.profile
  for each row
  execute function public.handle_updated_at();
