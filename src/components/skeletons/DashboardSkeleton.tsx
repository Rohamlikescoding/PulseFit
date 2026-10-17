import React from 'react';

/**
 * DashboardSkeleton
 * Mirrors the exact layout of DashboardView:
 * - Header title & settings trigger
 * - 4 Key Performance Metric Cards
 * - 52-Week Consistency Activity Heatmap grid
 * - Dual Chart analytics panels (Progression Line & Volume Pie)
 * - Recent Activity Logs list
 *
 * Free of data logic so it can directly port to Next.js `app/dashboard/loading.tsx`.
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading Analytics & Equilibrium - performance analytics"
      className="max-w-5xl mx-auto space-y-6 pb-28"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-8 w-72 rounded-xl bg-surface-tertiary/80 animate-pulse motion-reduce:animate-none border border-token-subtle" />
          <div className="h-4 w-96 rounded-lg bg-surface-tertiary/70 animate-pulse motion-reduce:animate-none border border-token-subtle" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-surface-tertiary/80 animate-pulse motion-reduce:animate-none border border-token-subtle" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="card-token p-5 space-y-3 border-token bg-surface-secondary/50 animate-pulse motion-reduce:animate-none"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-surface-tertiary" />
              <div className="h-4 w-4 rounded-full bg-surface-tertiary" />
            </div>
            <div className="h-8 w-24 rounded-lg bg-surface-tertiary" />
            <div className="h-3 w-16 rounded bg-surface-tertiary" />
          </div>
        ))}
      </div>

      {/* 52-Week Consistency Heatmap */}
      <div className="card-token p-5 sm:p-6 space-y-4 border-token bg-surface-secondary/40 animate-pulse motion-reduce:animate-none">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 rounded bg-surface-tertiary" />
          <div className="h-3 w-32 rounded bg-surface-tertiary" />
        </div>
        <div className="h-28 w-full rounded-xl bg-surface-tertiary/60" />
      </div>

      {/* Dual Analytics Charts (Progression Line & Volume Pie) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-token p-5 sm:p-6 space-y-4 border-token bg-surface-secondary/40 animate-pulse motion-reduce:animate-none">
          <div className="h-4 w-40 rounded bg-surface-tertiary" />
          <div className="h-60 w-full rounded-xl bg-surface-tertiary/60" />
        </div>
        <div className="card-token p-5 sm:p-6 space-y-4 border-token bg-surface-secondary/40 animate-pulse motion-reduce:animate-none">
          <div className="h-4 w-40 rounded bg-surface-tertiary" />
          <div className="h-60 w-full rounded-xl bg-surface-tertiary/60" />
        </div>
      </div>

      {/* Recent Activity Logs */}
      <div className="card-token p-5 space-y-4 border-token bg-surface-secondary/40 animate-pulse motion-reduce:animate-none">
        <div className="h-4 w-36 rounded bg-surface-tertiary" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-surface-tertiary/50" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading analytics dashboard data...</span>
    </div>
  );
};

export default DashboardSkeleton;
