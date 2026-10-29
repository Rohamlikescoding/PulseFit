import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from './src/lib/auth/session';

/**
 * Guards the coach app. The rest of the app is intentionally public
 * (users can train without an account).
 */
export async function middleware(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (session?.role === 'coach') return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('role', 'coach');
  url.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/coach', '/coach/:path*'],
};
