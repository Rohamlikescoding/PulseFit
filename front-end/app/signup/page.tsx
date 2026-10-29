import { redirect } from 'next/navigation';
import { SignupStepper } from '../../src/components/auth/SignupStepper';
import { getSession } from '../../src/lib/auth/getSession';
import { safeNext } from '../../src/lib/auth/session';

export const metadata = { title: 'PulseFit — Create account' };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if ((await getSession())?.role === 'user') redirect('/');
  return <SignupStepper next={safeNext(next, '/')} />;
}
