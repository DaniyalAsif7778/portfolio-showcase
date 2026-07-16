DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
CREATE POLICY "Anyone can upload project images" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'project-images');
CREATE POLICY "Anyone can update project images" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'project-images') WITH CHECK (bucket_id = 'project-images');
CREATE POLICY "Anyone can delete project images" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'project-images');