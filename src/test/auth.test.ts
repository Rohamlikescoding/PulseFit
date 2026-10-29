import { describe, it, expect } from 'vitest';
import { signSession, verifySession, safeNext, SESSION_COOKIE } from '../lib/auth/session';
import { validateSignup } from '../lib/auth/validation';

describe('session cookies', () => {
  it('round-trips a signed session', async () => {
    const token = await signSession({ sub: 'u1', role: 'coach', name: 'Coach' });
    expect(await verifySession(token)).toMatchObject({ sub: 'u1', role: 'coach', name: 'Coach' });
  });

  it('rejects tampered payloads and signatures', async () => {
    const token = await signSession({ sub: 'u1', role: 'user', name: 'U' });
    const [body, sig] = token.split('.');
    const forgedBody = btoa(JSON.stringify({ sub: 'u1', role: 'coach', name: 'U', exp: 9999999999 })).replace(/=+$/, '');
    expect(await verifySession(`${forgedBody}.${sig}`)).toBeNull();
    expect(await verifySession(`${body}.AAAA`)).toBeNull();
    expect(await verifySession('garbage')).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });

  it('exposes a stable cookie name', () => {
    expect(SESSION_COOKIE).toBe('pf_session');
  });
});

describe('safeNext', () => {
  it('allows only same-site relative paths', () => {
    expect(safeNext('/workouts')).toBe('/workouts');
    expect(safeNext('//evil.com')).toBe('/');
    expect(safeNext('https://evil.com')).toBe('/');
    expect(safeNext('/\\evil.com')).toBe('/');
    expect(safeNext(null)).toBe('/');
  });
});

describe('validateSignup', () => {
  const good = {
    name: 'Roham', email: 'Roham@Test.com', password: 'password123',
    age: 28, heightCm: 180, weightKg: 78, goal: 'muscle', experience: 'beginner',
  };
  it('accepts a valid payload and normalises email', () => {
    const r = validateSignup(good);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.email).toBe('roham@test.com');
  });
  it('reports every invalid field', () => {
    const r = validateSignup({ ...good, email: 'nope', password: 'short', age: 5, goal: 'x' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['age', 'email', 'goal', 'password']);
  });
});
