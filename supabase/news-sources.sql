-- Run once in Supabase SQL Editor to enable multi-source story clusters.
create table if not exists public.news_sources (
  news_id uuid not null references public.news(id) on delete cascade,
  source_name text not null,
  source_url text not null unique,
  source_title text not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (news_id, source_url)
);

alter table public.news_sources enable row level security;
grant select on public.news_sources to anon, authenticated;
grant all on public.news_sources to service_role;
create index if not exists news_sources_news_id_idx on public.news_sources (news_id);

drop policy if exists "Public can view sources for published news" on public.news_sources;
create policy "Public can view sources for published news"
on public.news_sources for select to anon, authenticated
using (
  exists (
    select 1 from public.news n
    where n.id = news_id
      and (n.published = true or exists (
        select 1 from public.admin_users a where a.user_id = (select auth.uid())
      ))
  )
);
