import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions, signSession } from '../../../../src/lib/auth/session';
import { EmailTakenError, createUser } from '../../../../src/lib/auth/userDb';
import { validateSignup } from '../../../../src/lib/auth/validation';

export const runtime = 'nodejs';

// Only regular users can sign up. Coach sign-up is intentionally not available yet.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const result = validateSignup(body);
  if (!result.ok) {
    return NextResponse.json({ error: 'Invalid input', fields: result.errors }, { status: 400 });
  }

  try {
    const user = await createUser(result.value);
    const token = await signSession({ sub: user.id, role: 'user', name: user.name });
    const res = NextResponse.json({ session: { role: 'user', user } }, { status: 201 });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (err) {
    if (err instanceof EmailTakenError) {
      return NextResponse.json(
        { error: 'Invalid input', fields: { email: 'An account with this email already exists' } },
        { status: 409 },
      );
    }
    console.error('[auth/signup]', err);
    return NextResponse.json({ error: 'Could not create account' }, { status: 500 });
  }
}
