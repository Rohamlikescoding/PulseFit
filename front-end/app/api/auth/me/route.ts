import { NextResponse } from 'next/server';
import { getSession } from '../../../../src/lib/auth/getSession';
import { findUserById } from '../../../../src/lib/auth/userDb';
import type { ClientSession } from '../../../../src/types/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ session: null });

  let session: ClientSession | null = null;
  if (s.role === 'coach') {
    session = { role: 'coach', name: s.name };
  } else {
    const user = await findUserById(s.sub);
    session = user ? { role: 'user', user } : null; // account deleted -> treat as logged out
  }
  return NextResponse.json({ session }, { headers: { 'Cache-Control': 'no-store' } });
}
