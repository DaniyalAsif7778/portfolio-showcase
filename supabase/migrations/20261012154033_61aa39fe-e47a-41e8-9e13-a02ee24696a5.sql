CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  percentage integer NOT NULL DEFAULT 80 CHECK (percentage BETWEEN 0 AND 100),
  color text NOT NULL DEFAULT 'hsl(174 72% 56%)',
  category text NOT NULL DEFAULT 'Frontend Development',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills are viewable by everyone" ON public.skills FOR SELECT USING (true);
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON public.skills
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.projects ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

INSERT INTO public.skills (name, percentage, color, category, featured, sort_order) VALUES
('React', 90, 'hsl(192 95% 68%)', 'Frontend Development', true, 1),
('Redux Toolkit', 85, 'hsl(261 78% 63%)', 'State & Routing', false, 2),
('Tailwind CSS', 92, 'hsl(198 93% 60%)', 'Frontend Development', true, 3),
('TypeScript', 80, 'hsl(211 60% 48%)', 'Tools & Technologies', true, 4),
('Git & GitHub', 88, 'hsl(12 80% 55%)', 'Tools & Technologies', false, 5),
('JavaScript', 90, 'hsl(50 98% 64%)', 'Frontend Development', true, 6),
('HTML5', 95, 'hsl(14 100% 57%)', 'Frontend Development', false, 7),
('CSS3', 92, 'hsl(205 87% 50%)', 'Frontend Development', false, 8),
('GSAP', 70, 'hsl(142 76% 50%)', 'Tools & Technologies', false, 9),
('React Router', 88, 'hsl(200 80% 55%)', 'State & Routing', false, 10),
('TanStack Router', 75, 'hsl(280 75% 55%)', 'State & Routing', false, 11),
('Responsive Design', 93, 'hsl(174 72% 56%)', 'Frontend Development', false, 12);