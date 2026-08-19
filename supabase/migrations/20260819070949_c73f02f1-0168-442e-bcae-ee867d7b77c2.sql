-- Lock down project writes: only the secure admin backend (service role) may modify projects
DROP POLICY IF EXISTS "Allow project inserts" ON public.projects;
DROP POLICY IF EXISTS "Allow project updates" ON public.projects;
DROP POLICY IF EXISTS "Allow project deletes" ON public.projects;
REVOKE INSERT, UPDATE, DELETE ON public.projects FROM anon, authenticated;
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO service_role;

-- Lock down storage writes for project images
DROP POLICY IF EXISTS "Anyone can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete project images" ON storage.objects;

-- Comment author identity is no longer publicly readable
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.project_comments;
REVOKE SELECT ON public.project_comments FROM anon;
CREATE POLICY "Users can view their own comments"
ON public.project_comments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);