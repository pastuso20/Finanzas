-- Run this in the Supabase SQL Editor to update the Investments table

alter table public.investments
  add column if not exists product_price_per_unit numeric,
  add column if not exists total_product_quantity numeric default 1;

-- Backfill existing rows
update public.investments
set
  product_price_per_unit = coalesce(product_price_per_unit, current_value),
  total_product_quantity = coalesce(total_product_quantity, 1)
where product_price_per_unit is null or total_product_quantity is null;

alter table public.investments
  add column if not exists status text not null default 'active';

update public.investments
set status = 'active'
where status is null;
