ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS video_url text;

COMMENT ON COLUMN public.projects.video_url IS
'Optional direct URL to a project video used by the scroll-scrub presentation.';
