import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import About from './About';
import Skills from './Skills';
import Privacy from './Privacy';
import Terms from './Terms';
import NotFound from './NotFound';

vi.mock('@/hooks/useSiteSettings', () => ({
  useSiteSettings: () => ({ settings: { name: 'Daniyal Asif', profile_image: '/portrait.png', about: { heading: 'About me', subtitle: 'My work', whoTitle: 'Who I am', paragraphs: ['I build MERN applications.'], location: 'Rawalpindi', email: 'hello@example.com', phone: '', educationTitle: 'Education', education: [], goalsTitle: 'Exploring', goals: [], languagesTitle: 'Languages', languages: [] } }, loading: false }),
}));
vi.mock('@/hooks/useSkills', () => ({ useSkills: () => ({ skills: [{ id: 'react', name: 'React', category: 'Frontend', color: '#0f766e' }], loading: false }) }));
vi.mock('@/components/Navbar', () => ({ default: () => <nav>Navigation</nav> }));
vi.mock('@/components/Footer', () => ({ default: () => <footer>Footer</footer> }));
vi.mock('@/components/SectionHeader', () => ({ default: ({ title }: { title: string }) => <h1>{title}</h1> }));
vi.mock('@/components/SEO', () => ({ default: () => null }));
vi.mock('framer-motion', () => ({ motion: new Proxy({}, { get: (_target, tag) => tag }) }));

describe('content pages', () => {
  it('renders About details from the site settings hook', () => {
    render(<About />);
    expect(screen.getByText('Who I am')).toBeInTheDocument();
    expect(screen.getByText('I build MERN applications.')).toBeInTheDocument();
    expect(screen.getByText('hello@example.com')).toBeInTheDocument();
  });

  it('renders skill categories and entries from the skills hook', () => {
    render(<Skills />);
    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders legal pages and marks an unknown route with a path back home', () => {
    const { unmount } = render(<Privacy />);
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
    unmount();
    const { unmount: unmountTerms } = render(<Terms />);
    expect(screen.getByRole('heading', { name: 'Terms and Conditions' })).toBeInTheDocument();
    unmountTerms();

    render(<MemoryRouter initialEntries={['/missing-route']}><NotFound /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to Home' })).toHaveAttribute('href', '/');
  });
});
