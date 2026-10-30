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

/** Exact skill set from Daniyal's current resume; prevents old saved entries from lingering. */
export const resumeSkills: Skill[] = [
  ...[
    ['React.js', 'Frontend'], ['JavaScript (ES6+)', 'Frontend'], ['TypeScript', 'Frontend'],
    ['HTML5', 'Frontend'], ['CSS3', 'Frontend'], ['Tailwind CSS', 'Frontend'], ['Responsive design', 'Frontend'],
    ['Node.js', 'Backend'], ['Express.js', 'Backend'], ['REST APIs', 'Backend'],
    ['API integration', 'Backend'], ['Server-side validation', 'Backend'], ['Error handling', 'Backend'],
    ['MongoDB', 'Database'], ['Mongoose', 'Database'], ['Schema design', 'Database'], ['CRUD operations', 'Database'],
    ['Context API', 'State Management'], ['Redux Toolkit', 'State Management'],
    ['Git', 'Tools & Deployment'], ['GitHub', 'Tools & Deployment'], ['Postman', 'Tools & Deployment'],
    ['Vercel', 'Tools & Deployment'], ['Environment configuration', 'Tools & Deployment'],
  ].map(([name, category], index) => ({
    id: `resume-${index + 1}`,
    name,
    percentage: 0,
    color: 'teal',
    category,
    featured: false,
    sort_order: index + 1,
  })),
];

export const useSkills = () => {
  const [skills, setSkills] = useState<Skill[]>(resumeSkills);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadSkills = async () => {
      try {
        const { data } = await supabase.from('skills').select('*').order('sort_order');
        if (!active) return;
        const savedSkills = (data || []) as unknown as Skill[];
        // Any admin-managed rows are authoritative. The old category gate silently
        // discarded every saved edit unless five exact category names existed.
        setSkills(savedSkills.length ? savedSkills : resumeSkills);
      } catch {
        if (active) setSkills(resumeSkills);
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadSkills();
    return () => { active = false; };
  }, []);

  return { skills, loading };
};
