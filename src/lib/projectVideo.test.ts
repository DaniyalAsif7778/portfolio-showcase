import { describe, expect, it } from 'vitest';
import { getCloudinaryPlayerUrl, getPlayableVideoUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeVideoId } from './projectVideo';

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

describe('Cloudinary video URL handling', () => {
  it('accepts Cloudinary player embed URLs when required IDs are present', () => {
    const url = 'https://player.cloudinary.com/embed/?cloud_name=demo&public_id=videos%2Fsample';
    expect(getCloudinaryPlayerUrl(url)).toBe(url);
  });

  it('adds an MP4 format to extensionless Cloudinary video delivery URLs', () => {
    expect(getPlayableVideoUrl('https://res.cloudinary.com/demo/video/upload/v123/sample')).toBe('https://res.cloudinary.com/demo/video/upload/f_mp4/v123/sample');
  });

  it('leaves explicit formats and non-Cloudinary sources unchanged', () => {
    expect(getPlayableVideoUrl('https://res.cloudinary.com/demo/video/upload/sample.webm')).toBe('https://res.cloudinary.com/demo/video/upload/sample.webm');
    expect(getPlayableVideoUrl('https://cdn.example.com/video.mp4')).toBe('https://cdn.example.com/video.mp4');
  });
});
