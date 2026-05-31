-- CookEdu Supabase recipe admin policy hotfix
-- Run this in Supabase SQL Editor so admin users can manage all recipes.

alter table public.recipes enable row level security;

drop policy if exists "recipes are publicly readable" on public.recipes;
create policy "recipes are publicly readable"
  on public.recipes for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "admins can read all recipes" on public.recipes;
create policy "admins can read all recipes"
  on public.recipes for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
    )
  );

drop policy if exists "authenticated users can create recipes" on public.recipes;
create policy "authenticated users can create recipes"
  on public.recipes for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      coalesce(is_official, false) = false
      or exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid())
        and profiles.role = 'admin'
      )
    )
  );

drop policy if exists "owners can update recipes" on public.recipes;
create policy "owners can update recipes"
  on public.recipes for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
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
    or (
      (select auth.uid()) = user_id
      and coalesce(is_official, false) = false
    )
  );

drop policy if exists "owners can delete recipes" on public.recipes;
create policy "owners can delete recipes"
  on public.recipes for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
    )
  );

grant select on public.recipes to anon, authenticated;
grant insert, update, delete on public.recipes to authenticated;

select pg_notification_queue_usage();
notify pgrst, 'reload schema';
