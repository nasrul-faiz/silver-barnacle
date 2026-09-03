/**
 * Frontend auth utilities — talks to /api/auth/* on the same origin.
 * Because both the frontend and API are served from the same Replit domain,
 * the browser sends the HttpOnly session cookie automatically with every request.
 */

export const DEFAULT_APP_PASSWORD = 'Acun97';
const ACCESS_PASSWORD_STORAGE_KEY = 'app_access_password';

export interface AuthStatus {
  authenticated: boolean;
  authEnabled: boolean;
}

export function getStoredAccessPassword(): string {
  try {
    const value = globalThis.localStorage?.getItem(ACCESS_PASSWORD_STORAGE_KEY);
    return value && value.trim() ? value.trim() : DEFAULT_APP_PASSWORD;
  } catch {
    return DEFAULT_APP_PASSWORD;
  }
}

export function setAccessPassword(password: string): void {
  const nextValue = password && password.trim() ? password.trim() : DEFAULT_APP_PASSWORD;
  try {
    globalThis.localStorage?.setItem(ACCESS_PASSWORD_STORAGE_KEY, nextValue);
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

export function isPasswordValid(password: string): boolean {
  if (typeof password !== 'string') return false;
  return password.trim() === getStoredAccessPassword();
}

export async function fetchAuthStatus(): Promise<AuthStatus> {
  try {
    const res = await fetch('/api/auth/status');
    if (!res.ok) return { authenticated: false, authEnabled: true };
    return await res.json() as AuthStatus;
  } catch {
    return { authenticated: false, authEnabled: false };
  }
}

export async function login(password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) return { ok: true };
    const body = await res.json().catch(() => ({})) as { error?: string };
    return { ok: false, error: body.error ?? 'Invalid password' };
  } catch {
    return { ok: false, error: 'Could not reach the server' };
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
}
