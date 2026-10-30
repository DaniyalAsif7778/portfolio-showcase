import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { order } = vi.hoisted(() => ({ order: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => ({ select: () => ({ order }) }) },
}));

describe('useSkills', () => {
  beforeEach(() => order.mockReset());

  it('uses saved skills as authoritative even with custom categories', async () => {
    const saved = [{ id: '1', name: 'Accessibility', category: 'Quality', featured: true, sort_order: 1 }];
    order.mockResolvedValue({ data: saved, error: null });
    const { useSkills } = await import('./useSkills');
    const { result } = renderHook(() => useSkills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.skills).toEqual(saved);
  });

  it('uses resume defaults when the database has no skill rows', async () => {
    order.mockResolvedValue({ data: [], error: null });
    const { useSkills, resumeSkills } = await import('./useSkills');
    const { result } = renderHook(() => useSkills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.skills).toEqual(resumeSkills);
    expect(result.current.skills.length).toBeGreaterThan(0);
  });
});
