-- CookEdu Supabase bootstrap
-- Run this in Supabase SQL Editor for project lhjdwmkceagdtnexiuek.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(trim(username)) >= 2),
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'premium', 'admin')),
  updated_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 2),
  category text not null check (char_length(trim(category)) >= 2),
  description text,
  steps jsonb not null default '[]'::jsonb,
  min_temp_celsius numeric,
  max_temp_celsius numeric,
  video_url text,
  is_official boolean not null default false,
  created_at timestamptz not null default now(),
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

create index if not exists recipes_user_id_idx on public.recipes(user_id);
create index if not exists recipes_created_at_idx on public.recipes(created_at desc);
create index if not exists comments_recipe_id_idx on public.comments(recipe_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists community_sharing_user_id_idx on public.community_sharing(user_id);
create index if not exists community_sharing_created_at_idx on public.community_sharing(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      split_part(new.email, '@', 1),
      'Koki CookEdu'
    ),
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.comments enable row level security;
alter table public.community_sharing enable row level security;

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable"
  on public.profiles for select
  using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "recipes are publicly readable" on public.recipes;
create policy "recipes are publicly readable"
  on public.recipes for select
  using (true);

drop policy if exists "authenticated users can create recipes" on public.recipes;
create policy "authenticated users can create recipes"
  on public.recipes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "owners can update recipes" on public.recipes;
create policy "owners can update recipes"
  on public.recipes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "owners can delete recipes" on public.recipes;
create policy "owners can delete recipes"
  on public.recipes for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "comments are publicly readable" on public.comments;
create policy "comments are publicly readable"
  on public.comments for select
  using (true);

drop policy if exists "authenticated users can create comments" on public.comments;
create policy "authenticated users can create comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "owners can update comments" on public.comments;
create policy "owners can update comments"
  on public.comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "owners can delete comments" on public.comments;
create policy "owners can delete comments"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "community posts are publicly readable" on public.community_sharing;
create policy "community posts are publicly readable"
  on public.community_sharing for select
  using (true);

drop policy if exists "authenticated users can create community posts" on public.community_sharing;
create policy "authenticated users can create community posts"
  on public.community_sharing for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "owners can update community posts" on public.community_sharing;
create policy "owners can update community posts"
  on public.community_sharing for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "owners can delete community posts" on public.community_sharing;
create policy "owners can delete community posts"
  on public.community_sharing for delete
  to authenticated
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('recipe-media', 'recipe-media', true),
  ('comment-attachments', 'comment-attachments', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public can read avatars" on storage.objects;
create policy "public can read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "users can upload own avatars" on storage.objects;
create policy "users can upload own avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "users can update own avatars" on storage.objects;
create policy "users can update own avatars"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "public can read recipe media" on storage.objects;
create policy "public can read recipe media"
  on storage.objects for select
  using (bucket_id = 'recipe-media');

drop policy if exists "users can upload own recipe media" on storage.objects;
create policy "users can upload own recipe media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'recipe-media' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "public can read comment attachments" on storage.objects;
create policy "public can read comment attachments"
  on storage.objects for select
  using (bucket_id = 'comment-attachments');

drop policy if exists "users can upload own comment attachments" on storage.objects;
create policy "users can upload own comment attachments"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'comment-attachments' and auth.uid()::text = (storage.foldername(name))[1]);
