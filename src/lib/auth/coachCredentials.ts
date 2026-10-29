import { timingSafeEqual } from 'node:crypto';

/**
 * DEV coach account. Override with COACH_DEV_USERNAME / COACH_DEV_PASSWORD.
 * In production the defaults are disabled: if the env vars are not set, no
 * coach can log in (coach sign-up is intentionally not built yet).
 */
const DEV_DEFAULT = { username: 'admin', password: 'admin123' };

function expected() {
  const username = process.env.COACH_DEV_USERNAME;
  const password = process.env.COACH_DEV_PASSWORD;
  if (username && password) return { username, password };
  if (process.env.NODE_ENV === 'production') return null;
  return DEV_DEFAULT;
}

function safeEqual(a: string, b: string): boolean {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  // Compare against self when lengths differ so timing stays similar.
  return A.length === B.length ? timingSafeEqual(A, B) : (timingSafeEqual(A, A), false);
}

export function checkCoachCredentials(username: string, password: string): boolean {
  const exp = expected();
  if (!exp) return false;
  const userOk = safeEqual(username, exp.username);
  const passOk = safeEqual(password, exp.password);
  return userOk && passOk;
}

export const COACH_DISPLAY_NAME = 'Head Coach';
