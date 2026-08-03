-- Korean post bodies. NOTE: already applied manually via SQL Editor on
-- 2026-08-03 — kept here so fresh environments reproduce the full schema.

alter table public.posts add column if not exists content_ko jsonb;
