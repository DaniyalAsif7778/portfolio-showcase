CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  profile_image text,
  badge text NOT NULL DEFAULT 'Frontend Developer',
  name text NOT NULL DEFAULT 'Daniyal Asif',
  tagline text NOT NULL DEFAULT 'Frontend Developer — React & Modern Web Apps',
  intro text NOT NULL DEFAULT 'Results-oriented Frontend Developer specializing in building responsive, accessible, and user-centric web applications with React and modern frontend technologies.',
  github_url text NOT NULL DEFAULT 'https://github.com/DaniyalAsif7778',
  linkedin_url text NOT NULL DEFAULT 'https://linkedin.com/in/DaniyalAsif7778',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
INSERT INTO public.site_settings (id) VALUES (1);