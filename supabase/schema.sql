create extension if not exists pgcrypto;
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
grant select on public.admin_users to authenticated;
create policy "Editors can view their own editor record" on public.admin_users
for select to authenticated using ((select auth.uid()) = user_id);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id),
  influencer text not null,
  title text not null,
  body text not null,
  category text not null,
  image_url text,
  image_path text,
  source_name text,
  source_url text,
  published_at timestamptz,
  is_automated boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.news enable row level security;
grant select on public.news to anon, authenticated;
grant insert, update, delete on public.news to authenticated;
create policy "Published news is public; editors can view all" on public.news
for select to anon, authenticated using (published=true or exists (select 1 from public.admin_users where user_id=(select auth.uid())));
create policy "Editors can insert news" on public.news
for insert to authenticated with check (created_by=(select auth.uid()) and exists (select 1 from public.admin_users where user_id=(select auth.uid())));
create policy "Editors can update news" on public.news
for update to authenticated using (exists (select 1 from public.admin_users where user_id=(select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id=(select auth.uid())));
create policy "Editors can delete news" on public.news
for delete to authenticated using (exists (select 1 from public.admin_users where user_id=(select auth.uid())));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('news-images','news-images',true,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "Editors can upload news images" on storage.objects
for insert to authenticated with check (bucket_id='news-images' and exists (select 1 from public.admin_users where user_id=(select auth.uid())));
create policy "Editors can delete news images" on storage.objects
for delete to authenticated using (bucket_id='news-images' and exists (select 1 from public.admin_users where user_id=(select auth.uid())));
create index if not exists news_created_by_idx on public.news (created_by);
create unique index if not exists news_source_url_unique on public.news (source_url);