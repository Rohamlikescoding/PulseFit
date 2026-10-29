import React from 'react';

/**
 * WorkoutsSkeleton
 * Mirrors the exact layout of WorkoutsView:
 * - Header with title & "Create New Routine" button
 * - Routine Selector Bar & action buttons
 * - Weekday Split Tabs
 * - Exercises List with Set rows and action icons
 * - All Saved Routines card accordion
 *
 * Free of data logic so it can directly port to Next.js `app/workouts/loading.tsx`.
 */
export const WorkoutsSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading Routines & Floor - workouts and routines"
      className="max-w-4xl mx-auto space-y-6 pb-28"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-8 w-60 rounded-xl bg-surface-tertiary/80 animate-pulse motion-reduce:animate-none border border-token-subtle" />
          <div className="h-4 w-72 rounded-lg bg-surface-tertiary/70 animate-pulse motion-reduce:animate-none border border-token-subtle" />
        </div>
        <div className="h-11 w-44 rounded-xl bg-surface-tertiary/80 animate-pulse motion-reduce:animate-none border border-token-subtle" />
      </div>

      {/* Routine Selector Bar */}
      <div className="card-token p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-token bg-surface-secondary/50 animate-pulse motion-reduce:animate-none">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-lg bg-surface-tertiary" />
          <div className="space-y-1">
            <div className="h-5 w-48 rounded bg-surface-tertiary" />
            <div className="h-3 w-36 rounded bg-surface-tertiary" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-xl bg-surface-tertiary" />
          <div className="h-9 w-20 rounded-xl bg-surface-tertiary" />
        </div>
      </div>

      {/* Weekday Schedule Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-10 w-24 shrink-0 rounded-xl bg-surface-secondary/70 border border-token animate-pulse motion-reduce:animate-none"
          />
        ))}
      </div>

      {/* Day's Exercises Container */}
      <div className="card-token p-5 sm:p-6 space-y-4 border-token bg-surface-secondary/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-5 w-40 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none" />
            <div className="h-3 w-28 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none" />
          </div>
          <div className="h-9 w-32 rounded-xl bg-surface-tertiary animate-pulse motion-reduce:animate-none" />
        </div>

        {/* 3 Exercise Cards */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-surface border border-token space-y-3 animate-pulse motion-reduce:animate-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-surface-tertiary" />
                  <div className="space-y-1">
                    <div className="h-4 w-44 rounded bg-surface-tertiary" />
                    <div className="h-3 w-28 rounded bg-surface-tertiary" />
                  </div>
                </div>
                <div className="h-7 w-20 rounded-lg bg-surface-tertiary" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Saved Routines Section */}
      <div className="space-y-3 pt-2">
        <div className="h-4 w-40 rounded bg-surface-tertiary animate-pulse motion-reduce:animate-none" />
        <div className="card-token p-5 border-token bg-surface-secondary/50 h-28 rounded-2xl animate-pulse motion-reduce:animate-none" />
      </div>
      <span className="sr-only">Loading workouts schedule and routines...</span>
    </div>
  );
};

export default WorkoutsSkeleton;
