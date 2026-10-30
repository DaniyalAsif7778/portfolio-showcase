import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Admin from './Admin';

const { getAdminLoginStatus, getAdminToken, adminCall, adminLogin, toast } = vi.hoisted(() => ({ getAdminLoginStatus: vi.fn(), getAdminToken: vi.fn(), adminCall: vi.fn(), adminLogin: vi.fn(), toast: vi.fn() }));
vi.mock('@/lib/adminApi', () => ({ getAdminLoginStatus, getAdminToken, adminCall, adminLogin, adminUpload: vi.fn(), clearAdminToken: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast }) }));
vi.mock('@/components/admin/AdminHome', () => ({ default: () => null }));
vi.mock('@/components/admin/AdminAbout', () => ({ default: () => null }));
vi.mock('@/components/admin/AdminSkills', () => ({ default: () => null }));
vi.mock('@/integrations/supabase/client', () => {
  const query = { select: () => query, order: () => query, limit: () => query, then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve) };
  return { supabase: { from: () => query } };
});
vi.mock('framer-motion', () => ({ motion: new Proxy({}, { get: (_target, tag) => tag }) }));

describe('Admin page', () => {
  beforeEach(() => {
    getAdminLoginStatus.mockReset().mockResolvedValue(true);
    getAdminToken.mockReset().mockReturnValue(null);
    adminCall.mockReset().mockResolvedValue({});
    adminLogin.mockReset();
  });

  it('shows the sign-in form when there is no saved admin session', async () => {
    render(<Admin />);

    expect(await screen.findByText('Sign in to manage the content shown on your public portfolio.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled();
  });

  it('explains when Supabase admin credentials are not configured', async () => {
    getAdminLoginStatus.mockResolvedValue(false);
    render(<Admin />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/credentials are missing or malformed/i);
  });

  it('opens the project editor after authentication', async () => {
    adminLogin.mockImplementation(async () => { getAdminToken.mockReturnValue('session-token'); });
    render(<Admin />);
    await screen.findByText('Sign in to manage the content shown on your public portfolio.');
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'correct-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByRole('button', { name: /add your first project/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /add your first project/i }));
    expect(await screen.findByRole('heading', { name: 'Add a project' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('YouTube link or direct MP4/WebM URL')).toBeInTheDocument();
  });
});
