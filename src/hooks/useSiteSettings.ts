import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type EducationEntry = {
  title: string;
  school: string;
  period: string;
};

export type AboutContent = {
  heading: string;
  subtitle: string;
  whoTitle: string;
  paragraphs: string[];
  location: string;
  email: string;
  phone: string;
  educationTitle: string;
  education: EducationEntry[];
  goalsTitle: string;
  goals: string[];
  languagesTitle: string;
  languages: string[];
};

export type SiteSettings = {
  profile_image: string | null;
  badge: string;
  name: string;
  tagline: string;
  intro: string;
  github_url: string;
  linkedin_url: string;
  about: AboutContent;
};

export const defaultAbout: AboutContent = {
  heading: 'About Me',
  subtitle: 'Get to know me better',
  whoTitle: 'Who I Am',
  paragraphs: [
    "I'm a results-oriented Frontend Developer from Rawalpindi, Pakistan, specializing in building responsive, accessible, and user-centric web applications with React and modern frontend technologies.",
    "With a proven ability to design and implement real-world projects with clean, maintainable code and strong problem-solving skills, I'm eager to leverage my React expertise to contribute to impactful user interfaces and accelerate professional growth.",
  ],
  location: 'Rawalpindi, Punjab, Pakistan',
  email: 'daniyal.asifjdk7778@gmail.com',
  phone: '0312 1982877',
  educationTitle: 'Education',
  education: [
    { title: 'Intermediate Computer Science (ICS)', school: 'Superior College Pindsultani', period: 'Jan 2023 – Jan 2025' },
    { title: 'Matric in Computer Science', school: 'SPIRIT SCHOOL Basal', period: 'Jan 2021 – Jan 2023' },
  ],
  goalsTitle: 'My Goals',
  goals: [
    'Master advanced React patterns and state management',
    'Contribute to open-source projects and communities',
    'Build impactful web applications that solve real problems',
    'Grow as a full-stack developer over time',
  ],
  languagesTitle: 'Languages',
  languages: ['Urdu (Native)', 'English (Fluent)'],
};

export const defaultSettings: SiteSettings = {
  profile_image: null,
  badge: 'Frontend Developer',
  name: 'Daniyal Asif',
  tagline: 'Frontend Developer for React & Modern Web Apps',
  intro:
    'Results-oriented Frontend Developer specializing in building responsive, accessible, and user-centric web applications with React and modern frontend technologies.',
  github_url: 'https://github.com/DaniyalAsif7778',
  linkedin_url: 'https://linkedin.com/in/DaniyalAsif7778',
  about: defaultAbout,
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const { data } = await supabase.from('site_settings' as any).select('*').eq('id', 1).maybeSingle();
    if (data) {
      const row = data as unknown as Record<string, unknown>;
      setSettings({
        ...defaultSettings,
        ...(row as unknown as SiteSettings),
        about: { ...defaultAbout, ...((row.about_content as Partial<AboutContent>) || {}) },
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  return { settings, loading, reload };
};
