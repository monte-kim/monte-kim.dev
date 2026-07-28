-- Post images bucket: public read, authenticated (admin) write.
-- Client compresses to <300KB before upload (free tier: 1GB Storage).

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
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
