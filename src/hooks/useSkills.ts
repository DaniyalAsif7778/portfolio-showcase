import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Skill = {
  id: string;
  name: string;
  percentage: number;
  color: string;
  category: string;
  featured: boolean;
  sort_order: number;
};

export const useSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('skills' as any)
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        setSkills((data || []) as unknown as Skill[]);
        setLoading(false);
      });
  }, []);

  return { skills, loading };
};
