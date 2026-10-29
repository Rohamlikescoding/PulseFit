/**
 * Signed session cookies (HMAC-SHA256). Uses only Web Crypto, so it runs in
 * Route Handlers (Node), Server Components AND the Edge middleware.
 *
 * DEV NOTE: when the Django backend arrives, replace issue/verify with its
 * session/JWT. Everything else only depends on `getSession()` / `Session`.
 */

export const SESSION_COOKIE = 'pf_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8h

export type Role = 'user' | 'coach';

export interface Session {
  sub: string; // user id, or coach username
  role: Role;
  name: string;
  exp: number; // unix seconds
}

const enc = new TextEncoder();
const dec = new TextDecoder();

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    // Fail closed: never sign sessions with a well-known key in production.
    throw new Error('AUTH_SECRET must be set in production');
  }
  return 'pulsefit-dev-only-insecure-secret';
}

function toB64Url(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(str: string): Uint8Array<ArrayBuffer> {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function signSession(data: Omit<Session, 'exp'>): Promise<string> {
  const payload: Session = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = toB64Url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(), enc.encode(body));
  return `${body}.${toB64Url(new Uint8Array(sig))}`;
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  try {
    // subtle.verify compares in constant time
    const ok = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(),
      fromB64Url(sig),
      enc.encode(body),
    );
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(fromB64Url(body))) as Session;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== 'user' && payload.role !== 'coach') return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};

/** Only allow same-site relative redirects (prevents open-redirect via ?next=). */
export function safeNext(next: string | null | undefined, fallback = '/'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return fallback;
  return next;
}
