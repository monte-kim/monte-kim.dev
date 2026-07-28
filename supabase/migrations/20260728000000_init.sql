-- monte-kim.dev — initial schema (from spec.md)
-- posts, tags, post_tags, post_views, view_events, comments, messages + RLS

-- ── posts ───────────────────────────────────────────────────────────
create table public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title_en     text not null default '',
  title_ko     text,
  excerpt_en   text,
  excerpt_ko   text,
  content      jsonb not null default '{}'::jsonb,  -- Tiptap JSON, single source of truth
  status       text not null default 'draft' check (status in ('draft', 'published')),
  cover_url    text,
  read_minutes int,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index posts_published_idx
  on public.posts (published_at desc)
  where status = 'published';

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ── tags ────────────────────────────────────────────────────────────
create table public.tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id  uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ── views ───────────────────────────────────────────────────────────
-- upsert +1 per view: insert … on conflict (post_id) do update set count = count + 1
create table public.post_views (
  post_id uuid primary key references public.posts (id) on delete cascade,
  count   bigint not null default 0
);

-- dedupe by hashed (IP, post, day)
create table public.view_events (
  post_id uuid not null references public.posts (id) on delete cascade,
  ip_hash text not null,
  day     date not null default current_date,
  primary key (post_id, ip_hash, day)
);

-- ── comments ────────────────────────────────────────────────────────
create table public.comments (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.posts (id) on delete cascade,
  parent_id    uuid references public.comments (id) on delete cascade,  -- one-level replies
  author_name  text not null,
  author_email text,
  body         text not null,
  is_author    boolean not null default false,
  created_at   timestamptz not null default now()
);

create index comments_post_idx on public.comments (post_id, created_at);

-- ── messages (Say hi form) ──────────────────────────────────────────
create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  body       text not null,
  created_at timestamptz not null default now()
);

-- ── RLS ─────────────────────────────────────────────────────────────
-- Public read on published posts + related data; comments are public read.
-- All writes go through server actions using the service role (bypasses RLS);
-- admin mutations additionally require an authenticated session in the app.

alter table public.posts       enable row level security;
alter table public.tags        enable row level security;
alter table public.post_tags   enable row level security;
alter table public.post_views  enable row level security;
alter table public.view_events enable row level security;
alter table public.comments    enable row level security;
alter table public.messages    enable row level security;

create policy "public read published posts"
  on public.posts for select
  using (status = 'published');

create policy "admin read all posts"
  on public.posts for select
  to authenticated
  using (true);

create policy "admin write posts"
  on public.posts for all
  to authenticated
  using (true)
  with check (true);

create policy "public read tags"
  on public.tags for select
  using (true);

create policy "admin write tags"
  on public.tags for all
  to authenticated
  using (true)
  with check (true);

create policy "public read post_tags"
  on public.post_tags for select
  using (true);

create policy "admin write post_tags"
  on public.post_tags for all
  to authenticated
  using (true)
  with check (true);

create policy "public read post_views"
  on public.post_views for select
  using (true);

-- view_events: no public access (service role only)

create policy "public read comments"
  on public.comments for select
  using (true);

-- comments/messages inserts: service role only (server actions with
-- honeypot + rate limit); no public insert policy on purpose.
