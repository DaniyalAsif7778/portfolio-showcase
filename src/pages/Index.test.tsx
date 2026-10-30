import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Index from './Index';

const { horizontalTo, projects } = vi.hoisted(() => ({
  horizontalTo: vi.fn(),
  projects: [
    { title: 'Project One', description: 'First project', tech_stack: ['React'], slug: 'one', images: [], video_url: null },
    { title: 'Project Two', description: 'Second project', tech_stack: ['Node'], slug: 'two', images: [], video_url: null },
    { title: 'Project Three', description: 'Third project', tech_stack: ['MongoDB'], slug: 'three', images: [], video_url: null },
  ],
}));

vi.mock('@/integrations/supabase/client', () => {
  const query = {
    select: () => query,
    order: () => query,
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: projects, error: null }).then(resolve),
  };
  const channel = { on: () => channel, subscribe: () => channel };
  return { supabase: { from: () => query, channel: () => channel, removeChannel: vi.fn() } };
});
vi.mock('@/hooks/useSiteSettings', () => ({
  defaultAbout: { location: 'Rawalpindi', paragraphs: ['About Daniyal'], education: [], goals: [], languages: [] },
  useSiteSettings: () => ({ settings: { name: 'Daniyal Asif', badge: 'MERN Stack Developer', intro: 'Building useful web apps.', tagline: 'Full stack developer', github_url: 'https://github.com/DaniyalAsif7778', linkedin_url: '', profile_image: null, about: { heading: 'About', whoTitle: 'Who I am', location: 'Rawalpindi', email: 'hello@example.com', paragraphs: ['About Daniyal'], education: [], educationTitle: 'Education', goals: [], goalsTitle: 'Exploring', languages: [] } } }),
}));
vi.mock('@/hooks/useSkills', () => ({ useSkills: () => ({ skills: [{ id: '1', name: 'React', category: 'Frontend', featured: true }], loading: false }) }));
vi.mock('@/components/Navbar', () => ({ default: () => <nav>Navigation</nav> }));
vi.mock('@/components/Footer', () => ({ default: () => <footer>Footer</footer> }));
vi.mock('@/components/SEO', () => ({ default: () => null }));
vi.mock('@/components/ProjectVideoPreview', () => ({ default: () => null }));
vi.mock('gsap/CustomEase', () => ({ CustomEase: { create: vi.fn() } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { refresh: vi.fn() } }));
vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    context: (callback: () => void) => { callback(); return { revert: vi.fn() }; },
    utils: { toArray: () => [] },
    set: vi.fn(),
    fromTo: vi.fn(),
    matchMedia: () => ({ add: (_query: string, callback: () => void) => callback(), revert: vi.fn() }),
    to: horizontalTo,
  },
}));

describe('home page', () => {
  beforeEach(() => {
    horizontalTo.mockReset();
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return this.classList?.contains('projects-viewport') ? 1000 : 0; } });
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get() { return this.classList?.contains('projects-track') ? 3000 : 0; } });
  });
  afterEach(() => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).clientWidth;
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollWidth;
  });

  it('shows the portrait first and renders each project in the horizontally pinned showcase', async () => {
    render(<MemoryRouter><Index /></MemoryRouter>);

    expect(screen.getByRole('img', { name: 'Portrait of Daniyal Asif, MERN Stack Developer' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /building clear, considered digital experiences/i })).toBeInTheDocument();
    expect((await screen.findAllByText('Project One')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Project Two').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Project Three').length).toBeGreaterThan(0);
    await waitFor(() => expect(horizontalTo).toHaveBeenCalled());
    const config = horizontalTo.mock.calls[0][1];
    expect(config.xPercent).toBe(-200);
    expect(config.scrollTrigger).toMatchObject({ scrub: 0.65, invalidateOnRefresh: true, pinSpacing: true });
    expect(config.scrollTrigger.end()).toBe('+=1767');
  });
});
