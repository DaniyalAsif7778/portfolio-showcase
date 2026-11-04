UPDATE storage.buckets
SET
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']::text[]
WHERE id = 'project-images';
