UPDATE public.projects
SET
  title = 'Aura Weather',
  description = 'A responsive weather dashboard with live conditions, hourly and seven day forecasts, city search, and saved recent searches.',
  detailed_description = 'Aura Weather is a Vite and TypeScript dashboard powered by the Visual Crossing weather API. It includes city search, live conditions, hourly and seven day forecasts, saved recent searches, city management, and responsive navigation.',
  tech_stack = ARRAY['Vite', 'TypeScript', 'Tailwind CSS 4', 'Visual Crossing API'],
  github_url = 'https://github.com/DaniyalAsif7778/Weather-App',
  live_url = NULL,
  images = NULL,
  sort_order = 2
WHERE slug = 'weather-app';

UPDATE public.projects
SET
  title = 'EmpoManager',
  description = 'A full stack team management platform with role based dashboards, secure sign in, task management, leave tracking, and team visibility.',
  detailed_description = 'EmpoManager is an employee management platform with role based dashboards, secure authentication, task management, leave tracking, and team visibility. The frontend uses React, TypeScript, Redux Toolkit, and Tailwind CSS, with a Node.js and Express API backed by MongoDB.',
  tech_stack = ARRAY['React', 'TypeScript', 'Redux Toolkit', 'Tailwind CSS', 'Node.js', 'Express.js', 'MongoDB'],
  github_url = 'https://github.com/DaniyalAsif7778/employee-managment-system',
  live_url = 'https://employ-managment-system.vercel.app',
  images = ARRAY['https://raw.githubusercontent.com/DaniyalAsif7778/employee-managment-system/main/frontend/src/assets/%20readme.png'],
  sort_order = 1
WHERE slug = 'employee-management-system';

UPDATE public.projects
SET
  title = 'IronTrack',
  slug = 'irontrack',
  description = 'A fitness app for training routines, workouts, body weight logs, and progress analytics with personal accounts.',
  detailed_description = 'IronTrack combines a React and Vite client with an Express and MongoDB API. People can manage routines, workouts, body weight logs, and analytics in an account based workspace. Local demo mode is available for development.',
  tech_stack = ARRAY['React', 'TypeScript', 'Vite', 'Express.js', 'MongoDB', 'Mongoose'],
  github_url = 'https://github.com/DaniyalAsif7778/Irontrack',
  live_url = 'https://irontrack-nu.vercel.app',
  images = ARRAY['https://raw.githubusercontent.com/DaniyalAsif7778/Irontrack/main/client/public/irontrack-share.png'],
  sort_order = 0
WHERE slug = 'e-commerce-frontend';
