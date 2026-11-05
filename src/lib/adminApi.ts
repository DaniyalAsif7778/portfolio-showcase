import * as tus from 'tus-js-client';

const requestAdmin = async (body: Record<string, unknown>) => {
  const response = await fetch('/api/admin', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'x-supabase-url': import.meta.env.VITE_SUPABASE_URL,
      'x-supabase-publishable-key': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.error) throw new Error(data?.error ?? 'Request failed. Please try again.');
  return data;
};

export const hasAdminSession = async (): Promise<boolean> => {
  try {
    await requestAdmin({ action: 'verify' });
    return true;
  } catch {
    return false;
  }
};

export const clearAdminToken = () => {
  void requestAdmin({ action: 'logout' }).catch(() => undefined);
};

export const adminLogin = async (username: string, password: string) => {
  await requestAdmin({ action: 'login', username, password });
};

export const getAdminLoginStatus = async (): Promise<boolean> => {
  const data = await requestAdmin({ action: 'login_status' });
  return Boolean(data?.ready);
};

export const adminCall = async (body: Record<string, unknown> | FormData) => {
  if (body instanceof FormData) throw new Error('Direct form uploads are not supported.');
  try {
    return await requestAdmin(body);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Request failed. Please try again.';
    if (msg === 'Unauthorized') {
      clearAdminToken();
      throw new Error('Session expired. Please log in again.');
    }
    throw error;
  }
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
