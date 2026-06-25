-- Run this in the Supabase SQL Editor to set up the complete database schema
-- This script creates all tables, enables RLS, and sets up security policies

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Profile table
create table if not exists public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  user_name text not null default 'User',
  initial_balance numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile enable row level security;

create policy "Users can view own profile"
  on public.profile for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profile for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profile for update
  using (auth.uid() = id);

-- Transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null,
  category text not null,
  date timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Loans table
create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  borrower text not null,
  principal numeric not null,
  interest_rate numeric not null default 0,
  due_date timestamptz not null,
  start_date timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'paid')),
  created_at timestamptz not null default now()
);

alter table public.loans enable row level security;

create policy "Users can view own loans"
  on public.loans for select
  using (auth.uid() = user_id);

create policy "Users can insert own loans"
  on public.loans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own loans"
  on public.loans for update
  using (auth.uid() = user_id);

create policy "Users can delete own loans"
  on public.loans for delete
  using (auth.uid() = user_id);

-- Investments table
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_name text not null,
  description text,
  initial_investment numeric not null,
  product_price_per_unit numeric,
  total_product_quantity numeric default 1,
  current_value numeric not null,
  purchase_date timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.investments enable row level security;

create policy "Users can view own investments"
  on public.investments for select
  using (auth.uid() = user_id);

create policy "Users can insert own investments"
  on public.investments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own investments"
  on public.investments for update
  using (auth.uid() = user_id);

create policy "Users can delete own investments"
  on public.investments for delete
  using (auth.uid() = user_id);

-- Debts table
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  creditor text not null,
  amount numeric not null,
  due_date timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.debts enable row level security;

create policy "Users can view own debts"
  on public.debts for select
  using (auth.uid() = user_id);

create policy "Users can insert own debts"
  on public.debts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own debts"
  on public.debts for update
  using (auth.uid() = user_id);

create policy "Users can delete own debts"
  on public.debts for delete
  using (auth.uid() = user_id);

-- Savings table
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

-- Create indexes for better performance
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_date on public.transactions(date desc);
create index if not exists idx_loans_user_id on public.loans(user_id);
create index if not exists idx_loans_due_date on public.loans(due_date);
create index if not exists idx_investments_user_id on public.investments(user_id);
create index if not exists idx_investments_purchase_date on public.investments(purchase_date desc);
create index if not exists idx_debts_user_id on public.debts(user_id);
create index if not exists idx_debts_due_date on public.debts(due_date);
create index if not exists idx_savings_user_id on public.savings(user_id);
create index if not exists idx_savings_start_date on public.savings(start_date desc);

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
