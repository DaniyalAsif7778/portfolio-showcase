import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectVideoPreview from '@/components/ProjectVideoPreview';
import { defaultAbout, useSiteSettings } from '@/hooks/useSiteSettings';
import { useSkills } from '@/hooks/useSkills';
import { supabase } from '@/integrations/supabase/client';
import { withCurrentProjectContent } from '@/lib/featuredProjectContent';
import { getYouTubeThumbnailUrl } from '@/lib/projectVideo';
import SEO from '@/components/SEO';

type Project = {
  title: string;
  description: string;
  tech_stack: string[] | null;
  github_url: string | null;
  live_url: string | null;
  slug: string;
  images: string[] | null;
  video_url: string | null;
};

const easing = 'M0,0 C0.16,1 0.3,1 1,1';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const projectsSectionRef = useRef<HTMLElement>(null);
  const projectsPinRef = useRef<HTMLDivElement>(null);
  const projectsViewportRef = useRef<HTMLDivElement>(null);
  const projectsTrackRef = useRef<HTMLDivElement>(null);
  const { settings } = useSiteSettings();
  const { skills } = useSkills();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoadError, setProjectsLoadError] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const [projectDeckPinned, setProjectDeckPinned] = useState(false);
  const about = { ...defaultAbout, ...settings.about };
  const homepageSkills = skills.some((skill) => skill.featured) ? skills.filter((skill) => skill.featured) : skills;
  const skillGroups = Array.from(new Set(homepageSkills.map((skill) => skill.category)));

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }, [location.hash]);

  useEffect(() => {
    let active = true;
    const loadProjects = async () => {
      const result = await supabase.from('projects').select('title, description, tech_stack, github_url, live_url, slug, images, video_url').order('sort_order').order('created_at', { ascending: false });
      if (result.error && /video_url/i.test(result.error.message)) {
        const fallback = await supabase.from('projects').select('title, description, tech_stack, github_url, live_url, slug, images').order('sort_order').order('created_at', { ascending: false });
        if (fallback.error) {
          console.error('Unable to load portfolio projects:', fallback.error.message);
          if (active) setProjectsLoadError(true);
          return;
        }
        if (active) {
          setProjects((fallback.data || []).map((project) => withCurrentProjectContent({ ...project, video_url: null })));
          setProjectsLoadError(false);
        }
        return;
      }
      if (result.error) {
        console.error('Unable to load portfolio projects:', result.error.message);
        if (active) setProjectsLoadError(true);
        return;
      }
      if (active) {
        setProjects(((result.data as Project[]) || []).map(withCurrentProjectContent));
        setProjectsLoadError(false);
      }
    };
    const projectUpdates = supabase
      .channel('home-projects-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        void loadProjects().catch((error: unknown) => console.error('Unable to refresh portfolio projects:', error));
      })
      .subscribe();
    void loadProjects().catch((error: unknown) => {
      console.error('Unable to load portfolio projects:', error);
      if (active) setProjectsLoadError(true);
    });
    return () => {
      active = false;
      void supabase.removeChannel(projectUpdates);
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(CustomEase, ScrollTrigger);
    CustomEase.create('editorial', easing);
    const context = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>('.home-reveal');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(targets, { opacity: 1, y: 0, clearProps: 'visibility' });
        return;
      }
      targets.forEach((element, index) => {
        gsap.fromTo(element, { autoAlpha: 0, y: 25 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: 'editorial',
          delay: element.classList.contains('hero-reveal') ? 0.1 + index * 0.05 : (index % 3) * 0.07,
          scrollTrigger: { trigger: element, start: element.classList.contains('hero-reveal') ? 'top 95%' : 'top 88%', once: true },
        });
      });
    }, pageRef);
    return () => context.revert();
  }, [skills.length]);

  useEffect(() => {
    if (projects.length < 2) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    let refreshFrame = 0;
    media.add('(min-width: 768px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)', () => {
      const section = projectsSectionRef.current;
      const pin = projectsPinRef.current;
      const track = projectsTrackRef.current;
      const viewport = projectsViewportRef.current;
      if (!section || !pin || !viewport || !track) return;

      setProjectDeckPinned(true);
      const tween = gsap.to(track, {
        xPercent: -100 * (projects.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin,
          start: 'top top',
          end: () => {
            const viewportWidth = viewport.clientWidth;
            if (!viewportWidth) return '+=0';
            const horizontalDistance = Math.max(0, track.scrollWidth - viewportWidth);
            const viewportCount = horizontalDistance / viewportWidth;
            const scrollRoomPerProject = window.innerHeight * 1.15;
            return `+=${Math.ceil(viewportCount * scrollRoomPerProject)}`;
          },
          scrub: 0.65,
          anticipatePin: 1,
          pinSpacing: true,
          invalidateOnRefresh: true,
          snap: {
            snapTo: (progress) => Math.round(progress * (projects.length - 1)) / (projects.length - 1),
            duration: { min: 0.4, max: 0.65 },
            delay: 0.2,
            ease: 'power2.out',
            inertia: false,
          },
          onUpdate: (self) => {
            const next = Math.round(self.progress * (projects.length - 1));
            setActiveProject((current) => current === next ? current : next);
          },
        },
      });
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        cancelAnimationFrame(refreshFrame);
        setProjectDeckPinned(false);
        setActiveProject(0);
      };
    });
    return () => {
      cancelAnimationFrame(refreshFrame);
      media.revert();
    };
  }, [projects.length]);

  return (
    <div ref={pageRef} className="min-h-screen bg-background">
      <SEO
        title={`${settings.name} | ${settings.badge} Portfolio`}
        description={settings.intro}
        image={settings.profile_image || '/daniyal-profile.png'}
        path="/"
        structuredData={{
          '@type': 'Person',
          name: settings.name,
          jobTitle: settings.badge,
          image: settings.profile_image || '/daniyal-profile.png',
          url: `${import.meta.env.VITE_SITE_URL || 'https://daniyal-porfolio-three.vercel.app'}/`,
          sameAs: [settings.github_url, settings.linkedin_url].filter(Boolean),
          address: { '@type': 'PostalAddress', addressLocality: about.location, addressCountry: 'PK' },
          knowsAbout: ['MongoDB', 'Express.js', 'React', 'Node.js', 'TypeScript', 'REST APIs', 'Responsive web design'],
        }}
      />
      <Navbar />
      <main>
        <section id="home" className="container hero-grid scroll-mt-24" aria-labelledby="hero-title">
          <div className="hero-art hero-reveal">
            <div className="hero-portrait-frame"><img className="hero-portrait" src={settings.profile_image || '/daniyal-profile.png'} alt={`Portrait of ${settings.name}, ${settings.badge}`} width="800" height="800" /></div>
          </div>
          <div className="hero-copy">
            <p className="eyebrow hero-reveal mb-7 flex items-center gap-3"><span className="h-px w-8 bg-[var(--green)]" />{settings.badge}<span className="text-[var(--green)]">/</span>{about.location || 'Pakistan'}</p>
            <h1 id="hero-title" className="hero-title hero-reveal">Building clear, <em>considered</em> digital experiences.</h1>
            <p className="hero-lede hero-reveal mt-7">{settings.intro}</p>
            <div className="hero-reveal mt-9 flex flex-wrap items-center gap-3">
              <a href="/#projects" onClick={(event) => { event.preventDefault(); navigate('/#projects'); document.getElementById('projects')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }} className="inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:brightness-110">Explore my work <ArrowUpRight size={16} /></a>
              <a href="/Daniyal_Asif_CV.pdf" download className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3.5 text-sm font-semibold hover:border-[var(--blue)]">Download CV <ArrowDown size={15} /></a>
            </div>
            <div className="hero-reveal mt-8 flex items-center gap-5">
              <a href={settings.github_url} target="_blank" rel="noreferrer" aria-label="GitHub profile" className="text-muted-foreground hover:text-foreground"><Github size={18} /></a>
              {settings.linkedin_url && <a href={settings.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn profile" className="text-muted-foreground hover:text-foreground"><Linkedin size={18} /></a>}
              <span className="h-px w-12 bg-border" /><span className="eyebrow">{settings.tagline}</span>
            </div>
          </div>
        </section>

        <section id="skills" className="skills-stage scroll-mt-20" aria-labelledby="skills-title">
          <div className="container skills-stage-inner">
            <div className="skills-intro home-reveal"><p className="eyebrow text-white/70">01 / The toolkit</p><h2 id="skills-title" className="skills-title">Skills with a purpose.</h2><p className="mt-5 max-w-md text-base leading-7 text-white/75">A practical toolkit for designing, building, and shipping responsive web experiences.</p></div>
            <div className="skills-groups">
              {skillGroups.map((category, groupIndex) => (
                <article className={`skill-group skill-group-${groupIndex % 4} home-reveal`} key={category}>
                  <p className="eyebrow mb-5">{String(groupIndex + 1).padStart(2, '0')} / {category}</p>
                  <ul>{homepageSkills.filter((skill) => skill.category === category).map((skill) => <li key={skill.id}>{skill.name}</li>)}</ul>
                </article>
              ))}
            </div>
            <p className="skills-footnote home-reveal">Curious by default. Always learning.</p>
          </div>
        </section>

        <section id="projects" ref={projectsSectionRef} className="projects-section scroll-mt-20" aria-label="Project showcase">
          <h2 className="sr-only">Featured projects</h2>
          <div ref={projectsPinRef} className="projects-pin">
            <div ref={projectsViewportRef} className="projects-viewport" role="region" aria-label="Selected projects">
              {projectsLoadError ? <div className="project-empty-state"><p>Projects couldn’t load.</p><span>Please refresh the page and try again.</span></div> : projects.length ? <div ref={projectsTrackRef} className="projects-track">
                {projects.map((project, index) => <article key={project.slug} className={`project-slide project-slide-${index % 4}`} aria-label={`Project ${index + 1} of ${projects.length}: ${project.title}`} aria-hidden={projectDeckPinned && activeProject !== index}>
                  <div className="project-slide-art group">
                    {project.images?.[0] || getYouTubeThumbnailUrl(project.video_url) ? <img src={project.images?.[0] || getYouTubeThumbnailUrl(project.video_url) || ''} alt={`${project.title} interface preview`} loading={index === 0 ? 'eager' : 'lazy'} /> : <div className="project-art-placeholder" aria-hidden="true"><div className="mock-browser"><div className="mock-browser-bar"><i /><i /><i /><span>{project.slug}.app</span></div><div className="mock-browser-content"><b>{project.title}</b><div /><div /><div /><span /></div></div><span className="art-orbit art-orbit-a" /><span className="art-orbit art-orbit-b" /></div>}
                    {project.video_url && <ProjectVideoPreview src={project.video_url} poster={project.images?.[0]} title={project.title} />}
                    <span className="project-art-caption">PROJECT PREVIEW</span>
                  </div>
                  <div className="project-slide-copy">
                    <span className="eyebrow project-slide-type">Featured project</span>
                    <h2>{project.title}</h2>
                    <p>{project.description}</p>
                    <div className="project-slide-stack">{(project.tech_stack || []).map((tech) => <span key={tech}>{tech}</span>)}</div>
                    <Link to={`/projects/${project.slug}`} tabIndex={projectDeckPinned && activeProject !== index ? -1 : 0} className="project-slide-link">Explore the project <ArrowUpRight size={18} /></Link>
                  </div>
                </article>)}
              </div> : <div className="project-empty-state"><p>New work is taking shape.</p><span>Selected projects will appear here.</span></div>}
            </div>
          </div>
        </section>

        <section id="about" className="about-section scroll-mt-20" aria-labelledby="about-title">
          <div className="container about-grid">
            <div className="about-card home-reveal">
              <div className="about-profile"><p className="eyebrow mb-3">03 / About</p><h2 id="about-title" className="section-heading">About {settings.name.split(' ')[0]}.</h2><div className="about-photo-wrap"><img src={settings.profile_image || '/daniyal-profile.png'} alt={`Portrait of ${settings.name}`} width="800" height="800" loading="lazy" /></div></div>
              <div className="about-copy">
              <h3>{about.whoTitle}</h3>
              {about.paragraphs.filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              <div className="about-facts"><div><MapPin size={16} /><span>{about.location}</span></div>{about.email && <div><Mail size={16} /><a href={`mailto:${about.email}`}>{about.email}</a></div>}</div>
              {about.education.length > 0 && <div className="about-subsection"><p className="eyebrow">Education</p>{about.education.map((entry) => <div className="education-row" key={`${entry.title}-${entry.school}`}><div><strong>{entry.title}</strong><span>{entry.school}</span></div><time>{entry.period}</time></div>)}</div>}
              {about.goals.filter(Boolean).length > 0 && <div className="about-languages"><p className="eyebrow">{about.goalsTitle}</p><ul className="about-goals">{about.goals.filter(Boolean).map((goal) => <li key={goal}>{goal}</li>)}</ul></div>}
              {about.languages.filter(Boolean).length > 0 && <div className="about-languages"><p className="eyebrow">Languages</p><div>{about.languages.filter(Boolean).map((language) => <span key={language}>{language}</span>)}</div></div>}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section scroll-mt-20" aria-labelledby="contact-title">
          <div className="container py-24"><div className="contact-panel home-reveal">
            <div><p className="eyebrow mb-4">04 / Start a conversation</p><h2 id="contact-title" className="contact-title">Have a good idea?<br />Let’s make it real.</h2><p className="mt-5 max-w-xl leading-7 text-muted-foreground">I’m open to thoughtful collaborations, frontend opportunities, and projects that make the web easier to use.</p></div>
            <div className="contact-actions"><Link className="contact-email" to="/contact">Send a message <ArrowUpRight size={16} /></Link>{about.email && <a className="contact-social" href={`mailto:${about.email}`}><Mail size={17} />{about.email}</a>}{settings.linkedin_url && <a className="contact-social" href={settings.linkedin_url} target="_blank" rel="noreferrer"><Linkedin size={17} />Connect on LinkedIn</a>}<Link className="contact-social" to="/github"><Github size={17} />View GitHub profile</Link></div>
          </div></div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
