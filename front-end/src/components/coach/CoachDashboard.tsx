'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Activity, AlertTriangle, CalendarClock, LogOut, Users } from 'lucide-react';
import { COACH_CLIENTS, type CoachClient } from '../../data/coachesData';
import { useAuthStore } from '../../store/authStore';

const STATUS: Record<CoachClient['status'], { label: string; cls: string }> = {
  'on-track': { label: 'On track', cls: 'bg-[#74a87c]/15 text-[#9dd3a4] border-[#74a87c]/30' },
  'needs-attention': { label: 'Needs attention', cls: 'bg-[#c47b62]/15 text-[#e0a08a] border-[#c47b62]/30' },
  new: { label: 'New client', cls: 'bg-[#d9c3a5]/15 text-[#d9c3a5] border-[#d9c3a5]/30' },
};

export const CoachDashboard: React.FC<{ coachName: string }> = ({ coachName }) => {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    router.replace('/login?role=coach');
    router.refresh();
  };

  const attention = COACH_CLIENTS.filter((c) => c.status === 'needs-attention').length;
  const avg = Math.round(COACH_CLIENTS.reduce((s, c) => s + c.adherence, 0) / COACH_CLIENTS.length);

  const stats = [
    { icon: Users, label: 'Active clients', value: COACH_CLIENTS.length },
    { icon: Activity, label: 'Avg. adherence', value: `${avg}%` },
    { icon: AlertTriangle, label: 'Need attention', value: attention },
    { icon: CalendarClock, label: 'Check-ins this week', value: 7 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-28">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#9dd3a4] block">Coach workspace</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 font-serif-editorial">
            Welcome, {coachName}
          </h1>
          <p className="text-xs text-token-muted mt-1">Demo data. Real clients will appear once the backend is connected.</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="self-start px-4 min-h-[44px] rounded-xl btn-secondary-token text-xs flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card-token p-5 space-y-3">
            <Icon className="h-5 w-5 text-accent-brand" />
            <div>
              <span className="text-3xl font-black font-mono tabular-nums text-token-primary">{value}</span>
              <span className="block text-[11px] font-mono uppercase tracking-wider text-token-muted mt-1">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card-token p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold tracking-tight">Clients</h2>
        <div className="divide-y divide-token/40 rounded-2xl border border-token bg-surface-secondary/70">
          {COACH_CLIENTS.map((c) => (
            <div key={c.id} className="flex items-center gap-3 sm:gap-4 px-4 py-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.photo} alt="" className="h-10 w-10 rounded-full object-cover border border-token shrink-0" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-token-primary truncate">{c.name}</p>
                <p className="text-[11px] text-token-muted truncate">{c.program} · last session {c.lastSession}</p>
              </div>
              <div className="hidden sm:block w-32">
                <div className="h-1.5 rounded-full bg-surface-tertiary overflow-hidden">
                  <div className="h-full bg-[#74a87c]" style={{ width: `${c.adherence}%` }} />
                </div>
                <span className="text-[10px] font-mono text-token-muted">{c.adherence}% adherence</span>
              </div>
              <span className={`text-[10px] font-mono uppercase font-bold px-2 py-1 rounded-md border whitespace-nowrap ${STATUS[c.status].cls}`}>
                {STATUS[c.status].label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
