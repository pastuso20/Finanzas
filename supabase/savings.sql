-- Run this in the Supabase SQL Editor to enable the Savings section

create table if not exists public.savings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  current_amount numeric not null default 0,
  goal_amount numeric not null default 0,
  start_date timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.savings enable row level security;

create policy "Users can view own savings"
  on public.savings for select
  using (auth.uid() = user_id);

create policy "Users can insert own savings"
  on public.savings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own savings"
  on public.savings for update
  using (auth.uid() = user_id);

create policy "Users can delete own savings"
  on public.savings for delete
  using (auth.uid() = user_id);
