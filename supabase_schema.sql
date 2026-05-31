-- CookEdu Supabase schema reset/upgrade
-- Project: lhjdwmkceagdtnexiuek
-- Run the whole file in Supabase SQL Editor.
-- Safe to re-run: it creates missing tables, adds missing columns, refreshes RLS,
-- enables public storage buckets, and reloads the PostgREST schema cache.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(trim(username)) >= 2),
  phone text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'premium', 'admin')),
  xp integer not null default 0 check (xp >= 0),
  preferences jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) >= 2),
  slug text unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 2),
  category text not null check (char_length(trim(category)) >= 2),
  category_id uuid references public.categories(id) on delete set null,
  description text,
  image_url text,
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  cooking_time integer not null default 25 check (cooking_time >= 1),
  prep_time integer not null default 0 check (prep_time >= 0),
  servings integer not null default 1 check (servings >= 1),
  nutritional_info jsonb,
  min_temp_celsius numeric,
  max_temp_celsius numeric,
  video_url text,
  is_official boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recipes_temp_range check (
    min_temp_celsius is null
    or max_temp_celsius is null
    or min_temp_celsius <= max_temp_celsius
  )
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) >= 1),
  comment_photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.community_sharing (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 2),
  content text not null check (char_length(trim(content)) >= 1),
  media_url text,
  post_type text not null default 'sharing' check (post_type in ('sharing', 'tips_trick')),
  upvotes integer not null default 0 check (upvotes >= 0),
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists xp integer not null default 0 check (xp >= 0);
alter table public.profiles add column if not exists preferences jsonb;

alter table public.recipes add column if not exists category_id uuid references public.categories(id) on delete set null;
alter table public.recipes add column if not exists image_url text;
alter table public.recipes add column if not exists difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced'));
alter table public.recipes add column if not exists ingredients jsonb not null default '[]'::jsonb;
alter table public.recipes add column if not exists cooking_time integer not null default 25 check (cooking_time >= 1);
alter table public.recipes add column if not exists prep_time integer not null default 0 check (prep_time >= 0);
alter table public.recipes add column if not exists servings integer not null default 1 check (servings >= 1);
alter table public.recipes add column if not exists nutritional_info jsonb;
alter table public.recipes add column if not exists is_published boolean not null default true;
alter table public.recipes add column if not exists updated_at timestamptz not null default now();

update public.recipes set is_published = true where is_published is null;
update public.recipes set difficulty = 'beginner' where difficulty is null;
update public.recipes set ingredients = '[]'::jsonb where ingredients is null;
update public.recipes set steps = '[]'::jsonb where steps is null;
update public.recipes set cooking_time = 25 where cooking_time is null;
update public.recipes set prep_time = 0 where prep_time is null;
update public.recipes set servings = 1 where servings is null;

insert into public.categories (name, slug, description)
values
  ('Indonesian', 'indonesian', 'Masakan Nusantara dan makanan rumahan Indonesia'),
  ('Dessert', 'dessert', 'Hidangan manis, minuman, dan dessert segar'),
  ('Healthy', 'healthy', 'Menu sehat dan ringan untuk harian'),
  ('Community', 'community', 'Resep kiriman komunitas CookEdu')
on conflict (name) do update set
  slug = excluded.slug,
  description = excluded.description;

create index if not exists recipes_user_id_idx on public.recipes(user_id);
create index if not exists recipes_category_id_idx on public.recipes(category_id);
create index if not exists recipes_difficulty_idx on public.recipes(difficulty);
create index if not exists recipes_cooking_time_idx on public.recipes(cooking_time);
create index if not exists recipes_is_published_idx on public.recipes(is_published);
create index if not exists recipes_created_at_idx on public.recipes(created_at desc);
create index if not exists recipes_ingredients_gin_idx on public.recipes using gin (ingredients);
create index if not exists comments_recipe_id_idx on public.comments(recipe_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists community_sharing_user_id_idx on public.community_sharing(user_id);
create index if not exists community_sharing_created_at_idx on public.community_sharing(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, phone, avatar_url, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      split_part(new.email, '@', 1),
      'Koki CookEdu'
    ),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'user')
  )
  on conflict (id) do update set
    username = excluded.username,
    phone = coalesce(excluded.phone, public.profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.recipes enable row level security;
alter table public.comments enable row level security;
alter table public.community_sharing enable row level security;

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

drop policy if exists "categories are publicly readable" on public.categories;
create policy "categories are publicly readable"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "admins can manage categories" on public.categories;
create policy "admins can manage categories"
  on public.categories for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
    )
  );

