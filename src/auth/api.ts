import { Platform } from 'react-native';
import { readStored, writeStored, deleteStored } from '../theme/storage';

const TOKEN_KEY = 'lumexai.authToken';
const PORTAL_TOKEN_KEY = 'lumexai.portalToken';
export const ADMIN_KEY = 'lumex-super-admin-mukundi';

export type AccessStatus = 'pending' | 'approved' | 'revoked' | string;

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accessStatus?: AccessStatus;
};

export type LicenseInfo = {
  status: 'none' | 'active' | 'available' | 'expired' | 'suspended' | string;
  hint: string | null;
  activatedAt: string | null;
  ea?: PortalEa | null;
};

export type AuthNext = 'pending' | 'license' | 'dashboard' | 'revoked' | 'register';

export type AuthResponse = {
  token: string;
  user: AuthUser;
  license: LicenseInfo;
  accessStatus: AccessStatus;
  next: AuthNext;
  message?: string;
};

export type PortalSubscriber = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: AccessStatus;
  createdAt: string;
  reviewedAt: string | null;
  license: LicenseInfo;
};

export type PortalAdmin = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super' | 'mentor' | string;
  status: AccessStatus;
  mentorId: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type PortalEa = {
  id: string;
  name: string;
  symbols: string[];
  lot: number;
  direction: string;
  description: string;
  mediaUrl: string | null;
  mediaKind: 'image' | 'video' | string | null;
  mediaMime?: string | null;
  createdAt: string;
};

export type PortalLicense = {
  id: string;
  hint: string;
  status: string;
  boundEmail: string | null;
  boundFirstName?: string | null;
  boundLastName?: string | null;
  activatedAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  user: AuthUser | null;
  key?: string;
  ea?: PortalEa | null;
};

function resolveApiBase(): string {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://127.0.0.1:8787';
}

export function getStoredToken(): string | null {
  return readStored(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (!token) deleteStored(TOKEN_KEY);
  else writeStored(TOKEN_KEY, token);
}

export function getPortalToken(): string | null {
  return readStored(PORTAL_TOKEN_KEY);
}

export function setPortalToken(token: string | null) {
  if (!token) deleteStored(PORTAL_TOKEN_KEY);
  else writeStored(PORTAL_TOKEN_KEY, token);
}

async function parseJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit & {
    token?: string | null;
    admin?: boolean;
    portal?: boolean;
  } = {},
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string; code?: string; data?: any }> {
  const base = resolveApiBase();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
  };

  if (options.admin || options.portal) {
    const portalToken = getPortalToken();
    if (portalToken) {
      headers.Authorization = `Bearer ${portalToken}`;
    } else {
      headers['X-Admin-Key'] = ADMIN_KEY;
    }
  } else {
    const token = options.token ?? getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
    });
    const data = await parseJson(res);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data?.error || 'Something went wrong. Please try again.',
        code: data?.code,
        data,
      };
    }
    return { ok: true, data: data as T };
  } catch {
    return {
      ok: false,
      status: 0,
      error: 'Unable to reach LUMEXAI servers. Check your connection.',
    };
  }
}

export async function registerAccount(input: {
  email: string;
  firstName: string;
  lastName: string;
}) {
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
    token: null,
  });
}

export async function licenseLogin(input: {
  email: string;
  licenseKey: string;
  firstName?: string;
  lastName?: string;
}) {
  return apiFetch<AuthResponse>('/api/auth/license-login', {
    method: 'POST',
    body: JSON.stringify(input),
    token: null,
  });
}

export async function fetchMe(token?: string | null) {
  return apiFetch<{
    user: AuthUser;
    license: LicenseInfo;
    accessStatus: AccessStatus;
    next: AuthNext;
  }>('/api/auth/me', { method: 'GET', token });
}

export async function activateLicenseKey(licenseKey: string) {
  return apiFetch<{
    license: LicenseInfo;
    message: string;
    next: 'dashboard';
  }>('/api/license/activate', {
    method: 'POST',
    body: JSON.stringify({ licenseKey }),
  });
}

export async function verifyProtectedAccess() {
  return apiFetch<{ ok: boolean; licensed: boolean; approved: boolean }>(
    '/api/protected/status',
    { method: 'GET' },
  );
}

export async function fetchAdminSubscriptions(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiFetch<{
    stats: { pending: number; approved: number; revoked: number; total: number };
    subscribers: PortalSubscriber[];
  }>(`/api/admin/subscriptions${q}`, { method: 'GET', admin: true });
}

export async function approveSubscriber(id: string) {
  return apiFetch<{ ok: boolean; subscriber: PortalSubscriber; message: string }>(
    `/api/admin/subscriptions/${id}/approve`,
    { method: 'POST', admin: true },
  );
}

export async function revokeSubscriber(id: string) {
  return apiFetch<{ ok: boolean; subscriber: PortalSubscriber; message: string }>(
    `/api/admin/subscriptions/${id}/revoke`,
    { method: 'POST', admin: true },
  );
}

