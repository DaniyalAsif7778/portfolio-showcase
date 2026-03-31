
DROP POLICY "Allow project inserts" ON public.projects;
CREATE POLICY "Allow project inserts" ON public.projects FOR INSERT TO anon, authenticated WITH CHECK (true);
