import { redirect } from 'next/navigation';
import { LoginView } from '../../src/components/auth/LoginView';
import { getSession } from '../../src/lib/auth/getSession';
import { safeNext } from '../../src/lib/auth/session';

export const metadata = { title: 'PulseFit — Log in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; next?: string }>;
}) {
  const { role, next } = await searchParams;
  const initialRole = role === 'coach' ? 'coach' : 'user';
  const safe = safeNext(next, '/');

  const session = await getSession();
  if (session?.role === 'coach' && initialRole === 'coach') redirect(safe.startsWith('/coach') ? safe : '/coach');
  if (session?.role === 'user' && initialRole === 'user') redirect(safe.startsWith('/coach') ? '/' : safe);

  return <LoginView initialRole={initialRole} next={safe} />;
}
