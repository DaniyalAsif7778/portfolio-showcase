-- The Vercel production project was missing the site_settings table entirely.
-- Create its public-readable, service-role-writable content record if absent.
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  profile_image text,
  linkedin_banner_url text,
  badge text NOT NULL DEFAULT 'MERN Stack Developer',
  name text NOT NULL DEFAULT 'Daniyal Asif',
  tagline text NOT NULL DEFAULT 'Full stack MERN developer building practical web applications.',
  intro text NOT NULL DEFAULT 'MERN Stack Developer building responsive web applications with React, Node.js, Express, and MongoDB. I care about maintainable code, useful interfaces, and reliable API integrations.',
  github_url text NOT NULL DEFAULT 'https://github.com/DaniyalAsif7778',
  linkedin_url text NOT NULL DEFAULT 'https://www.linkedin.com/in/daniyal-asif-25ba10332/',
  about_content jsonb NOT NULL DEFAULT '{"heading":"About Me","subtitle":"Get to know me better","whoTitle":"Who I Am","paragraphs":["I’m a MERN Stack Developer from Rawalpindi, Pakistan, with hands-on project experience building full stack web applications using MongoDB, Express.js, React.js, and Node.js.","I build reusable React components, integrate REST APIs, manage application state, and deploy frontend and backend applications. I’m interested in maintainable architecture, scalable backend design, and AI powered development."],"location":"Rawalpindi, Punjab, Pakistan","email":"danyalasif.dev@gmail.com","phone":"0312 1982877","educationTitle":"Education","education":[{"title":"Intermediate Computer Science (ICS)","school":"Superior College Pindsultani","period":"Jan 2023 to Jan 2027"},{"title":"Matric in Computer Science","school":"SPIRIT SCHOOL Basal","period":"Jan 2021 to Jan 2023"}],"goalsTitle":"Currently Exploring","goals":["Agentic AI and AI agents","Tool calling and Retrieval-Augmented Generation (RAG)","System design and scalable backend architecture"],"languagesTitle":"Languages","languages":["Urdu (Native)","English (Fluent)"]}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
GRANT SELECT ON public.site_settings TO anon, authenticated;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_settings'
      AND policyname = 'Site settings are viewable by everyone'
  ) THEN
    CREATE POLICY "Site settings are viewable by everyone"
      ON public.site_settings FOR SELECT USING (true);
  END IF;
END $$;

-- Repair live schema drift: the video URL migration is recorded remotely, but
-- the column is absent from the projects table used by the deployed portfolio.
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS video_url text;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS linkedin_banner_url text;

NOTIFY pgrst, 'reload schema';

-- The earlier content refresh was edited after it had already been applied.
-- Reapply the current public copy with a new, immutable migration.
UPDATE public.projects
SET
  title = 'Aura Weather',
  description = 'A responsive weather dashboard with live conditions, hourly and seven day forecasts, city search, and saved recent searches.',
  detailed_description = 'Aura Weather is a Vite and TypeScript dashboard powered by the Visual Crossing weather API. It includes city search, live conditions, hourly and seven day forecasts, saved recent searches, city management, and responsive navigation.',
  tech_stack = ARRAY['Vite', 'TypeScript', 'Tailwind CSS 4', 'Visual Crossing API'],
  github_url = 'https://github.com/DaniyalAsif7778/Weather-App',
  live_url = NULL,
  sort_order = 2
WHERE slug = 'weather-app'
  AND (title = 'Weather App' OR description ILIKE '%public weather API%');