drop policy if exists "recipes are publicly readable" on public.recipes;
create policy "recipes are publicly readable"
  on public.recipes for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "authenticated users can create recipes" on public.recipes;
create policy "authenticated users can create recipes"
  on public.recipes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "owners can update recipes" on public.recipes;
create policy "owners can update recipes"
  on public.recipes for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owners can delete recipes" on public.recipes;
create policy "owners can delete recipes"
  on public.recipes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "comments are publicly readable" on public.comments;
create policy "comments are publicly readable"
  on public.comments for select
  to anon, authenticated
  using (true);

drop policy if exists "authenticated users can create comments" on public.comments;
create policy "authenticated users can create comments"
  on public.comments for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "owners can update comments" on public.comments;
create policy "owners can update comments"
  on public.comments for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owners can delete comments" on public.comments;
create policy "owners can delete comments"
  on public.comments for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "community posts are publicly readable" on public.community_sharing;
create policy "community posts are publicly readable"
  on public.community_sharing for select
  to anon, authenticated
  using (true);

drop policy if exists "authenticated users can create community posts" on public.community_sharing;
create policy "authenticated users can create community posts"
  on public.community_sharing for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "owners can update community posts" on public.community_sharing;
create policy "owners can update community posts"
  on public.community_sharing for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owners can delete community posts" on public.community_sharing;
create policy "owners can delete community posts"
  on public.community_sharing for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.categories, public.recipes, public.comments, public.community_sharing to anon, authenticated;
grant insert, update, delete on public.profiles, public.categories, public.recipes, public.comments, public.community_sharing to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.categories;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.recipes;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.comments;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.community_sharing;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('recipe-media', 'recipe-media', true),
  ('comment-attachments', 'comment-attachments', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public can read avatars" on storage.objects;
create policy "public can read avatars"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists "users can upload own avatars" on storage.objects;
create policy "users can upload own avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

drop policy if exists "users can update own avatars" on storage.objects;
create policy "users can update own avatars"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1])
  with check (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

drop policy if exists "public can read recipe media" on storage.objects;
create policy "public can read recipe media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'recipe-media');

drop policy if exists "users can upload own recipe media" on storage.objects;
create policy "users can upload own recipe media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'recipe-media' and (select auth.uid())::text = (storage.foldername(name))[1]);

drop policy if exists "users can update own recipe media" on storage.objects;
create policy "users can update own recipe media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'recipe-media' and (select auth.uid())::text = (storage.foldername(name))[1])
  with check (bucket_id = 'recipe-media' and (select auth.uid())::text = (storage.foldername(name))[1]);

drop policy if exists "public can read comment attachments" on storage.objects;
create policy "public can read comment attachments"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'comment-attachments');

drop policy if exists "users can upload own comment attachments" on storage.objects;
create policy "users can upload own comment attachments"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'comment-attachments' and (select auth.uid())::text = (storage.foldername(name))[1]);

drop policy if exists "users can update own comment attachments" on storage.objects;
create policy "users can update own comment attachments"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'comment-attachments' and (select auth.uid())::text = (storage.foldername(name))[1])
  with check (bucket_id = 'comment-attachments' and (select auth.uid())::text = (storage.foldername(name))[1]);

-- Force Supabase/PostgREST to see newly added columns immediately.
select pg_notification_queue_usage();
notify pgrst, 'reload schema';
