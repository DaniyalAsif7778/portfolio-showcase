import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Footer from './Footer';
import Navbar from './Navbar';
import { NavLink } from './NavLink';
import SectionHeader from './SectionHeader';
import SkillCircle from './SkillCircle';

const { setTheme } = vi.hoisted(() => ({ setTheme: vi.fn() }));
vi.mock('@/hooks/useSiteSettings', () => ({ useSiteSettings: () => ({ settings: { name: 'Daniyal Asif', badge: 'MERN Stack Developer', github_url: 'https://github.com/DaniyalAsif7778', linkedin_url: 'https://linkedin.com/in/daniyal', about: { email: 'hello@example.com' } } }) }));
vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light', setTheme }) }));
vi.mock('framer-motion', () => ({ motion: new Proxy({}, { get: (_target, tag) => tag }) }));

describe('shared portfolio components', () => {
  it('opens the small-screen navigation and toggles to dark theme', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    const menu = screen.getByRole('button', { name: 'Open navigation menu' });
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(menu).toHaveClass('md:hidden');
    fireEvent.click(menu);
    expect(screen.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('renders the footer identity, policy links, and configured contact links', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.getByText(/Daniyal Asif\. All rights reserved/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'Terms and Conditions' })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: 'Send email' })).toHaveAttribute('href', 'mailto:hello@example.com');
  });

  it('supports requested heading semantics and active navigation classes', () => {
    const { rerender } = render(<SectionHeader as="h1" title="Selected work" subtitle="Recent projects" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Selected work' })).toBeInTheDocument();
    expect(screen.getByText('Recent projects')).toBeInTheDocument();

    rerender(<MemoryRouter initialEntries={['/projects']}><Routes><Route path="/projects" element={<NavLink to="/projects" className="base" activeClassName="active">Projects</NavLink>} /></Routes></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveClass('base', 'active');
  });

  it('renders the skill percentage and label', () => {
    render(<SkillCircle name="React" percentage={85} color="#0f766e" />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });
});
