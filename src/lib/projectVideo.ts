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

/** Cloudinary's player share URL is an iframe endpoint, not a native video source. */
export const getCloudinaryPlayerUrl = (source?: string | null): string | null => {
  if (!source) return null;
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'player.cloudinary.com' || url.pathname !== '/embed/') return null;
    if (!url.searchParams.get('cloud_name') || !url.searchParams.get('public_id')) return null;
    return url.toString();
  } catch {
    return null;
  }
};

/** Add a browser-friendly MP4 delivery format to extensionless Cloudinary asset URLs. */
export const getPlayableVideoUrl = (source?: string | null): string | null => {
  if (!source) return null;
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || !/(^|\.)cloudinary\.com$/i.test(url.hostname) || !url.pathname.includes('/video/upload/')) return source;
    if (/\.(mp4|webm|ogv|mov|m3u8)$/i.test(url.pathname)) return source;
    const segments = url.pathname.split('/');
    const uploadIndex = segments.indexOf('upload');
    if (uploadIndex < 0) return source;
    segments.splice(uploadIndex + 1, 0, 'f_mp4');
    return `${url.origin}${segments.join('/')}${url.search}`;
  } catch {
    return source;
  }
};
