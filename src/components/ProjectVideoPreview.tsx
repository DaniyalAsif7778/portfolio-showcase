import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { getYouTubeEmbedUrl } from '@/lib/projectVideo';

type ProjectVideoPreviewProps = {
  src: string;
  title: string;
  poster?: string | null;
};

/** Loads the actual player only after the visitor chooses to watch. */
const ProjectVideoPreview = ({ src, title, poster }: ProjectVideoPreviewProps) => {
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const youtubeUrl = getYouTubeEmbedUrl(src);
  const finishPlayback = () => {
    setPlaying(false);
    setCompleted(true);
  };

  useEffect(() => {
    if (!playing || !youtubeUrl) return;

    const iframe = iframeRef.current;
    const handleMessage = (event: MessageEvent<string>) => {
      if (event.source !== iframe?.contentWindow) return;
      if (event.origin !== 'https://www.youtube-nocookie.com' && event.origin !== 'https://www.youtube.com') return;

      try {
        const message = JSON.parse(event.data) as { event?: string; info?: number };
        if (message.event === 'onStateChange' && message.info === 0) finishPlayback();
      } catch {
        // Ignore non-player messages from the embedded frame.
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playing, youtubeUrl]);

  const subscribeToYouTubeEnd = () => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }),
      'https://www.youtube-nocookie.com',
    );
  };

  return (
    <div
      className="absolute inset-0 z-10"
      onMouseLeave={() => { if (completed) setCompleted(false); }}
      onTouchStart={() => { if (completed) setCompleted(false); }}
    >
      {playing ? youtubeUrl ? (
        <iframe
          ref={iframeRef}
          className="absolute inset-0 h-full w-full border-0"
          src={`${youtubeUrl}&autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
          title={`${title} project video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={subscribeToYouTubeEnd}
          allowFullScreen
        />
      ) : (
        <video className="absolute inset-0 h-full w-full bg-black object-contain" src={src} poster={poster || undefined} controls autoPlay playsInline preload="auto" onEnded={finishPlayback} aria-label={`${title} project video`} />
      ) : (
        <button
          type="button"
          data-completed={completed}
          className={`project-video-play absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/25 text-white transition-opacity hover:bg-black/45 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-6px] focus-visible:outline-white ${completed ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}
          onClick={() => setPlaying(true)}
          aria-label={`Watch ${title} project video`}
        >
          <span className="grid h-16 w-16 place-items-center rounded-full border border-white/70 bg-black/55 shadow-xl backdrop-blur-sm">
            <Play size={24} fill="currentColor" aria-hidden="true" />
          </span>
          <span className="rounded-full bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-sm">Watch video</span>
        </button>
      )}
    </div>
  );
};

export default ProjectVideoPreview;
