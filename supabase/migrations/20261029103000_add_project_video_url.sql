ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS video_url text;

COMMENT ON COLUMN public.projects.video_url IS
'Optional direct video or YouTube URL shown in project previews and project details.';

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
