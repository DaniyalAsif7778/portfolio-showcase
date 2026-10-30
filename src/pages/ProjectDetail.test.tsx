import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectDetail from './ProjectDetail';

const { single, on } = vi.hoisted(() => ({ single: vi.fn(), on: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => {
  const channel = { on, subscribe: vi.fn(() => channel) };
  const query = { select: vi.fn(() => query), eq: vi.fn(() => query), single };
  return { supabase: {
    from: vi.fn(() => query),
    channel: vi.fn(() => channel),
    removeChannel: vi.fn(),
  } };
});
vi.mock('@/components/Navbar', () => ({ default: () => <nav>Navigation</nav> }));
vi.mock('@/components/Footer', () => ({ default: () => <footer>Footer</footer> }));
vi.mock('@/components/SEO', () => ({ default: () => null }));
vi.mock('@/components/ProjectVideoScrub', () => ({ default: () => <div>Project video</div> }));
vi.mock('framer-motion', () => ({ motion: new Proxy({}, { get: (_target, tag) => tag }) }));

const renderDetail = () => render(
  <MemoryRouter initialEntries={['/projects/demo']}>
    <Routes><Route path="/projects/:slug" element={<ProjectDetail />} /></Routes>
  </MemoryRouter>,
);

describe('ProjectDetail', () => {
  beforeEach(() => {
    single.mockReset();
    on.mockImplementation(function (this: unknown) { return this; });
  });

  it('renders the project after a successful fetch', async () => {
    single.mockResolvedValue({ data: { id: '1', slug: 'demo', title: 'Demo project', description: 'A demo', tech_stack: [], images: [] }, error: null });
    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Demo project' })).toBeInTheDocument();
  });

  it('distinguishes a failed request from an unknown project and lets the visitor retry', async () => {
    single.mockResolvedValueOnce({ data: null, error: { code: '500', message: 'database unavailable' } });
    single.mockResolvedValueOnce({ data: { id: '1', slug: 'demo', title: 'Demo recovered', description: 'A demo', tech_stack: [], images: [] }, error: null });
    renderDetail();

    expect(await screen.findByText(/could not load this project/i)).toBeInTheDocument();
    expect(screen.queryByText('Project not found')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByRole('heading', { name: 'Demo recovered' })).toBeInTheDocument();
    await waitFor(() => expect(single).toHaveBeenCalledTimes(2));
  });
});
