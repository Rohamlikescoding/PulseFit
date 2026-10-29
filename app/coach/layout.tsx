import { redirect } from 'next/navigation';
import { getSession } from '../../src/lib/auth/getSession';

// Defense in depth: middleware already blocks /coach, but we verify again here so
// the page can never render for a non-coach even if the matcher is changed/bypassed.
export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session?.role !== 'coach') redirect('/login?role=coach&next=/coach');
  return <>{children}</>;
}
