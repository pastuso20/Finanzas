-- Fix for profile table missing updated_at field
-- Run this in the Supabase SQL Editor

-- Add updated_at column if it doesn't exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'profile' 
    and column_name = 'updated_at'
  ) then
    alter table public.profile add column updated_at timestamptz not null default now();
  end if;
end $$;

-- Recreate the function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop and recreate the trigger for profile table
drop trigger if exists update_profile_updated_at on public.profile;
create trigger update_profile_updated_at
  before update on public.profile
  for each row
  execute function public.handle_updated_at();
