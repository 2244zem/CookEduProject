-- CookEdu Supabase signup fix
-- Project: lhjdwmkceagdtnexiuek
-- Run this whole file in Supabase SQL Editor when /auth/v1/signup returns:
-- "Database error saving new user".

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null default 'Koki CookEdu',
  phone text,
  avatar_url text,
  role text not null default 'user',
  xp integer not null default 0,
  preferences jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists xp integer not null default 0;
alter table public.profiles add column if not exists preferences jsonb;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Usernames are display names, so they must not block signup when duplicated.
do $$
declare
  constraint_name text;
  index_name text;
begin
  for constraint_name in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'profiles'
      and c.contype = 'u'
      and pg_get_constraintdef(c.oid) ilike '%(username)%'
  loop
    execute format('alter table public.profiles drop constraint if exists %I', constraint_name);
  end loop;

  for index_name in
    select i.relname
    from pg_index x
    join pg_class i on i.oid = x.indexrelid
    join pg_class t on t.oid = x.indrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'profiles'
      and x.indisunique
      and not x.indisprimary
      and (
        select array_agg(a.attname::text order by k.ord)
        from unnest(x.indkey) with ordinality as k(attnum, ord)
        join pg_attribute a on a.attrelid = t.oid and a.attnum = k.attnum
      ) = array['username']
  loop
    execute format('drop index if exists public.%I', index_name);
  end loop;
end $$;

update public.profiles
set username = 'Koki ' || substr(id::text, 1, 8)
where username is null or char_length(trim(username)) < 2;

create or replace function public.cookedu_safe_username(raw_name text, raw_email text, fallback_id uuid)
returns text
language sql
stable
set search_path = ''
as $$
  with candidate as (
    select left(
      coalesce(
        nullif(trim(raw_name), ''),
        nullif(split_part(coalesce(raw_email, ''), '@', 1), ''),
        'koki-' || substr(fallback_id::text, 1, 8)
      ),
      80
    ) as value
  )
  select case
    when char_length(trim(value)) >= 2 then value
    else 'koki-' || substr(fallback_id::text, 1, 8)
  end
  from candidate;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, phone, avatar_url, role)
  values (
    new.id,
    public.cookedu_safe_username(
      coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name'),
      new.email,
      new.id
    ),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    'user'
  )
  on conflict (id) do update set
    username = excluded.username,
    phone = coalesce(excluded.phone, public.profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    role = public.profiles.role,
    updated_at = now();

  return new;
exception
  when others then
    raise warning 'CookEdu handle_new_user failed for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

do $$
begin
  grant usage on schema public to supabase_auth_admin;
  grant select, insert, update on public.profiles to supabase_auth_admin;
  grant execute on function public.handle_new_user() to supabase_auth_admin;
exception
  when undefined_object then
    null;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.cookedu_guard_profile_role()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_role in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.role := 'user';
    elsif tg_op = 'UPDATE' then
      new.role := old.role;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists cookedu_guard_profile_role on public.profiles;
create trigger cookedu_guard_profile_role
  before insert or update on public.profiles
  for each row execute function public.cookedu_guard_profile_role();

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

select pg_notification_queue_usage();
notify pgrst, 'reload schema';
