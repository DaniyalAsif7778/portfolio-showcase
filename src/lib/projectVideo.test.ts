import { describe, expect, it } from 'vitest';
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeVideoId } from './projectVideo';

describe('project video URL handling', () => {
  it.each([
    ['watch URL', 'https://www.youtube.com/watch?v=09hz6zKQJ60'],
    ['short URL', 'https://youtu.be/09hz6zKQJ60'],
    ['embed URL', 'https://www.youtube-nocookie.com/embed/09hz6zKQJ60'],
    ['shorts URL', 'https://youtube.com/shorts/09hz6zKQJ60'],
  ])('parses a valid %s', (_label, url) => {
    expect(getYouTubeVideoId(url)).toBe('09hz6zKQJ60');
    expect(getYouTubeEmbedUrl(url)).toBe('https://www.youtube-nocookie.com/embed/09hz6zKQJ60?rel=0&playsinline=1');
    expect(getYouTubeThumbnailUrl(url)).toContain('/09hz6zKQJ60/');
  });

  it.each(['', null, undefined, 'not a URL', 'https://youtube.com.evil.test/watch?v=09hz6zKQJ60', 'https://youtube.com/watch?v=short'])('rejects invalid source %s', (url) => {
    expect(getYouTubeVideoId(url)).toBeNull();
    expect(getYouTubeEmbedUrl(url)).toBeNull();
    expect(getYouTubeThumbnailUrl(url)).toBeNull();
  });
});
