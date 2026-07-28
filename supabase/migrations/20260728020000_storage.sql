-- Post images bucket: public read, authenticated (admin) write.
-- Client compresses to <300KB before upload (free tier: 1GB Storage).

-- bucket-level hard limits back up the app-side checks (300KB, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  307200, -- 300KB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;

create policy "public read post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "admin write post images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images');

create policy "admin delete post images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images');
