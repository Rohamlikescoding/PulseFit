'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { HomeSkeleton } from '../skeletons/HomeSkeleton';
import { WorkoutsSkeleton } from '../skeletons/WorkoutsSkeleton';
import { TimerSkeleton } from '../skeletons/TimerSkeleton';
import { DashboardSkeleton } from '../skeletons/DashboardSkeleton';
import { Skeleton, SkeletonText } from './Skeleton';
import { Leaf } from 'lucide-react';

export { HomeSkeleton, WorkoutsSkeleton, TimerSkeleton, DashboardSkeleton };

// Backwards-compatible aliases
export const MainViewSkeleton = HomeSkeleton;
export const WorkoutsViewSkeleton = WorkoutsSkeleton;
export const TimerViewSkeleton = TimerSkeleton;
export const DashboardViewSkeleton = DashboardSkeleton;

export const ExerciseSearchSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading exercises...">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface-secondary border border-token animate-pulse motion-reduce:animate-none"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton width={56} height={56} className="rounded-xl shrink-0" />
            <div className="space-y-2 min-w-0 flex-1">
              <Skeleton height={16} width="60%" />
              <div className="flex items-center gap-2">
                <Skeleton height={12} width={60} />
                <Skeleton height={12} width={75} />
              </div>
            </div>
          </div>
          <Skeleton height={32} width={70} className="rounded-xl shrink-0" />
        </div>
      ))}
      <span className="sr-only">Searching exercises catalog...</span>
    </div>
  );
};

export const ExerciseDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading exercise form guide...">
      {/* Media placeholder with static aspect-ratio container */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-surface-tertiary/70 border border-token flex items-center justify-center animate-pulse motion-reduce:animate-none">
        <div className="flex flex-col items-center gap-2 text-token-muted">
          <Leaf className="w-8 h-8 text-[#74a87c]/40 animate-pulse motion-reduce:animate-none" />
          <span className="text-xs font-mono">Synchronizing Demonstration...</span>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex items-center gap-2">
        <Skeleton height={24} width={80} className="rounded-lg" />
        <Skeleton height={24} width={90} className="rounded-lg" />
        <Skeleton height={24} width={70} className="rounded-lg" />
      </div>

      {/* Instruction Steps */}
      <div className="space-y-3">
        <Skeleton height={18} width={160} />
        <SkeletonText lines={4} lastLineWidth="75%" />
      </div>
    </div>
  );
};

/**
 * Intelligent Route-Aware Page Skeleton
 * Inspects the current path location or explicit prop to render the optimal
 * biophilic skeleton screen, communicating to the user that data is loading smoothly.
 */
export const PageSkeleton: React.FC<{ forcePath?: string }> = ({ forcePath }) => {
  let pathname = '/';
  try {
    const current = usePathname();
    pathname = current || '/';
  } catch {
    pathname = '/';
  }

  const effectivePath = forcePath || pathname;

  if (effectivePath.startsWith('/workouts')) {
    return <WorkoutsSkeleton />;
  }

  if (effectivePath.startsWith('/timer')) {
    return <TimerSkeleton />;
  }

  if (effectivePath.startsWith('/dashboard')) {
    return <DashboardSkeleton />;
  }

  // Default to Home Skeleton
  return <HomeSkeleton />;
};

export default PageSkeleton;
