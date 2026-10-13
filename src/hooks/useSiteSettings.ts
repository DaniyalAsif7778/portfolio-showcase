import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SiteSettings = {
  profile_image: string | null;
  badge: string;
  name: string;
  tagline: string;
  intro: string;
  github_url: string;
  linkedin_url: string;
};

export const defaultSettings: SiteSettings = {
  profile_image: null,
  badge: 'Frontend Developer',
  name: 'Daniyal Asif',
  tagline: 'Frontend Developer — React & Modern Web Apps',
  intro:
    'Results-oriented Frontend Developer specializing in building responsive, accessible, and user-centric web applications with React and modern frontend technologies.',
  github_url: 'https://github.com/DaniyalAsif7778',
  linkedin_url: 'https://linkedin.com/in/DaniyalAsif7778',
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const { data } = await supabase.from('site_settings' as any).select('*').eq('id', 1).maybeSingle();
    if (data) setSettings({ ...defaultSettings, ...(data as unknown as SiteSettings) });
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  return { settings, loading, reload };
};
