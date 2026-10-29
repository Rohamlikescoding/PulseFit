import { CoachDashboard } from '../../src/components/coach/CoachDashboard';
import { getSession } from '../../src/lib/auth/getSession';

export const metadata = { title: 'PulseFit — Coach' };
export const dynamic = 'force-dynamic';

export default async function CoachPage() {
  const session = await getSession();
  return <CoachDashboard coachName={session?.name ?? 'Coach'} />;
}
