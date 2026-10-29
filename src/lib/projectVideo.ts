const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export const getYouTubeVideoId = (source?: string | null): string | null => {
  if (!source) return null;

  try {
    const url = new URL(source);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let id: string | null = null;

    if (host === 'youtu.be') {
      id = url.pathname.split('/').filter(Boolean)[0] || null;
    } else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v');
      else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] || null;
    }

    return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
  } catch {
    return null;
  }
};

export const getYouTubeEmbedUrl = (source?: string | null): string | null => {
  const id = getYouTubeVideoId(source);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1` : null;
};

export const getYouTubeThumbnailUrl = (source?: string | null): string | null => {
  const id = getYouTubeVideoId(source);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};
