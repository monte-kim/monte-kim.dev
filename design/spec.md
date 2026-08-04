# monte-kim.dev — Developer Handoff

Personal blog + portfolio for Tae Hwan "Monte" Kim. Design source: `Blog Portfolio.dc.html` (screens 2a–2h desktop, 3a–3c mobile, 3d dark).

## Stack
- **App**: Next.js 15 (App Router), deployed on **Vercel Hobby** (free)
- **DB/Auth/Storage**: **Supabase free tier** — Postgres 500MB, Auth (admin login only), Storage (post images)
- **Styling**: Tailwind CSS; fonts Instrument Sans (UI) + JetBrains Mono (meta/code) via next/font
- **Editor**: Tiptap (block WYSIWYG, markdown input rules, slash menu) — matches screen 2g
- i18n: next-intl, `en` default / `ko` toggle. Theme: next-themes (class strategy)

## Routes
| Route | Screen | Notes |
|---|---|---|
| `/` | 2a / 3a / 3d | hero, stat strip, recent posts, project preview |
| `/writing` | 2e | search (⌘K), tag filter chips, pagination |
| `/writing/[slug]` | 2f / 3b | TOC (desktop right rail, mobile bottom sheet), views, comments |
| `/projects` | 2b′ | card grid; whole card links to detail |
| `/projects/[slug]` | 2k / 3f | portfolio hub: stats, screenshots, architecture, stack, roles, timeline, decisions |
| `/about` | 2c | story, Now box, timeline, tools, CV download |
| `/say-hi` | 2d | contact form → Supabase `messages` + email notify (Resend free) |
| `/admin` | — | Supabase Auth email login, single user |
| `/admin/posts` | — | list drafts/published |
| `/admin/editor/[id]` | 2g / 3c | Tiptap editor, autosave |

## DB schema (Postgres)
```sql
posts(id, slug unique, title_en, title_ko, excerpt_en, excerpt_ko,
      content jsonb,            -- Tiptap JSON, single source of truth
      status text check in ('draft','published'), cover_url,
      read_minutes int, published_at, created_at, updated_at);
tags(id, name unique);  post_tags(post_id, tag_id);
post_views(post_id pk, count bigint);          -- upsert +1 per view, dedupe by hashed IP+day
comments(id, post_id, parent_id nullable, author_name, author_email nullable,
         body text, is_author bool default false, created_at);
messages(id, name, email, body, created_at);   -- Say hi form
projects(id, slug unique, name, one_liner_en, one_liner_ko, role_badge, status,
         stats jsonb, body jsonb, screenshots jsonb, stack jsonb, roles jsonb,
         timeline jsonb, decisions jsonb,  -- each decision may link a post slug
         sort_order int, created_at, updated_at);
```
RLS: public read on published posts/comments; writes via server actions (service role); admin mutations require auth.

## Design tokens
- Light: bg `#FBFBFA` · surface `#FFFFFF` · ink `#1A1A18` · body `#4A4945` · muted `#6F6E69` · border `#D9D8D3` · hairline `#ECEBE7` · subtle `#F4F3F0`
- Dark: bg `#191918` · surface `#1F1F1E` · ink `#EDECE8` · body `#B5B4AE` · muted `#8F8E88` · border `#2C2C2A`
- Type: h1 34–46px/700/-1px · body 16px/1.75 · meta mono 11–13px
- Radii: cards 10–12px, buttons 7–9px, chips 100px. Icons: 16-grid, 1.5px stroke, round caps (inline SVG set in design file, screen 2h)

## Editor requirements (2g)
- Block-based WYSIWYG: paragraph, H2/H3, bullet/numbered list, quote, code block (lowlight syntax highlight), image (upload → Supabase Storage), divider
- Markdown input rules: `##`+space, `-`+space, `>`+space, ``` ```lang ```, `**bold**` etc.
- Slash menu (`/`) with block search; floating toolbar on selection (B/i/U/code/link/turn-into)
- Autosave (debounced 2s) to `posts.content`; Write/Preview toggle renders the public post component
- Drag handle per block (Tiptap drag-handle extension)

## Views & comments
- View count: server action on post page load, `insert … on conflict do update set count = count+1`; dedupe via hashed (IP, post, day) in a `view_events` table or Vercel KV — keep simple
- Comments: name required, email optional, one-level replies (`parent_id`), author badge when `is_author`, honeypot + rate limit for spam

## Free-tier guardrails
- Supabase free pauses after 1 week inactivity → GitHub Actions cron ping 2×/week
- Images: compress client-side before upload (<300KB), Storage 1GB cap
- ISR (`revalidate: 60`) on public pages to stay in Vercel free limits
