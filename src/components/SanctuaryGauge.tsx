import React, { useState } from 'react';
import { Droplet, Heart, Leaf, Wind } from 'lucide-react';
import { useWorkoutStore } from '../store/workoutStore';

interface SanctuaryGaugeProps {
  compact?: boolean;
}

export const SanctuaryGauge: React.FC<SanctuaryGaugeProps> = ({ compact = false }) => {
  const { sessionLogs, activeSession, settings } = useWorkoutStore();
  const [hydrationClicks, setHydrationClicks] = useState<number>(0);

  const isLight =
    settings.theme === 'light' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches);

  // Compute organic biological metrics from user's sessions
  const sessionsThisWeek = sessionLogs.filter((log) => {
    const diff = (Date.now() - new Date(log.date).getTime()) / (1000 * 3600 * 24);
    return diff <= 7;
  }).length;

  // Strain: Progressive adaptation index based on active session & volume
  const baseStrain = Math.min(92, Math.max(34, 40 + sessionsThisWeek * 9 + (activeSession ? 18 : 0)));
  
  // Restorative Balance: High when consistent and not over-training
  const restorativeBalance = Math.min(
    96,
    Math.max(
      45,
      90 - (sessionsThisWeek > 5 ? (sessionsThisWeek - 5) * 12 : 0) + (sessionsThisWeek === 0 ? -15 : 4)
    )
  );
  
  // Hydration Flow: Default healthy with easy one-tap log (+250ml)
  const hydration = Math.min(100, 78 + hydrationClicks * 6);

  // Circular gauge arc calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const restorativeOffset = circumference - (restorativeBalance / 100) * circumference;
  const strainOffset = circumference - (baseStrain / 100) * circumference;

  return (
    <div className={`card-token p-5 sm:p-6 space-y-4 border-token relative overflow-hidden transition-all duration-200 ${compact ? 'max-w-md' : ''}`}>
      {/* Background ambient biophilic glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
        isLight ? 'bg-[#466645]/8' : 'bg-[#74a87c]/8'
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-token pb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-colors ${
            isLight
              ? 'bg-[#c5eabf]/50 text-[#466645] border-[#466645]/30'
              : 'bg-[#74a87c]/15 text-[#9dd3a4] border-[#74a87c]/25'
          }`}>
            <Leaf className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-token-primary tracking-tight font-serif-editorial">
              Sanctuary Equilibrium Gauge
            </h2>
            <p className="text-[11px] text-token-muted">
              Mindful conditioning & restorative bio-rhythm
            </p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
          isLight
            ? 'bg-[#c5eabf]/40 text-[#466645] border-[#466645]/30'
            : 'bg-[#74a87c]/15 text-[#9dd3a4] border-[#74a87c]/20'
        }`}>
          Harmonious Flow
        </span>
      </div>

      {/* Flow Gauge Centerpiece */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center relative z-10 pt-1">
        {/* Visual Dual Concentric Gauge SVG */}
        <div className="relative flex items-center justify-center col-span-1 py-1">
          <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 140 140">
            <defs>
              {isLight ? (
                <>
                  <linearGradient id="sanctuaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c56d36" />
                    <stop offset="60%" stopColor="#466645" />
                    <stop offset="100%" stopColor="#2d4c2d" />
                  </linearGradient>
                  <linearGradient id="strainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e6e2d9" />
                    <stop offset="100%" stopColor="#c56d36" />
                  </linearGradient>
                </>
              ) : (
                <>
                  <linearGradient id="sanctuaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d9c3a5" />
                    <stop offset="60%" stopColor="#74a87c" />
                    <stop offset="100%" stopColor="#9dd3a4" />
                  </linearGradient>
                  <linearGradient id="strainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#564730" />
                    <stop offset="100%" stopColor="#d9c3a5" />
                  </linearGradient>
                </>
              )}
            </defs>

            {/* Background Tracks */}
            <circle
              cx="70"
              cy="70"
              r="54"
              stroke={isLight ? '#f1ede5' : '#161d19'}
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="70"
              cy="70"
              r="42"
              stroke={isLight ? '#f7f3ea' : '#161d19'}
              strokeWidth="6"
              fill="transparent"
            />

            {/* Restorative Balance Outer Ring */}
            <circle
              cx="70"
              cy="70"
              r="54"
              stroke="url(#sanctuaryGradient)"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={restorativeOffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />

            {/* Strain Adaptation Inner Ring */}
            <circle
              cx="70"
              cy="70"
              r="42"
              stroke="url(#strainGradient)"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 - (baseStrain / 100) * (2 * Math.PI * 42)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Core Gauge Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black font-mono tracking-tight text-token-primary tabular-nums">
              {restorativeBalance}%
            </span>
            <span className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${
              isLight ? 'text-[#466645]' : 'text-[#9dd3a4]'
            }`}>
              Recovery
            </span>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="sm:col-span-2 grid grid-cols-1 gap-2.5">
          {/* 1. Restorative Balance */}
          <div className="p-3 rounded-xl bg-surface-secondary/70 border border-token flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                isLight ? 'bg-[#c5eabf] text-[#466645]' : 'bg-[#9dd3a4]/15 text-[#9dd3a4]'
              }`}>
                <Heart className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-token-primary block">
                  Restorative Balance
                </span>
                <span className="text-[10px] text-token-muted">
                  Adaptive bio-equilibrium & nervous recovery
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`font-mono text-sm font-bold tabular-nums ${
                isLight ? 'text-[#466645]' : 'text-[#9dd3a4]'
              }`}>
                {restorativeBalance}%
              </span>
              <span className="block text-[9px] text-token-subtle font-mono">
                Optimal
              </span>
            </div>
          </div>

          {/* 2. Adaptation Strain */}
          <div className="p-3 rounded-xl bg-surface-secondary/70 border border-token flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                isLight ? 'bg-[#ffdbca] text-[#c56d36]' : 'bg-[#d9c3a5]/15 text-[#d9c3a5]'
              }`}>
                <Wind className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-token-primary block">
                  Movement Strain
                </span>
                <span className="text-[10px] text-token-muted">
                  Constructive musculoskeletal exertion
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`font-mono text-sm font-bold tabular-nums ${
                isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'
              }`}>
                {baseStrain}%
              </span>
              <span className="block text-[9px] text-token-subtle font-mono">
                {baseStrain > 85 ? 'Elevated' : 'Mindful'}
              </span>
            </div>
          </div>

          {/* 3. Hydration & Vitality */}
          <div className="p-3 rounded-xl bg-surface-secondary/70 border border-token flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                isLight ? 'bg-[#c5eabf] text-[#466645]' : 'bg-[#74a87c]/15 text-[#9dd3a4]'
              }`}>
                <Droplet className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-token-primary block">
                  Hydration & Vitality
                </span>
                <span className="text-[10px] text-token-muted">
                  Intracellular hydration status
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-token-primary tabular-nums">
                  {hydration}%
                </span>
                <span className="block text-[9px] text-token-subtle font-mono">
                  {hydration >= 90 ? 'Replenished' : 'Needs Water'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHydrationClicks((prev) => prev + 1)}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all active:scale-95 cursor-pointer ${
                  isLight
                    ? 'bg-[#1d1b18] text-[#ffffff] border-[#1d1b18]'
                    : 'bg-[#74a87c]/20 hover:bg-[#74a87c]/30 text-[#9dd3a4] border-[#74a87c]/30'
                }`}
                title="Log 250ml water intake"
              >
                +250ml
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
