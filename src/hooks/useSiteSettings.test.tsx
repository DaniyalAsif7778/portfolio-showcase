import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultAbout, defaultSettings, useSiteSettings } from './useSiteSettings';

const { maybeSingle } = vi.hoisted(() => ({ maybeSingle: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
  },
}));

describe('useSiteSettings', () => {
  beforeEach(() => {
    maybeSingle.mockReset();
  });

  it('loads the saved row and fills missing About fields from defaults', async () => {
    maybeSingle.mockResolvedValue({
      data: {
        name: 'Daniyal Updated',
        badge: 'MERN Developer',
        intro: 'New intro copy',
        about_content: { email: 'hello@example.com' },
      },
      error: null,
    });

    const { result } = renderHook(() => useSiteSettings());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.settings.name).toBe('Daniyal Updated');
    expect(result.current.settings.intro).toBe('New intro copy');
    expect(result.current.settings.about.email).toBe('hello@example.com');
    expect(result.current.settings.about.education).toEqual(defaultAbout.education);
  });

  it('settles into an error state when the settings request rejects', async () => {
    maybeSingle.mockRejectedValue(new Error('network unavailable'));
    const { result } = renderHook(() => useSiteSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('network unavailable');
    expect(result.current.settings).toEqual(defaultSettings);
  });

  it('reports a missing settings row and allows a later retry', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    maybeSingle.mockResolvedValueOnce({ data: { name: 'Recovered' }, error: null });
    const { result } = renderHook(() => useSiteSettings());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/No site settings row/);

    await act(async () => result.current.reload());
    expect(result.current.error).toBeNull();
    expect(result.current.settings.name).toBe('Recovered');
  });
});
