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

export const linkedinProfileUrl = 'https://www.linkedin.com/in/daniyal-asif-25ba10332/';

export const defaultAbout: AboutContent = {
  heading: 'About Me',
  subtitle: 'Get to know me better',
  whoTitle: 'Who I Am',
  paragraphs: [
    'I’m a MERN Stack Developer from Rawalpindi, Pakistan, with hands-on project experience building full stack web applications using MongoDB, Express.js, React.js, and Node.js.',
    'I build reusable React components, integrate REST APIs, manage application state, and deploy frontend and backend applications. I’m interested in maintainable architecture, scalable backend design, and AI powered development.',
  ],
  location: 'Rawalpindi, Punjab, Pakistan',
  email: 'daniyal.asifjdk7778@gmail.com',
  phone: '0312 1982877',
  educationTitle: 'Education',
  education: [
    { title: 'Intermediate Computer Science (ICS)', school: 'Superior College Pindsultani', period: 'Jan 2023 to Jan 2027' },
    { title: 'Matric in Computer Science', school: 'SPIRIT SCHOOL Basal', period: 'Jan 2021 to Jan 2023' },
  ],
  goalsTitle: 'Currently Exploring',
  goals: [
    'Agentic AI and AI agents',
    'Tool calling and Retrieval-Augmented Generation (RAG)',
    'System design and scalable backend architecture',
  ],
  languagesTitle: 'Languages',
  languages: ['Urdu (Native)', 'English (Fluent)'],
};

export const defaultSettings: SiteSettings = {
  profile_image: null,
  badge: 'MERN Stack Developer',
  name: 'Daniyal Asif',
  tagline: 'MERN Stack Developer building modern web applications',
  intro:
    'MERN Stack Developer building responsive web applications with React, Node.js, Express, and MongoDB. I care about maintainable code, useful interfaces, and reliable API integrations.',
  github_url: 'https://github.com/DaniyalAsif7778',
  linkedin_url: linkedinProfileUrl,
  about: defaultAbout,
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (data) {
      const row = data as unknown as Record<string, unknown>;
      const savedIntro = typeof row.intro === 'string' ? row.intro.trim() : '';
      // Replace the old generic bio still present in existing site_settings rows.
      const intro = /being passionate about writing code/i.test(savedIntro)
        ? defaultSettings.intro
        : (savedIntro || defaultSettings.intro);
      const savedAbout = (row.about_content as Partial<AboutContent>) || {};
      const about = { ...defaultAbout, ...savedAbout };
      if (about.paragraphs.some((paragraph) => /cutting-edge, user-friendly, and scalable/i.test(paragraph))) {
        about.paragraphs = defaultAbout.paragraphs;
      }
      about.education = about.education.map((entry) => {
        if (/intermediate.*computer science|\bics\b/i.test(entry.title) && /2025/.test(entry.period)) {
          return { ...entry, period: defaultAbout.education[0].period };
        }
        return { ...entry, period: entry.period.replace(/\s*[–—-]\s*/g, ' to ') };
      });
      about.languages = about.languages.map((language) =>
        /^english\s*\(intermediate\)$/i.test(language) ? 'English (Fluent)' : language,
      );
      if (about.goals.some((goal) => /master advanced react patterns|contribute to open-source projects/i.test(goal))) {
        about.goalsTitle = defaultAbout.goalsTitle;
        about.goals = defaultAbout.goals;
      }
      setSettings({
        ...defaultSettings,
        ...(row as unknown as SiteSettings),
        intro,
        about,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  return { settings, loading, reload };
};
