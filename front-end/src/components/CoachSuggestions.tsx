'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Star, Users } from 'lucide-react';
import { COACHES, type CoachProfile } from '../data/coachesData';
import { useAuthStore } from '../store/authStore';

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const CoachPhoto: React.FC<{ coach: CoachProfile }> = ({ coach }) => {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div
      aria-hidden="true"
      className="h-16 w-16 rounded-2xl bg-[#74a87c]/20 border border-[#74a87c]/30 text-[#9dd3a4] font-bold flex items-center justify-center"
    >
      {initials(coach.name)}
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={coach.photo}
      alt={coach.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-16 w-16 rounded-2xl object-cover border border-token"
    />
  );
};

export const CoachSuggestions: React.FC = () => {
  const session = useAuthStore((s) => s.session);
  const goal = session?.role === 'user' ? session.user.goal : null;
  const [requested, setRequested] = useState<Set<string>>(new Set());

  // Coaches matching the signed-in user's goal come first; otherwise show the default order.
  const ranked = useMemo(() => {
    const score = (c: CoachProfile) => (goal && c.goals.includes(goal) ? 1 : 0);
    return [...COACHES].sort((a, b) => score(b) - score(a)).slice(0, 4);
  }, [goal]);

  const toggle = (id: string) =>
    setRequested((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <section aria-labelledby="coach-banner-title" className="card-token p-5 sm:p-6 space-y-5 border-accent-token relative overflow-hidden">
      <div className="absolute inset-0 bg-radial from-[#74a87c]/8 via-transparent to-transparent pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent-brand flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {goal ? 'Matched to your goal' : 'Suggested coaches'}
          </span>
          <h2 id="coach-banner-title" className="text-xl font-extrabold tracking-tight text-token-primary font-serif-editorial mt-0.5">
            Train with a coach
          </h2>
          <p className="text-xs text-token-muted mt-0.5">
            Get a plan built around you and someone to keep you accountable.
          </p>
        </div>
        {!session && (
          <Link href="/login?next=/workouts" className="text-xs font-semibold text-accent-brand hover:underline self-start sm:self-auto">
            Log in to get personalised matches →
          </Link>
        )}
      </div>

      <ul className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {ranked.map((coach, i) => {
          const isRequested = requested.has(coach.id);
          const isMatch = Boolean(goal && coach.goals.includes(goal));
          return (
            <li key={coach.id} className="p-4 rounded-2xl bg-surface-secondary border border-token hover:border-token-strong transition-colors flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <CoachPhoto coach={coach} />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-token-primary truncate">{coach.name}</h3>
                  <p className="text-[11px] text-token-muted leading-snug">{coach.title}</p>
                  {(isMatch || (!goal && i === 0)) && (
                    <span className="inline-block mt-1.5 text-[10px] font-mono uppercase font-bold bg-[#74a87c]/15 text-[#9dd3a4] border border-[#74a87c]/30 px-1.5 py-0.5 rounded">
                      {isMatch ? 'Top match' : 'Popular'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {coach.specialties.map((s) => (
                  <span key={s} className="text-[10px] text-token-secondary bg-surface border border-token px-2 py-0.5 rounded-md">{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-token-muted font-mono">
                <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-current text-[#d9c3a5]" />{coach.rating} ({coach.reviews})</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{coach.clients}</span>
                <span>${coach.pricePerMonth}/mo</span>
              </div>

              {session ? (
                <button
                  type="button"
                  aria-pressed={isRequested}
                  onClick={() => toggle(coach.id)}
                  className={`mt-auto min-h-[44px] rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer ${isRequested ? 'btn-secondary-token' : 'btn-primary-token'}`}
                >
                  {isRequested ? (<><Check className="h-3.5 w-3.5" /> Request sent</>) : 'Request coaching'}
                </button>
              ) : (
                <Link href="/login?next=/workouts" className="mt-auto min-h-[44px] rounded-xl text-xs btn-secondary-token flex items-center justify-center">
                  Log in to connect
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
