'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogIn, ShieldCheck, Sparkles, UserPlus, Users, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// sessionStorage is scoped to a single browser tab, so the popup shows once per new tab.
const SEEN_KEY = 'pulsefit-new-features-seen';

const FEATURES = [
  { icon: Users, title: 'Find a coach', desc: 'Browse coaches matched to your goal from the Routines page.' },
  { icon: ShieldCheck, title: 'Coach workspace', desc: 'Coaches get their own app to follow client progress.' },
  { icon: UserPlus, title: 'Optional accounts', desc: 'Create a profile to personalise suggestions. Training still works without one.' },
];

export const NewFeaturesBanner: React.FC = () => {
  const status = useAuthStore((s) => s.status);
  const loggedIn = useAuthStore((s) => s.session !== null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Wait for the session check so logged-in people never see a flash of the popup.
    if (status !== 'ready' || loggedIn) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      setOpen(true);
    } catch {
      /* storage blocked: skip the popup rather than nagging on every page */
    }
  }, [status, loggedIn]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={dismiss}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-features-title"
        onClick={(e) => e.stopPropagation()}
        className="card-token w-full max-w-md p-6 space-y-5 glow-sanctuary relative"
      >
        <button type="button" onClick={dismiss} aria-label="Close" className="absolute top-3 right-3 p-2 rounded-xl text-token-muted hover:text-token-primary cursor-pointer">
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-1 pr-8">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#9dd3a4] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> What’s new
          </span>
          <h2 id="new-features-title" className="text-xl font-extrabold tracking-tight font-serif-editorial">
            Coaches &amp; accounts are here
          </h2>
        </div>

        <ul className="space-y-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex gap-3">
              <span className="h-9 w-9 shrink-0 rounded-xl bg-[#74a87c]/15 border border-[#74a87c]/25 text-[#9dd3a4] flex items-center justify-center">
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-bold text-token-primary">{title}</span>
                <span className="block text-xs text-token-muted">{desc}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <Link href="/login" onClick={dismiss} className="flex-1 min-h-[48px] rounded-2xl btn-primary-token text-sm flex items-center justify-center gap-2">
            <LogIn className="h-4 w-4" /> Log in
          </Link>
          <button type="button" onClick={dismiss} className="min-h-[48px] px-5 rounded-2xl btn-secondary-token text-xs cursor-pointer">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
