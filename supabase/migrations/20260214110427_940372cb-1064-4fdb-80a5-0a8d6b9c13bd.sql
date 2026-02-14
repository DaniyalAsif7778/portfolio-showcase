
-- Create the update_updated_at function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project likes table
CREATE TABLE public.project_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Project comments table
CREATE TABLE public.project_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

-- Projects: publicly readable
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.project_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own like" ON public.project_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.project_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.project_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.project_comments FOR DELETE USING (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed projects
INSERT INTO public.projects (slug, title, description, detailed_description, tech_stack, github_url, live_url, images) VALUES
(
  'employee-management-system',
  'Employee Management System',
  'Developed the frontend for an employee management system focused on managing employee records, including adding, viewing, and organizing data.',
  'A comprehensive employee management system built with React that allows organizations to efficiently manage their workforce data. Features a clean, intuitive interface for adding new employees, viewing detailed profiles, and organizing records. Built with a focus on component reusability and clean state management patterns.',
  ARRAY['React', 'JavaScript', 'CSS', 'State Management'],
  'https://github.com/DaniyalAsif7778',
  'https://empoly-manegment-system.vercel.app/',
  ARRAY['/placeholder.svg', '/placeholder.svg', '/placeholder.svg']
),
(
  'e-commerce-frontend',
  'E-Commerce Frontend',
  'A frontend e-commerce application featuring Home, Product Details, Cart, and Checkout pages. Integrated with the Fake Store API.',
  'A fully functional e-commerce frontend with dynamic product listings from the Fake Store API, detailed product pages, shopping cart with quantity management, and checkout flow. Built with React Router and Tailwind CSS for a modern, responsive design.',
  ARRAY['React', 'Tailwind CSS', 'Fake Store API', 'React Router'],
  'https://github.com/DaniyalAsif7778',
  NULL,
  ARRAY['/placeholder.svg', '/placeholder.svg', '/placeholder.svg']
),
(
  'weather-app',
  'Weather App',
  'A responsive weather application displaying real-time weather data by integrating a public weather API.',
  'A responsive weather application providing real-time weather information for any city worldwide. Integrates with a public weather API for current conditions, temperature, humidity, and wind speed. Features city search and beautifully designed weather cards.',
  ARRAY['React', 'Weather API', 'CSS', 'Async/Await'],
  'https://github.com/DaniyalAsif7778',
  NULL,
  ARRAY['/placeholder.svg', '/placeholder.svg', '/placeholder.svg']
);
