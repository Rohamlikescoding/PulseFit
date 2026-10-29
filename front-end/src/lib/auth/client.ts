import type { ClientSession, SignupInput } from '../../types/auth';

export type ApiResult =
  | { ok: true; session: ClientSession }
  | { ok: false; error: string; fields?: Record<string, string> };

async function post(url: string, body: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.session) return { ok: true, session: data.session };
    return { ok: false, error: data.error ?? 'Something went wrong', fields: data.fields };
  } catch {
    return { ok: false, error: 'Network error. Please try again.' };
  }
}

export const authApi = {
  login: (role: 'user' | 'coach', identifier: string, password: string) =>
    post('/api/auth/login', { role, identifier, password }),
  signup: (input: SignupInput) => post('/api/auth/signup', input),
  async me(): Promise<ClientSession | null> {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      return (await res.json()).session ?? null;
    } catch {
      return null;
    }
  },
  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
  },
};
