import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Profiles from './Profiles';

const { dispatch } = vi.hoisted(() => ({ dispatch: vi.fn() }));
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (select: (state: unknown) => unknown) => select({ github: { profile: { login: 'DaniyalAsif7778', name: 'Daniyal Asif', avatar_url: '/avatar.png', html_url: 'https://github.com/DaniyalAsif7778', bio: 'MERN developer', public_repos: 8, followers: 12 }, repos: [{ id: 1, name: 'portfolio-showcase', description: 'Portfolio source', html_url: 'https://github.com/DaniyalAsif7778/portfolio-showcase', language: 'TypeScript', stargazers_count: 2, forks_count: 1 }], loading: false, error: null } }),
}));
vi.mock('@/hooks/useSiteSettings', () => ({ useSiteSettings: () => ({ settings: { name: 'Daniyal Asif', tagline: 'MERN developer', github_url: 'https://github.com/DaniyalAsif7778', linkedin_url: 'https://www.linkedin.com/in/daniyal-asif-25ba10332/', linkedin_banner_url: null, profile_image: '/portrait.png', about: { location: 'Rawalpindi' } } }) }));
vi.mock('@/components/Navbar', () => ({ default: () => <nav>Navigation</nav> }));
vi.mock('@/components/Footer', () => ({ default: () => <footer>Footer</footer> }));
vi.mock('@/components/SEO', () => ({ default: () => null }));

describe('Profiles page', () => {
  it('shows LinkedIn identity and live GitHub profile and repository details', () => {
    render(<Profiles />);

    expect(screen.getAllByRole('heading', { name: 'Daniyal Asif' })).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Daniyal Asif LinkedIn profile banner' })).toHaveAttribute('src', '/daniyal-linkedin-banner.jpg');
    expect(screen.getByText('12 followers')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recently updated' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /portfolio-showcase/i })).toHaveAttribute('href', 'https://github.com/DaniyalAsif7778/portfolio-showcase');
  });
});