export async function pendSubscriber(id: string) {
  return apiFetch<{ ok: boolean; subscriber: PortalSubscriber; message: string }>(
    `/api/admin/subscriptions/${id}/pending`,
    { method: 'POST', admin: true },
  );
}

export async function portalRegister(input: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}) {
  return apiFetch<{
    ok: boolean;
    admin: PortalAdmin;
    next: string;
    message: string;
  }>('/api/portal/register', {
    method: 'POST',
    body: JSON.stringify(input),
    token: null,
  });
}

export async function portalLogin(input: { email: string; password: string }) {
  return apiFetch<{
    token: string;
    admin: PortalAdmin;
    next: string;
  }>('/api/portal/login', {
    method: 'POST',
    body: JSON.stringify(input),
    token: null,
  });
}

export async function fetchPortalMe() {
  return apiFetch<{ admin: PortalAdmin }>('/api/portal/me', {
    method: 'GET',
    portal: true,
  });
}

export async function fetchPortalAdmins(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiFetch<{
    stats: { pending: number; approved: number; revoked: number; total: number };
    admins: PortalAdmin[];
  }>(`/api/admin/portal-admins${q}`, { method: 'GET', admin: true });
}

export async function approvePortalAdmin(id: string) {
  return apiFetch<{ ok: boolean; admin: PortalAdmin; message: string }>(
    `/api/admin/portal-admins/${id}/approve`,
    { method: 'POST', admin: true },
  );
}

export async function revokePortalAdmin(id: string) {
  return apiFetch<{ ok: boolean; admin: PortalAdmin; message: string }>(
    `/api/admin/portal-admins/${id}/revoke`,
    { method: 'POST', admin: true },
  );
}

export async function fetchAdminLicenses() {
  return apiFetch<{
    stats: {
      available: number;
      active: number;
      expired: number;
      suspended: number;
      total: number;
    };
    licenses: PortalLicense[];
  }>('/api/admin/licenses', { method: 'GET', admin: true });
}

export async function generateAdminLicenses(input: {
  email: string;
  firstName: string;
  lastName: string;
  eaId: string;
}) {
  return apiFetch<{ ok: boolean; licenses: PortalLicense[] }>(
    '/api/admin/licenses/generate',
    {
      method: 'POST',
      body: JSON.stringify(input),
      admin: true,
    },
  );
}

export async function releaseAdminLicense(
  id: string,
  input: { email: string; firstName: string; lastName: string },
) {
  return apiFetch<{ ok: boolean; license: PortalLicense; message: string }>(
    `/api/admin/licenses/${id}/release`,
    {
      method: 'POST',
      body: JSON.stringify(input),
      admin: true,
    },
  );
}

export async function fetchAdminEas() {
  return apiFetch<{ eas: PortalEa[] }>('/api/admin/eas', {
    method: 'GET',
    admin: true,
  });
}

export async function createAdminEa(input: {
  name: string;
  symbols: string[];
  description?: string;
  lot?: number;
  direction?: string;
  media?: {
    uri: string;
    name: string;
    type: string;
    file?: File;
  } | null;
}) {
  const base = resolveApiBase();
  const form = new FormData();
  form.append('name', input.name);
  form.append('symbols', JSON.stringify(input.symbols));
  form.append('description', input.description || '');
  form.append('lot', String(input.lot ?? 0.01));
  form.append('direction', input.direction || 'both');
  if (input.media?.file) {
    form.append('media', input.media.file, input.media.name);
  } else if (input.media) {
    form.append('media', {
      uri: input.media.uri,
      name: input.media.name,
      type: input.media.type,
    } as any);
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  const portalToken = getPortalToken();
  if (portalToken) headers.Authorization = `Bearer ${portalToken}`;
  else headers['X-Admin-Key'] = ADMIN_KEY;

  try {
    const res = await fetch(`${base}/api/admin/eas`, {
      method: 'POST',
      headers,
      body: form,
    });
    const data = await parseJson(res);
    if (!res.ok) {
      return {
        ok: false as const,
        status: res.status,
        error: data?.error || 'Unable to create EA.',
      };
    }
    return { ok: true as const, data: data as { ok: boolean; ea: PortalEa } };
  } catch {
    return {
      ok: false as const,
      status: 0,
      error: 'Unable to reach LUMEXAI servers. Check your connection.',
    };
  }
}

export async function deleteAdminEa(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/admin/eas/${id}`, {
    method: 'DELETE',
    admin: true,
  });
}

export function mediaAbsoluteUrl(mediaUrl: string | null | undefined) {
  if (!mediaUrl) return null;
  if (/^https?:\/\//i.test(mediaUrl)) return mediaUrl;
  return `${resolveApiBase()}${mediaUrl.startsWith('/') ? '' : '/'}${mediaUrl}`;
}
