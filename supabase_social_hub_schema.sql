-- CookEdu Culinary Social Hub schema
-- Project: lhjdwmkceagdtnexiuek
-- Run this whole file in Supabase SQL Editor after supabase_schema.sql.
-- Safe to re-run: creates missing objects, refreshes policies, and reloads PostgREST.

create extension if not exists "pgcrypto";

begin;

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 2),
  category text not null check (
    category in (
      'Cooking Technique',
      'Plating Art',
      'Baking Science',
      'Kitchen Hacks',
      'Recipe Story',
      'Ingredient Guide'
    )
  ),
  description text not null check (char_length(trim(description)) >= 1),
  media_path text not null check (char_length(trim(media_path)) >= 3),
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.social_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null,
  item_type text not null check (item_type in ('recipe', 'post')),
  created_at timestamptz not null default now(),
  unique (user_id, item_id, item_type)
);

create table if not exists public.social_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.social_comments(id) on delete cascade,
  content text not null check (char_length(trim(content)) >= 1),
  attachment_path text,
  created_at timestamptz not null default now()
);

create index if not exists social_posts_user_id_idx on public.social_posts(user_id);
create index if not exists social_posts_category_idx on public.social_posts(category);
create index if not exists social_posts_created_at_idx on public.social_posts(created_at desc);
create index if not exists likes_post_id_idx on public.likes(post_id);
create index if not exists likes_user_id_idx on public.likes(user_id);
create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists favorites_item_lookup_idx on public.favorites(item_type, item_id);
create index if not exists social_comments_post_id_idx on public.social_comments(post_id);
create index if not exists social_comments_parent_id_idx on public.social_comments(parent_id);
create index if not exists social_comments_created_at_idx on public.social_comments(created_at);

alter table public.social_posts enable row level security;
alter table public.likes enable row level security;
alter table public.favorites enable row level security;
alter table public.social_comments enable row level security;

drop policy if exists "social posts are publicly readable" on public.social_posts;
create policy "social posts are publicly readable"
  on public.social_posts for select
  to anon, authenticated
  using (true);

drop policy if exists "authenticated users can create social posts" on public.social_posts;
create policy "authenticated users can create social posts"
  on public.social_posts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "owners can update social posts" on public.social_posts;
create policy "owners can update social posts"
  on public.social_posts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owners can delete social posts" on public.social_posts;
create policy "owners can delete social posts"
  on public.social_posts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "likes are publicly readable" on public.likes;
create policy "likes are publicly readable"
  on public.likes for select
  to anon, authenticated
  using (true);

drop policy if exists "authenticated users can create own likes" on public.likes;
create policy "authenticated users can create own likes"
  on public.likes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "owners can delete own likes" on public.likes;
create policy "owners can delete own likes"
  on public.likes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "favorites are publicly readable" on public.favorites;
create policy "favorites are publicly readable"
  on public.favorites for select
  to anon, authenticated
  using (true);

drop policy if exists "authenticated users can create own favorites" on public.favorites;
create policy "authenticated users can create own favorites"
  on public.favorites for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "owners can delete own favorites" on public.favorites;
create policy "owners can delete own favorites"
  on public.favorites for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "social comments are publicly readable" on public.social_comments;
create policy "social comments are publicly readable"
  on public.social_comments for select
  to anon, authenticated
  using (true);

drop policy if exists "authenticated users can create social comments" on public.social_comments;
create policy "authenticated users can create social comments"
  on public.social_comments for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "owners can update social comments" on public.social_comments;
create policy "owners can update social comments"
  on public.social_comments for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "owners can delete social comments" on public.social_comments;
create policy "owners can delete social comments"
  on public.social_comments for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.social_posts, public.likes, public.favorites, public.social_comments to anon, authenticated;
grant insert, update, delete on public.social_posts, public.likes, public.favorites, public.social_comments to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'social-media-assets',
  'social-media-assets',
  true,
  104857600,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "social media assets are publicly readable" on storage.objects;
create policy "social media assets are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'social-media-assets');

drop policy if exists "authenticated users can upload own social media assets" on storage.objects;
create policy "authenticated users can upload own social media assets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'social-media-assets'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

drop policy if exists "owners can update own social media assets" on storage.objects;
create policy "owners can update own social media assets"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'social-media-assets'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'social-media-assets'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

drop policy if exists "owners can delete own social media assets" on storage.objects;
create policy "owners can delete own social media assets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'social-media-assets'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

do $$
begin
  begin
    alter publication supabase_realtime add table public.social_posts;
  exception when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.likes;
  exception when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.favorites;
  exception when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.social_comments;
  exception when duplicate_object then null;
  end;
end $$;

select pg_notification_queue_usage();
notify pgrst, 'reload schema';

commit;
