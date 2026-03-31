import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import ProjectCard from '@/components/ProjectCard';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Project {
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  slug: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('title, description, tech_stack, github_url, live_url, slug')
        .order('created_at', { ascending: false });
      setProjects((data as Project[]) || []);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6 py-16">
          <SectionHeader
            title="Projects"
            subtitle="A selection of projects I've worked on"
          />

          {loading ? (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.slug}
                  title={project.title}
                  description={project.description}
                  techStack={project.tech_stack || []}
                  githubUrl={project.github_url || undefined}
                  liveUrl={project.live_url || undefined}
                  slug={project.slug}
                  delay={index * 0.1}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground mb-4">
              Want to see more of my work?
            </p>
            <a
              href="https://github.com/DaniyalAsif7778"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              View all projects on GitHub →
            </a>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Projects;
