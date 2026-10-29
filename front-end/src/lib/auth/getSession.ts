import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession, type Session } from './session';

/** Server-side helper for Server Components and Route Handlers. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}
