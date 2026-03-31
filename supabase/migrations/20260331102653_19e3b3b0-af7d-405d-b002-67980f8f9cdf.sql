
-- Ratings table (may already exist from failed migration rollback)
CREATE TABLE IF NOT EXISTS public.project_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_ratings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_ratings' AND policyname = 'Ratings are viewable by everyone') THEN
    CREATE POLICY "Ratings are viewable by everyone" ON public.project_ratings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_ratings' AND policyname = 'Authenticated users can rate') THEN
    CREATE POLICY "Authenticated users can rate" ON public.project_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_ratings' AND policyname = 'Users can update their own rating') THEN
    CREATE POLICY "Users can update their own rating" ON public.project_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_ratings' AND policyname = 'Users can delete their own rating') THEN
    CREATE POLICY "Users can delete their own rating" ON public.project_ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true) ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can view project images') THEN
    CREATE POLICY "Anyone can view project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload project images') THEN
    CREATE POLICY "Authenticated users can upload project images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images');
  END IF;
END $$;
