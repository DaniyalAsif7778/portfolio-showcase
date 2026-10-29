import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type ProjectVideoScrubProps = {
  src: string;
  poster?: string | null;
  title: string;
};

/** Scroll scrubbing is enabled after metadata loads; reduced-motion users get native controls. */
const ProjectVideoScrub = ({ src, poster, title }: ProjectVideoScrubProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(preference.matches);
    const updatePreference = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    preference.addEventListener('change', updatePreference);

    const video = videoRef.current;
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!video || !section || !frame) return () => preference.removeEventListener('change', updatePreference);

    gsap.registerPlugin(ScrollTrigger);
    let tween: gsap.core.Tween | undefined;
    const setupScrub = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const isDesktop = window.matchMedia('(min-width: 900px)').matches;
      video.pause();
      tween = gsap.to(video, {
        currentTime: video.duration,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: isDesktop ? frame : false,
          start: 'top top',
          end: () => `+=${window.innerHeight * (isDesktop ? 2.2 : 1.4)}`,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: () => { if (!video.paused) video.pause(); },
        },
      });
    };

    video.addEventListener('loadedmetadata', setupScrub);
    if (video.readyState >= 1) setupScrub();
    return () => {
      preference.removeEventListener('change', updatePreference);
      video.removeEventListener('loadedmetadata', setupScrub);
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, [src]);

  return (
    <section ref={sectionRef} className="project-film-section" aria-label={`${title} project film`}>
      <div className="project-film-intro"><p className="eyebrow">A closer look / Scroll to play</p><h2>In motion.</h2><p>Scroll through the presentation. The footage follows your pace.</p></div>
      <div ref={frameRef} className="project-film-frame">
        <video ref={videoRef} src={src} poster={poster || undefined} preload="metadata" muted playsInline controls={reducedMotion} aria-label={`${title} video presentation; scroll to scrub through the footage`}>
          Your browser does not support embedded video.
        </video>
        <span className="project-film-caption">SCROLL CONTROLLED PRESENTATION</span>
      </div>
    </section>
  );
};

export default ProjectVideoScrub;
