create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  handle text,
  bio text,
  area text,
  favorite_food text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists handle text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists area text;
alter table public.profiles add column if not exists favorite_food text;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  image_path text not null,
  image_url text not null,
  shop_name text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_boosts (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 280),
  created_at timestamptz not null default now()
);

create table if not exists public.post_reports (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_boosts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_reports enable row level security;

drop policy if exists "profiles visible" on public.profiles;
create policy "profiles visible"
on public.profiles for select
using (true);

drop policy if exists "users create own profile" on public.profiles;
create policy "users create own profile"
on public.profiles for insert
with check ((select auth.uid()) = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles for update
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "posts visible to everyone" on public.posts;
create policy "posts visible to everyone"
on public.posts for select
using (true);

drop policy if exists "verified users create own posts" on public.posts;
create policy "verified users create own posts"
on public.posts for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "owners delete own posts" on public.posts;
create policy "owners delete own posts"
on public.posts for delete
using ((select auth.uid()) = user_id);

drop policy if exists "admins delete any posts" on public.posts;
create policy "admins delete any posts"
on public.posts for delete
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

drop policy if exists "likes visible" on public.post_likes;
create policy "likes visible"
on public.post_likes for select
using (true);

drop policy if exists "users like as self" on public.post_likes;
create policy "users like as self"
on public.post_likes for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "users remove own likes" on public.post_likes;
create policy "users remove own likes"
on public.post_likes for delete
using ((select auth.uid()) = user_id);

drop policy if exists "boosts visible" on public.post_boosts;
create policy "boosts visible"
on public.post_boosts for select
using (true);

drop policy if exists "users boost as self" on public.post_boosts;
create policy "users boost as self"
on public.post_boosts for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "users remove own boosts" on public.post_boosts;
create policy "users remove own boosts"
on public.post_boosts for delete
using ((select auth.uid()) = user_id);

drop policy if exists "comments visible" on public.post_comments;
create policy "comments visible"
on public.post_comments for select
using (true);

drop policy if exists "users comment as self" on public.post_comments;
create policy "users comment as self"
on public.post_comments for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "users delete own comments" on public.post_comments;
create policy "users delete own comments"
on public.post_comments for delete
using ((select auth.uid()) = user_id);

drop policy if exists "reports visible" on public.post_reports;
create policy "reports visible"
on public.post_reports for select
using (true);

drop policy if exists "users report as self" on public.post_reports;
create policy "users report as self"
on public.post_reports for insert
with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = true;

drop policy if exists "post images are public" on storage.objects;
create policy "post images are public"
on storage.objects for select
using (bucket_id = 'post-images');

drop policy if exists "users upload own post images" on storage.objects;
create policy "users upload own post images"
on storage.objects for insert
with check (
  bucket_id = 'post-images'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

drop policy if exists "users update own post images" on storage.objects;
create policy "users update own post images"
on storage.objects for update
using (
  bucket_id = 'post-images'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

drop policy if exists "users delete own post images" on storage.objects;
create policy "users delete own post images"
on storage.objects for delete
using (
  bucket_id = 'post-images'
  and (
    (select auth.uid())::text = (storage.foldername(name))[1]
    or exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'admin'
    )
  )
);
