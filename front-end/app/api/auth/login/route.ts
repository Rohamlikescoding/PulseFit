import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions, signSession } from '../../../../src/lib/auth/session';
import { authenticateUser } from '../../../../src/lib/auth/userDb';
import { COACH_DISPLAY_NAME, checkCoachCredentials } from '../../../../src/lib/auth/coachCredentials';
import type { ClientSession } from '../../../../src/types/auth';

export const runtime = 'nodejs';

const INVALID = { error: 'Invalid credentials' };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const role = body?.role;
  const identifier = typeof body?.identifier === 'string' ? body.identifier : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if ((role !== 'user' && role !== 'coach') || !identifier || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  let session: ClientSession;
  let token: string;

  if (role === 'coach') {
    if (!checkCoachCredentials(identifier.trim(), password)) {
      return NextResponse.json(INVALID, { status: 401 });
    }
    token = await signSession({ sub: identifier.trim(), role: 'coach', name: COACH_DISPLAY_NAME });
    session = { role: 'coach', name: COACH_DISPLAY_NAME };
  } else {
    const user = await authenticateUser(identifier, password);
    if (!user) return NextResponse.json(INVALID, { status: 401 });
    token = await signSession({ sub: user.id, role: 'user', name: user.name });
    session = { role: 'user', user };
  }

  const res = NextResponse.json({ session });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
