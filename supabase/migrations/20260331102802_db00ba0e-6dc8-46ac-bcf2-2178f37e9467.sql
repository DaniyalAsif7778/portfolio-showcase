
-- Allow inserts to projects table (for admin form - protected by client-side auth)
CREATE POLICY "Allow project inserts" ON public.projects FOR INSERT WITH CHECK (true);
