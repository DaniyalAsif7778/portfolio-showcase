import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Projects from './Projects';

const { projects } = vi.hoisted(() => ({ projects: [{ title: 'EMS', description: 'A MERN employee management app', tech_stack: ['React', 'Node.js'], slug: 'ems', video_url: null, github_url: 'https://github.com/example/ems', live_url: null }] }));
vi.mock('@/integrations/supabase/client', () => {
  const query = { select: () => query, order: () => query, then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: projects, error: null }).then(resolve) };
  const channel = { on: () => channel, subscribe: () => channel };
  return { supabase: { from: () => query, channel: () => channel, removeChannel: vi.fn() } };
});
vi.mock('@/hooks/useSiteSettings', () => ({ useSiteSettings: () => ({ settings: { name: 'Daniyal Asif', github_url: 'https://github.com/DaniyalAsif7778' } }) }));
vi.mock('@/components/Navbar', () => ({ default: () => <nav>Navigation</nav> }));
vi.mock('@/components/Footer', () => ({ default: () => <footer>Footer</footer> }));
vi.mock('@/components/ProjectVideoPreview', () => ({ default: () => null }));
vi.mock('gsap/CustomEase', () => ({ CustomEase: { create: vi.fn() } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { refresh: vi.fn() } }));
vi.mock('gsap', () => ({ gsap: { registerPlugin: vi.fn(), context: (callback: () => void) => { callback(); return { revert: vi.fn() }; }, set: vi.fn(), fromTo: vi.fn(), utils: { toArray: () => [] } } }));

describe('Projects page', () => {
  it('loads projects and links each card to its detail route', async () => {
    render(<MemoryRouter><Projects /></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'EMS' })).toBeInTheDocument();
    expect(screen.getByText('A MERN employee management app')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ems/i })).toHaveAttribute('href', '/projects/ems');
    await waitFor(() => expect(screen.queryByText(/projects could not be loaded/i)).not.toBeInTheDocument());
  });
});
