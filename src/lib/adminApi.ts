import { supabase } from '@/integrations/supabase/client';

const TOKEN_KEY = 'admin_session';

type Stored = { token: string; exp: number };

export const getAdminToken = (): string | null => {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Stored;
    if (!s.token || s.exp < Date.now()) {
      sessionStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return s.token;
  } catch {
    return null;
  }
};

export const clearAdminToken = () => sessionStorage.removeItem(TOKEN_KEY);

const readError = async (error: unknown, data: unknown): Promise<string> => {
  const d = data as { error?: string } | null;
  if (d?.error) return d.error;
  // FunctionsHttpError carries the response in `context`
  const ctx = (error as { context?: Response })?.context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = await ctx.json();
      if (body?.error) return body.error;
    } catch {
      /* ignore */
    }
  }
  return 'Request failed. Please try again.';
};

export const adminLogin = async (username: string, password: string) => {
  const { data, error } = await supabase.functions.invoke('admin-projects', {
    body: { action: 'login', username, password },
  });
  if (error || !data?.token) throw new Error(await readError(error, data));
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ token: data.token, exp: Date.now() + data.expiresIn }));
};

export const adminCall = async (body: Record<string, unknown> | FormData) => {
  const token = getAdminToken();
  if (!token) throw new Error('Session expired. Please log in again.');
  const { data, error } = await supabase.functions.invoke('admin-projects', {
    body,
    headers: { 'x-admin-token': token },
  });
  if (error || (data as { error?: string })?.error) {
    const msg = await readError(error, data);
    if (msg === 'Unauthorized') clearAdminToken();
    throw new Error(msg === 'Unauthorized' ? 'Session expired. Please log in again.' : msg);
  }
  return data;
};

export const adminUpload = async (file: File): Promise<string> => {
  const fd = new FormData();
  fd.append('file', file);
  const data = await adminCall(fd);
  return (data as { url: string }).url;
};