UPDATE public.site_settings
SET
  tagline = CASE
    WHEN tagline = 'MERN Stack Developer | Building Fast, Modern Web Apps'
      THEN 'Full stack MERN developer building practical web applications.'
    ELSE tagline
  END,
  intro = CASE
    WHEN intro ILIKE '%being passionate about writing code%'
      THEN 'MERN Stack Developer building responsive web applications with React, Node.js, Express, and MongoDB. I care about maintainable code, useful interfaces, and reliable API integrations.'
    ELSE intro
  END,
  about_content = CASE
    WHEN about_content::text ILIKE '%cutting-edge, user-friendly, and scalable%'
      OR about_content::text ILIKE '%English (intermediate)%'
      OR about_content::text ILIKE '%Jan 2023 - Jan 2025%'
    THEN jsonb_build_object(
      'heading', 'About Me',
      'subtitle', 'Get to know me better',
      'whoTitle', 'Who I Am',
      'paragraphs', jsonb_build_array(
        'I’m a MERN Stack Developer from Rawalpindi, Pakistan, with hands-on project experience building full stack web applications using MongoDB, Express.js, React.js, and Node.js.',
        'I build reusable React components, integrate REST APIs, manage application state, and deploy frontend and backend applications. I’m interested in maintainable architecture, scalable backend design, and AI powered development.'
      ),
      'location', 'Rawalpindi, Punjab, Pakistan',
      'email', 'danyalasif.dev@gmail.com',
      'phone', '0312 1982877',
      'educationTitle', 'Education',
      'education', jsonb_build_array(
        jsonb_build_object('title', 'Intermediate Computer Science (ICS)', 'school', 'Superior College Pindsultani', 'period', 'Jan 2023 to Jan 2027'),
        jsonb_build_object('title', 'Matric in Computer Science', 'school', 'SPIRIT SCHOOL Basal', 'period', 'Jan 2021 to Jan 2023')
      ),
      'goalsTitle', 'Currently Exploring',
      'goals', jsonb_build_array(
        'Agentic AI and AI agents',
        'Tool calling and Retrieval-Augmented Generation (RAG)',
        'System design and scalable backend architecture'
      ),
      'languagesTitle', 'Languages',
      'languages', jsonb_build_array('Urdu (Native)', 'English (Fluent)')
    )
    ELSE about_content
  END,
  updated_at = now()
WHERE id = 1;

UPDATE public.site_settings
SET about_content = jsonb_set(about_content, '{email}', '"danyalasif.dev@gmail.com"'::jsonb, true),
    updated_at = now()
WHERE id = 1 AND about_content->>'email' = 'daniyal.asifjdk7778@gmail.com';

-- Publish the resume skill set the UI already documents. These seed rows are
-- replaced once; afterwards the admin panel owns the rows normally.
DELETE FROM public.skills;

INSERT INTO public.skills (name, percentage, color, category, featured, sort_order) VALUES
  ('React.js', 0, 'hsl(174 50% 48%)', 'Frontend', false, 1),
  ('JavaScript (ES6+)', 0, 'hsl(174 50% 48%)', 'Frontend', false, 2),
  ('TypeScript', 0, 'hsl(174 50% 48%)', 'Frontend', false, 3),
  ('HTML5', 0, 'hsl(174 50% 48%)', 'Frontend', false, 4),
  ('CSS3', 0, 'hsl(174 50% 48%)', 'Frontend', false, 5),
  ('Tailwind CSS', 0, 'hsl(174 50% 48%)', 'Frontend', false, 6),
  ('Responsive design', 0, 'hsl(174 50% 48%)', 'Frontend', false, 7),
  ('Node.js', 0, 'hsl(174 50% 48%)', 'Backend', false, 8),
  ('Express.js', 0, 'hsl(174 50% 48%)', 'Backend', false, 9),
  ('REST APIs', 0, 'hsl(174 50% 48%)', 'Backend', false, 10),
  ('API integration', 0, 'hsl(174 50% 48%)', 'Backend', false, 11),
  ('Server-side validation', 0, 'hsl(174 50% 48%)', 'Backend', false, 12),
  ('Error handling', 0, 'hsl(174 50% 48%)', 'Backend', false, 13),
  ('MongoDB', 0, 'hsl(174 50% 48%)', 'Database', false, 14),
  ('Mongoose', 0, 'hsl(174 50% 48%)', 'Database', false, 15),
  ('Schema design', 0, 'hsl(174 50% 48%)', 'Database', false, 16),
  ('CRUD operations', 0, 'hsl(174 50% 48%)', 'Database', false, 17),
  ('Context API', 0, 'hsl(174 50% 48%)', 'State Management', false, 18),
  ('Redux Toolkit', 0, 'hsl(174 50% 48%)', 'State Management', false, 19),
  ('Git', 0, 'hsl(174 50% 48%)', 'Tools & Deployment', false, 20),
  ('GitHub', 0, 'hsl(174 50% 48%)', 'Tools & Deployment', false, 21),
  ('Postman', 0, 'hsl(174 50% 48%)', 'Tools & Deployment', false, 22),
  ('Vercel', 0, 'hsl(174 50% 48%)', 'Tools & Deployment', false, 23),
  ('Environment configuration', 0, 'hsl(174 50% 48%)', 'Tools & Deployment', false, 24);
