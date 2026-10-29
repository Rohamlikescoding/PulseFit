import React from 'react';

/**
 * TimerSkeleton
 * Mirrors the exact layout of TimerView / Timer:
 * - Header status and mode toggle
 * - Large circular timer dial & digital readout
 * - Preset Interval buttons
 * - Primary playback and reset controls
 * - Interval lap timeline
 *
 * Free of data logic so it can directly port to Next.js `app/timer/loading.tsx`.
 */
export const TimerSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading Zen Timer - zen interval timer"
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="card-token p-6 sm:p-10 flex flex-col items-center justify-center space-y-8 border-token bg-surface-secondary/40">
        {/* Header Mode Status */}
        <div className="flex items-center justify-between w-full max-w-md">
          <div className="h-4 w-44 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none" />
          <div className="h-8 w-28 rounded-xl bg-surface-tertiary animate-pulse motion-reduce:animate-none" />
        </div>

        {/* Circular Dual-Loop Dial Display */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-surface-tertiary/75 flex flex-col items-center justify-center space-y-3 animate-pulse motion-reduce:animate-none">
          <div className="h-4 w-28 rounded bg-surface-tertiary" />
          <div className="h-12 w-48 rounded-xl bg-surface-tertiary" />
          <div className="h-4 w-32 rounded bg-surface-tertiary" />
        </div>

        {/* Preset Interval Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-9 w-20 rounded-xl bg-surface-tertiary animate-pulse motion-reduce:animate-none"
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="h-12 w-36 rounded-2xl bg-surface-tertiary animate-pulse motion-reduce:animate-none" />
          <div className="h-12 w-28 rounded-2xl bg-surface-tertiary animate-pulse motion-reduce:animate-none" />
          <div className="h-12 w-12 rounded-2xl bg-surface-tertiary animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
      <span className="sr-only">Loading zen interval timer...</span>
    </div>
  );
};

export default TimerSkeleton;
