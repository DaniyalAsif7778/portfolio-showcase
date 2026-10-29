import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectVideoScrub from '@/components/ProjectVideoScrub';

interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  detailed_description: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  video_url: string | null;
  images: string[];
  created_at: string;
}

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();
      if (data) setProject(data as Project);
      setLoading(false);
    };
    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-6">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-6 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Project not found</h2>
          <Link to="/projects" className="text-primary hover:underline">
            ← Back to projects
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col gap-12">
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              Back to projects
            </Link>
          </motion.nav>

          {/* Hero: info rail + visuals */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`flex flex-col gap-8 ${
                project.images && project.images.length > 0 ? 'lg:col-span-5' : 'lg:col-span-8'
              }`}
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter leading-none">
                  <span className="gradient-text">{project.title}</span>
                </h1>
                {project.tech_stack?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold border border-border bg-card/50 text-primary rounded-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                {project.description}
              </p>

              {(project.live_url || project.github_url) && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      View Live <ExternalLink size={18} />
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 border border-border text-foreground rounded-full font-bold hover:border-primary/60 transition-colors flex items-center justify-center gap-2"
                    >
                      GitHub <Github size={18} />
                    </a>
                  )}
                </div>
              )}
            </motion.div>

            {project.images && project.images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-7 space-y-6"
              >
                <div className="relative">
                  <div
                    className="absolute -inset-0.5 opacity-20 blur-2xl"
                    style={{ background: 'var(--gradient-primary)' }}
                  />
                  <div className="relative glass-card overflow-hidden rounded-2xl">
                    <img
                      src={project.images[selectedImage] || '/placeholder.svg'}
                      alt={`${project.title} screenshot ${selectedImage + 1}`}
                      className="w-full aspect-[16/10] object-cover"
                    />
                  </div>
                </div>

                {project.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-4">
                    {project.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        aria-label={`Show image ${i + 1}`}
                        className={`bg-card border border-border rounded-xl overflow-hidden aspect-video transition-all ${
                          selectedImage === i
                            ? 'outline outline-2 outline-primary/50 outline-offset-4'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {project.video_url && <ProjectVideoScrub src={project.video_url} poster={project.images?.[0]} title={project.title} />}

          {/* Details */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-12 pt-12 border-t border-border"
          >
            <div className="md:col-span-4">
              <h2 className="text-2xl font-display font-bold tracking-tight mb-6">About this Project</h2>
              <div className="space-y-6">
                {project.tech_stack?.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Stack</p>
                    <p className="text-foreground font-medium">{project.tech_stack.join(' · ')}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Published</p>
                  <p className="text-foreground font-medium">
                    {new Date(project.created_at).toLocaleDateString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="md:col-span-8">
              <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                {project.detailed_description || project.description}
              </p>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};


export default ProjectDetail;
