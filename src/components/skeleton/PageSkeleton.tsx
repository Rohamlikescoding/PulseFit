import React from 'react';
import { useLocation } from 'react-router-dom';
import { Skeleton, SkeletonCard, SkeletonCircle, SkeletonText } from './Skeleton';
import { Leaf, Sparkles } from 'lucide-react';

export const MainViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto" role="status" aria-busy="true" aria-label="Loading Overview">
      {/* Header Eyebrow & Title Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton height={14} width={180} />
          <Skeleton height={32} width={260} />
        </div>
        <Skeleton height={38} width={140} className="rounded-xl" />
      </div>

      {/* Sanctuary Equilibrium Gauge Skeleton */}
      <div className="card-token p-6 sm:p-8 space-y-6 border-token bg-surface-secondary/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-md w-full">
            <div className="flex items-center gap-2">
              <SkeletonCircle size={28} />
              <Skeleton height={20} width={200} />
            </div>
            <SkeletonText lines={2} lastLineWidth="80%" />
            <div className="flex gap-2 pt-2">
              <Skeleton height={28} width={110} className="rounded-lg" />
              <Skeleton height={28} width={130} className="rounded-lg" />
            </div>
          </div>

          {/* Radial Shimmer Meter */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <SkeletonCircle size={160} className="opacity-40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <Leaf className="w-6 h-6 text-[#74a87c]/40 animate-pulse" />
              <Skeleton height={24} width={48} />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonCard height={110} />
        <SkeletonCard height={110} />
        <SkeletonCard height={110} />
      </div>

      {/* Today's Workout & Split Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard height={220} />
        <SkeletonCard height={220} />
      </div>
    </div>
  );
};

export const WorkoutsViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto" role="status" aria-busy="true" aria-label="Loading Workouts & Routines">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton height={32} width={240} />
          <Skeleton height={16} width={300} />
        </div>
        <Skeleton height={40} width={160} className="rounded-xl" />
      </div>

      {/* Routine Selector Bar Skeleton */}
      <div className="card-token p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <SkeletonCircle size={24} />
          <Skeleton height={22} width={180} />
        </div>
        <div className="flex gap-2">
          <Skeleton height={32} width={80} className="rounded-lg" />
          <Skeleton height={32} width={80} className="rounded-lg" />
        </div>
      </div>

      {/* Weekday Split Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={36} width={88} className="rounded-xl shrink-0" />
        ))}
      </div>

      {/* Exercise Cards */}
      <div className="space-y-3">
        <SkeletonCard height={130} />
        <SkeletonCard height={130} />
        <SkeletonCard height={130} />
      </div>
    </div>
  );
};

export const TimerViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto" role="status" aria-busy="true" aria-label="Loading Zen Timer">
      <div className="card-token p-8 flex flex-col items-center justify-center space-y-8 bg-surface-secondary/50">
        {/* Header indicator */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#74a87c]/50 animate-pulse" />
          <Skeleton height={16} width={220} />
        </div>

        {/* Circular Dual-Loop Dial Skeleton */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <SkeletonCircle size={260} className="opacity-30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Skeleton height={48} width={160} />
            <Skeleton height={16} width={100} />
          </div>
        </div>

        {/* Preset Interval Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={34} width={76} className="rounded-xl" />
          ))}
        </div>

        {/* Primary Flow Control Buttons */}
        <div className="flex items-center gap-4">
          <Skeleton height={46} width={150} className="rounded-2xl" />
          <Skeleton height={46} width={90} className="rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export const DashboardViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto" role="status" aria-busy="true" aria-label="Loading Equilibrium Dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton height={30} width={260} />
          <Skeleton height={16} width={340} />
        </div>
        <Skeleton height={38} width={130} className="rounded-xl" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard height={96} />
        <SkeletonCard height={96} />
        <SkeletonCard height={96} />
        <SkeletonCard height={96} />
      </div>

      {/* Heatmap Section */}
      <div className="card-token p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton height={18} width={200} />
          <Skeleton height={14} width={120} />
        </div>
        <Skeleton height={110} width="100%" className="rounded-xl" />
      </div>

      {/* 2 Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard height={280} />
        <SkeletonCard height={280} />
      </div>
    </div>
  );
};

export const ExerciseSearchSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading exercises...">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface-secondary border border-token animate-pulse"
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
      {/* Media placeholder */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-surface-tertiary/70 border border-token flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center gap-2 text-token-muted">
          <Leaf className="w-8 h-8 text-[#74a87c]/40 animate-pulse" />
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
    const location = useLocation();
    pathname = location.pathname;
  } catch {
    pathname = '/';
  }

  const effectivePath = forcePath || pathname;

  if (effectivePath.startsWith('/workouts')) {
    return <WorkoutsViewSkeleton />;
  }

  if (effectivePath.startsWith('/timer')) {
    return <TimerViewSkeleton />;
  }

  if (effectivePath.startsWith('/dashboard')) {
    return <DashboardViewSkeleton />;
  }

  // Default to Main Overview Skeleton
  return <MainViewSkeleton />;
};

export default PageSkeleton;
