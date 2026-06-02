-- CookEdu wallet extension schema.
-- Run this in Supabase SQL Editor after the base wallet tables exist.
-- This does not modify the production recipes table.

create extension if not exists pgcrypto;

create table if not exists public.user_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coin_balance integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.coin_purchases (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  coin_amount integer not null default 0,
  gross_amount integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('pending', 'settlement', 'expire', 'cancel', 'deny', 'failure'))
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount <> 0),
  transaction_type text not null check (
    transaction_type in ('purchase', 'admin_gift', 'daily_reward', 'spend', 'refund', 'adjustment')
  ),
  description text not null default '',
  reference_type text,
  reference_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('give_coins', 'spend_adjustment', 'refund', 'manual_adjustment')),
  amount integer not null default 0,
  reason text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_wallets_user_id_idx
on public.user_wallets(user_id);

create index if not exists coin_purchases_user_id_idx
on public.coin_purchases(user_id);

create index if not exists coin_purchases_order_id_idx
on public.coin_purchases(order_id);

create index if not exists wallet_transactions_user_created_idx
on public.wallet_transactions(user_id, created_at desc);

create index if not exists wallet_transactions_type_idx
on public.wallet_transactions(transaction_type);

create unique index if not exists wallet_transactions_daily_reward_once_idx
on public.wallet_transactions(user_id, reference_type, reference_id)
where transaction_type = 'daily_reward';

create index if not exists wallet_admin_audit_logs_created_idx
on public.wallet_admin_audit_logs(created_at desc);

create index if not exists wallet_admin_audit_logs_target_idx
on public.wallet_admin_audit_logs(target_user_id, created_at desc);

alter table public.user_wallets enable row level security;
alter table public.coin_purchases enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.wallet_admin_audit_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_wallets'
      and policyname = 'users can view own wallet'
  ) then
    create policy "users can view own wallet"
    on public.user_wallets
    for select
    to authenticated
    using ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'coin_purchases'
      and policyname = 'users can view own coin purchases'
  ) then
    create policy "users can view own coin purchases"
    on public.coin_purchases
    for select
    to authenticated
    using ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'wallet_transactions'
      and policyname = 'users can view own wallet transactions'
  ) then
    create policy "users can view own wallet transactions"
    on public.wallet_transactions
    for select
    to authenticated
    using (
      (select auth.uid()) = user_id
      or exists (
        select 1
        from public.profiles p
        where p.id = (select auth.uid())
          and p.role = 'admin'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'wallet_admin_audit_logs'
      and policyname = 'admins can view wallet audit logs'
  ) then
    create policy "admins can view wallet audit logs"
    on public.wallet_admin_audit_logs
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.profiles p
        where p.id = (select auth.uid())
          and p.role = 'admin'
      )
    );
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'user_wallets'
     ) then
    alter publication supabase_realtime add table public.user_wallets;
  end if;
end $$;

notify pgrst, 'reload schema';
