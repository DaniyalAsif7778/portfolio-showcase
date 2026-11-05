import { supabase } from '@/integrations/supabase/client';
import * as tus from 'tus-js-client';

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

export const getAdminLoginStatus = async (): Promise<boolean> => {
  const { data, error } = await supabase.functions.invoke('admin-projects', {
    body: { action: 'login_status' },
  });
  if (error) throw new Error(await readError(error, data));
  return Boolean(data?.ready);
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
  const maxBytes = 20 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error('Image is too large. The maximum size is 20 MB.');
  if (!/^image\/(png|jpe?g|webp|gif|avif)$/.test(file.type)) {
    throw new Error('Choose a PNG, JPG, WEBP, GIF, or AVIF image.');
  }

  const signed = await adminCall({
    action: 'create_image_upload',
    contentType: file.type,
    fileSize: file.size,
  }) as { path: string; token: string };
  const supabaseUrl = new URL(import.meta.env.VITE_SUPABASE_URL);
  const storageHost = supabaseUrl.hostname.replace(/\.supabase\.co$/i, '.storage.supabase.co');
  const endpoint = `${supabaseUrl.protocol}//${storageHost}/storage/v1/upload/resumable`;

  try {
    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint,
        headers: { 'x-signature': signed.token },
        metadata: {
          bucketName: 'project-image-staging',
          objectName: signed.path,
          contentType: file.type,
          cacheControl: '3600',
        },
        chunkSize: 6 * 1024 * 1024,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        onError: reject,
        onSuccess: () => resolve(),
      });
      upload.start();
    });
  } catch (uploadError) {
    await adminCall({ action: 'cancel_image_upload', path: signed.path }).catch(() => undefined);
    throw uploadError;
  }

  const finalized = await adminCall({
    action: 'finalize_image_upload',
    path: signed.path,
    contentType: file.type,
  }) as { url: string };
  return finalized.url;
};

export const getProjectImagePath = (publicUrl: string): string | null => {
  try {
    const pathname = new URL(publicUrl).pathname;
    const marker = '/storage/v1/object/public/project-images/';
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex < 0) return null;
    return decodeURIComponent(pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
};
