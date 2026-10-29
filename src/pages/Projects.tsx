import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Project { title: string; description: string; tech_stack: string[]; github_url: string | null; live_url: string | null; slug: string; }

const Projects = () => {
  const pageRef = useRef<HTMLElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.from('projects').select('title, description, tech_stack, github_url, live_url, slug').order('created_at', { ascending: false })
      .then(({ data }) => { if (active) { setProjects((data as Project[]) || []); setLoading(false); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(CustomEase, ScrollTrigger);
    CustomEase.create('editorial', 'M0,0 C0.16,1 0.3,1 1,1');
    const context = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) { gsap.set('.projects-reveal', { opacity: 1, y: 0 }); return; }
      gsap.fromTo('.projects-reveal', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.95, ease: 'editorial', stagger: 0.07 });
    }, pageRef);
    return () => context.revert();
  }, []);

  useEffect(() => {
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.project-reveal', { opacity: 1, y: 0 });
        return;
      }
      gsap.utils.toArray<HTMLElement>('.project-reveal').forEach((element, index) => {
        gsap.fromTo(element, { autoAlpha: 0, y: 25 }, { autoAlpha: 1, y: 0, duration: 0.85, delay: (index % 2) * 0.08, ease: 'editorial', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
      });
    }, pageRef);
    return () => context.revert();
  }, [loading]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main ref={pageRef} className="container pb-24 pt-36">
        <header className="section-band mb-12 grid gap-8 pb-8 md:grid-cols-[1fr_.7fr] md:items-end">
          <div><p className="eyebrow projects-reveal mb-4">Selected work / 2023 to 2026</p><h1 className="projects-reveal section-heading">Projects, built with purpose.</h1></div>
          <p className="projects-reveal max-w-lg leading-7 text-muted-foreground">A collection of interfaces and web experiences shaped by curiosity, clarity, and a respect for the details.</p>
        </header>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-80 bg-muted" /><Skeleton className="h-80 bg-muted" /></div>
        ) : projects.length ? (
          <div className="project-grid">
            {projects.map((project, index) => (
              <article key={project.slug} className="project-item project-reveal group">
                <Link to={`/projects/${project.slug}`} className="block">
                  <div className="project-visual">
                    <span className="project-number">0{index + 1} / PROJECT</span>
                    <div className="visual-window" aria-hidden="true"><div className="window-bar"><i className="window-dot" /><i className="window-dot" /><i className="window-dot" /></div><div className="window-body"><div className="window-lines"><i className="window-line blue" /><i className="window-line" /><i className="window-line short" /><i className="window-line" /></div><div className="window-tile" /></div></div>
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4"><div><p className="eyebrow mb-2">{(project.tech_stack || []).join(' · ')}</p><h2 className="text-2xl font-semibold tracking-tight group-hover:text-[var(--blue)]">{project.title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{project.description}</p></div><ArrowUpRight className="mt-1 shrink-0 text-muted-foreground group-hover:text-[var(--blue)]" size={20} /></div>
                </Link>
                <div className="mt-4 flex gap-4">{project.github_url && <a className="eyebrow inline-flex items-center gap-2 hover:text-[var(--blue)]" href={project.github_url} target="_blank" rel="noreferrer"><Github size={14} /> Source</a>}{project.live_url && <a className="eyebrow inline-flex items-center gap-2 hover:text-[var(--blue)]" href={project.live_url} target="_blank" rel="noreferrer">Live site <ArrowUpRight size={14} /></a>}</div>
              </article>
            ))}
          </div>
        ) : (
          <div className="project-index-list">
            <div className="project-index-row project-reveal col-span-full"><span className="eyebrow">01</span><div><h2 className="text-xl font-semibold">Projects are on their way.</h2><p className="mt-1 text-sm text-muted-foreground">Take a look at my GitHub in the meantime.</p></div><a href="https://github.com/DaniyalAsif7778" target="_blank" rel="noreferrer" aria-label="Daniyal's GitHub"><Github className="text-[var(--blue)]" size={19} /></a></div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Projects;
