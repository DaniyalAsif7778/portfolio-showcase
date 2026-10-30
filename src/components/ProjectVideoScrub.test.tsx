import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectVideoScrub from './ProjectVideoScrub';

const { add, to } = vi.hoisted(() => ({ add: vi.fn(), to: vi.fn() }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));
vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    matchMedia: () => ({ add, revert: vi.fn() }),
    to,
  },
}));

describe('ProjectVideoScrub', () => {
  beforeEach(() => {
    add.mockReset().mockImplementation((_conditions: unknown, callback: (context: unknown) => void) => callback({ conditions: { reduceMotion: false, wideScreen: true } }));
    to.mockReset().mockReturnValue({ kill: vi.fn(), scrollTrigger: { kill: vi.fn() } });
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  });

  it('scrubs a direct video against scroll and pins the frame on wide screens', () => {
    render(<ProjectVideoScrub src="https://cdn.example.com/demo.mp4" title="Demo" />);
    const video = screen.getByLabelText(/use the controls or scroll to scrub/i) as HTMLVideoElement;
    Object.defineProperty(video, 'duration', { configurable: true, value: 12 });
    fireEvent.loadedMetadata(video);

    expect(add).toHaveBeenCalledOnce();
    expect(to).toHaveBeenCalledWith(video, expect.objectContaining({ currentTime: 12, ease: 'none' }));
    const options = to.mock.calls[0][1];
    expect(options.scrollTrigger).toMatchObject({ trigger: expect.any(HTMLElement), pin: expect.any(HTMLElement), scrub: true, invalidateOnRefresh: true });
    expect(options.scrollTrigger.end()).toBe(`+=${Math.ceil(12 * Math.max(32, window.innerHeight / 10))}`);
  });

  it('uses an embedded player for YouTube links instead of attempting video scrubbing', () => {
    render(<ProjectVideoScrub src="https://youtu.be/09hz6zKQJ60" title="Demo" />);
    expect(screen.getByTitle('Demo project video')).toHaveAttribute('src', expect.stringContaining('/embed/09hz6zKQJ60'));
    expect(add).not.toHaveBeenCalled();
    expect(to).not.toHaveBeenCalled();
  });
});
