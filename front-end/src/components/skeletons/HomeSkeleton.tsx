import React from 'react';

/**
 * HomeSkeleton
 * Mirrors the exact layout of MainView:
 * - Header banner & start CTA
 * - 3 KPI summary stat cards
 * - Sanctuary Equilibrium Gauge radial dial
 * - Today's Workout focal anchor card
 * - Active Routine Split breakdown
 *
 * Free of data logic so it can directly port to Next.js `app/(home)/loading.tsx`.
 */
export const HomeSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading Overview - sanctuary home overview"
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header Greeting & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-40 rounded-lg bg-surface-tertiary/75 animate-pulse motion-reduce:animate-none border border-token-subtle" />
          <div className="h-8 w-64 rounded-xl bg-surface-tertiary/75 animate-pulse motion-reduce:animate-none border border-token-subtle" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-surface-tertiary/75 animate-pulse motion-reduce:animate-none border border-token-subtle" />
      </div>

      {/* 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="card-token p-6 space-y-4 border-token bg-surface-secondary/50 animate-pulse motion-reduce:animate-none"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-surface-tertiary" />
              <div className="h-5 w-5 rounded-full bg-surface-tertiary" />
            </div>
            <div className="h-9 w-20 rounded-lg bg-surface-tertiary" />
            <div className="h-3 w-32 rounded bg-surface-tertiary" />
          </div>
        ))}
      </div>

      {/* Sanctuary Metrics Equilibrium Gauge (Radial Dial Container) */}
      <div className="card-token p-6 sm:p-7 border-token bg-surface-secondary/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="h-3.5 w-36 rounded bg-surface-tertiary/80 animate-pulse motion-reduce:animate-none" />
            <div className="h-6 w-56 rounded-lg bg-surface-tertiary/80 animate-pulse motion-reduce:animate-none" />
          </div>
          <div className="h-7 w-28 rounded-lg bg-surface-tertiary/80 animate-pulse motion-reduce:animate-none" />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
          <div className="space-y-3 max-w-sm w-full">
            <div className="h-4 w-48 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none" />
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none" />
              <div className="h-3.5 w-4/5 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
          {/* Circular Shimmer Dial */}
          <div className="relative w-44 h-44 rounded-full border-4 border-surface-tertiary/75 flex items-center justify-center animate-pulse motion-reduce:animate-none">
            <div className="h-16 w-16 rounded-full bg-surface-tertiary" />
          </div>
        </div>
      </div>

      {/* Today's Workout Focal Card */}
      <div className="card-token p-6 sm:p-7 space-y-5 border-token bg-surface-secondary/50 animate-pulse motion-reduce:animate-none">
        <div className="flex items-center justify-between">
          <div className="h-4 w-44 rounded bg-surface-tertiary" />
          <div className="h-4 w-28 rounded bg-surface-tertiary" />
        </div>
        <div className="h-8 w-60 rounded-xl bg-surface-tertiary" />
        <div className="flex gap-2.5 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-32 rounded-xl bg-surface-tertiary" />
          ))}
        </div>
        <div className="h-12 w-48 rounded-2xl bg-surface-tertiary" />
      </div>

      {/* Routine Split Breakdown */}
      <div className="card-token p-6 space-y-4 border-token bg-surface-secondary/40 animate-pulse motion-reduce:animate-none">
        <div className="h-5 w-44 rounded bg-surface-tertiary" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-tertiary" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading sanctuary dashboard content...</span>
    </div>
  );
};

export default HomeSkeleton;
