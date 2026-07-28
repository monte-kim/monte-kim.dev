-- Atomic view recording: dedupe by (post, hashed IP, day), then +1.
-- Called from the server action with the service role only.

create or replace function public.record_post_view(p_slug text, p_ip_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post_id uuid;
begin
  select id into v_post_id
  from public.posts
  where slug = p_slug and status = 'published';

  if v_post_id is null then
    return;
  end if;

  -- first view from this visitor today → count it
  insert into public.view_events (post_id, ip_hash, day)
  values (v_post_id, p_ip_hash, current_date)
  on conflict do nothing;

  if found then
    insert into public.post_views (post_id, count)
    values (v_post_id, 1)
    on conflict (post_id) do update set count = public.post_views.count + 1;
  end if;
end;
$$;

-- service role only — no public/anon execution
revoke execute on function public.record_post_view(text, text) from public, anon, authenticated;
