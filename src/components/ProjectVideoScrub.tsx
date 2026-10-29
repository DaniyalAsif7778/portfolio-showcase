import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getYouTubeEmbedUrl } from '@/lib/projectVideo';

type ProjectVideoScrubProps = {
  src: string;
  poster?: string | null;
  title: string;
};

/** Direct videos keep native controls; scroll scrubbing is disabled for reduced-motion users. */
const ProjectVideoScrub = ({ src, poster, title }: ProjectVideoScrubProps) => {
  const youtubeEmbedUrl = getYouTubeEmbedUrl(src);
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!video || !section || !frame) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    let mediaInitialized = false;
    const setupScrub = () => {
      if (mediaInitialized || !Number.isFinite(video.duration) || video.duration <= 0) return;
      mediaInitialized = true;
      media.add({
        reduceMotion: '(prefers-reduced-motion: reduce)',
        wideScreen: '(min-width: 900px)',
      }, (context) => {
        if (context.conditions?.reduceMotion) {
          video.pause();
          return;
        }

        video.pause();
        const pinVideo = Boolean(context.conditions?.wideScreen);
        const getScrollDistance = () => Math.ceil(video.duration * Math.max(32, window.innerHeight / 10));
        const tween = gsap.to(video, {
          currentTime: video.duration,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: pinVideo ? frame : false,
            start: 'top top',
            end: () => `+=${getScrollDistance()}`,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: () => { if (!video.paused) video.pause(); },
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
    };

    video.addEventListener('loadedmetadata', setupScrub);
    if (video.readyState >= 1) setupScrub();
    return () => {
      video.removeEventListener('loadedmetadata', setupScrub);
      media.revert();
      video.pause();
    };
  }, [src]);

  return (
    <section ref={sectionRef} className="project-film-section" aria-label={`${title} project film`}>
      <div className="project-film-intro"><p className="eyebrow">{youtubeEmbedUrl ? 'Project video' : 'A closer look / Scroll to play'}</p><h2>{youtubeEmbedUrl ? 'Watch the demo.' : 'In motion.'}</h2><p>{youtubeEmbedUrl ? 'Play the walkthrough to see the project in action.' : 'Scroll through the presentation. The footage follows your pace.'}</p></div>
      <div ref={frameRef} className="project-film-frame">
        {youtubeEmbedUrl ? (
          <iframe src={youtubeEmbedUrl} title={`${title} project video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        ) : (
          <video ref={videoRef} src={src} poster={poster || undefined} preload="metadata" playsInline controls aria-label={`${title} video presentation; use the controls or scroll to scrub through the footage`}>
            Your browser does not support embedded video.
          </video>
        )}
        <span className="project-film-caption">{youtubeEmbedUrl ? 'YOUTUBE PROJECT WALKTHROUGH' : 'SCROLL CONTROLLED PRESENTATION'}</span>
      </div>
    </section>
  );
};

export default ProjectVideoScrub;
