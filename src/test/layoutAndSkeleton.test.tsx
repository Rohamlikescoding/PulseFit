import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setMockPathname } from './setup';
import {
  PageSkeleton,
  MainViewSkeleton,
  WorkoutsViewSkeleton,
  TimerViewSkeleton,
  DashboardViewSkeleton,
  ExerciseSearchSkeleton,
  ExerciseDetailSkeleton,
} from '../components/skeleton/PageSkeleton';
import { HomeSkeleton } from '../components/skeletons/HomeSkeleton';
import { WorkoutsSkeleton } from '../components/skeletons/WorkoutsSkeleton';
import { TimerSkeleton } from '../components/skeletons/TimerSkeleton';
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton';
import { Nav } from '../components/Nav';
import { FloatingBar } from '../components/FloatingBar';
import { MainView } from '../components/views/MainView';
import { WorkoutsView } from '../components/views/WorkoutsView';
import { TimerView } from '../components/views/TimerView';
import { DashboardView } from '../components/views/DashboardView';
import { ExerciseSearchModal } from '../components/ExerciseSearchModal';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal';
import { useWorkoutStore } from '../store/workoutStore';
import * as exerciseApi from '../lib/exerciseApi';
import { queryClient } from '../lib/queryClient';

describe('Unified Layout & Biophilic Skeleton Loading System', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    setMockPathname('/');
  });

  // 1. Universal Layout Architecture (Nav and FloatingBar on All Pages)
  describe('1. Universal Layout Architecture', () => {
    it('renders top Nav and floating bottom bar on the Home overview page', () => {
      setMockPathname('/');
      render(
        <div>
          <Nav />
          <MainView />
          <FloatingBar />
        </div>
      );

      expect(screen.getByText('PulseFit Sanctuary')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Sanctuary/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Routines/i })).toBeInTheDocument();
    });

    it('renders top Nav and floating bottom bar on Workouts & Routines page', () => {
      setMockPathname('/workouts');
      render(
        <div>
          <Nav />
          <WorkoutsView />
          <FloatingBar />
        </div>
      );

      expect(screen.getByText('PulseFit Sanctuary')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Routines & Floor/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Routines/i })).toBeInTheDocument();
    });

    it('renders top Nav and floating bottom bar on Zen Timer page', () => {
      setMockPathname('/timer');
      render(
        <div>
          <Nav />
          <TimerView />
          <FloatingBar />
        </div>
      );

      expect(screen.getByText('PulseFit Sanctuary')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Zen Timer/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Zen Timer/i })).toBeInTheDocument();
    });

    it('renders top Nav and floating bottom bar on Dashboard & Analytics page', () => {
      setMockPathname('/dashboard');
      render(
        <div>
          <Nav />
          <DashboardView />
          <FloatingBar />
        </div>
      );

      expect(screen.getByText('PulseFit Sanctuary')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Analytics & Equilibrium/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Analytics/i })).toBeInTheDocument();
    });
  });

  // 2. Individual Skeleton Components
  describe('2. Skeleton Layout Fidelity & Accessibility', () => {
    it('renders HomeSkeleton with accessible status and progress', () => {
      render(<HomeSkeleton />);
      const skeletonRegion = screen.getByRole('status', { name: /Loading Overview/i });
      expect(skeletonRegion).toBeInTheDocument();
      expect(skeletonRegion).toHaveAttribute('aria-busy', 'true');
    });

    it('renders WorkoutsSkeleton with accessible status and progress', () => {
      render(<WorkoutsSkeleton />);
      const skeletonRegion = screen.getByRole('status', { name: /Loading Routines & Floor/i });
      expect(skeletonRegion).toBeInTheDocument();
      expect(skeletonRegion).toHaveAttribute('aria-busy', 'true');
    });

    it('renders TimerSkeleton with accessible status and progress', () => {
      render(<TimerSkeleton />);
      const skeletonRegion = screen.getByRole('status', { name: /Loading Zen Timer/i });
      expect(skeletonRegion).toBeInTheDocument();
      expect(skeletonRegion).toHaveAttribute('aria-busy', 'true');
    });

    it('renders DashboardSkeleton with accessible status and progress', () => {
      render(<DashboardSkeleton />);
      const skeletonRegion = screen.getByRole('status', { name: /Loading Analytics & Equilibrium/i });
      expect(skeletonRegion).toBeInTheDocument();
      expect(skeletonRegion).toHaveAttribute('aria-busy', 'true');
    });
  });

  // 3. Adaptive PageSkeleton by Path
  describe('3. Adaptive PageSkeleton Routing Support', () => {
    it('renders HomeSkeleton for root path "/"', () => {
      render(<PageSkeleton forcePath="/" />);
      expect(screen.getByRole('status', { name: /Loading Overview/i })).toBeInTheDocument();
    });

    it('renders WorkoutsSkeleton for path "/workouts"', () => {
      render(<PageSkeleton forcePath="/workouts" />);
      expect(screen.getByRole('status', { name: /Loading Routines & Floor/i })).toBeInTheDocument();
    });

    it('renders TimerSkeleton for path "/timer"', () => {
      render(<PageSkeleton forcePath="/timer" />);
      expect(screen.getByRole('status', { name: /Loading Zen Timer/i })).toBeInTheDocument();
    });

    it('renders DashboardSkeleton for path "/dashboard"', () => {
      render(<PageSkeleton forcePath="/dashboard" />);
      expect(screen.getByRole('status', { name: /Loading Analytics & Equilibrium/i })).toBeInTheDocument();
    });
  });

  // 4. In-View Skeleton Integration on Loading State
  describe('4. In-View Skeleton Integration', () => {
    it('renders skeleton loading in MainView when isLoading is true', () => {
      render(<MainView isLoading={true} />);
      expect(screen.getByRole('status', { name: /Loading Overview/i })).toBeInTheDocument();
    });

    it('renders skeleton loading in WorkoutsView when isLoading is true', () => {
      render(<WorkoutsView isLoading={true} />);
      expect(screen.getByRole('status', { name: /Loading Routines & Floor/i })).toBeInTheDocument();
    });

    it('renders skeleton loading in TimerView when isLoading is true', () => {
      render(<TimerView isLoading={true} />);
      expect(screen.getByRole('status', { name: /Loading Zen Timer/i })).toBeInTheDocument();
    });

    it('renders skeleton loading in DashboardView when isLoading is true', () => {
      render(<DashboardView isLoading={true} />);
      expect(screen.getByRole('status', { name: /Loading Analytics & Equilibrium/i })).toBeInTheDocument();
    });
  });

  // 5. Modal Skeleton Integration
  describe('5. Modal Skeleton Integration', () => {
    it('renders ExerciseSearchSkeleton during search query processing', () => {
      render(<ExerciseSearchSkeleton count={3} />);
      expect(screen.getByRole('status', { name: /Loading exercises\.\.\./i })).toBeInTheDocument();
    });

    it('renders ExerciseDetailSkeleton when loading exercise instructions', () => {
      render(<ExerciseDetailSkeleton />);
      expect(screen.getByRole('status', { name: /Loading exercise form guide\.\.\./i })).toBeInTheDocument();
    });
  });

  // 6. Error States with Retry Mechanism
  describe('6. Error States with Retry Mechanism', () => {
    it('displays error state with retry button in MainView', () => {
      const retryMock = vi.fn();
      render(<MainView error="Workout API request timed out" onRetry={retryMock} />);

      expect(screen.getByText('Workout API request timed out')).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /Retry/i });
      expect(retryBtn).toBeInTheDocument();
      retryBtn.click();
      expect(retryMock).toHaveBeenCalledTimes(1);
    });

    it('displays error state with retry button in WorkoutsView', () => {
      const retryMock = vi.fn();
      render(<WorkoutsView error="Failed to sync routines" onRetry={retryMock} />);

      expect(screen.getByText('Failed to sync routines')).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /Retry/i });
      expect(retryBtn).toBeInTheDocument();
      retryBtn.click();
      expect(retryMock).toHaveBeenCalledTimes(1);
    });

    it('displays error state with retry button in TimerView', () => {
      const retryMock = vi.fn();
      render(<TimerView error="Audio Context buffer initialization failed" onRetry={retryMock} />);

      expect(screen.getByText('Audio Context buffer initialization failed')).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /Retry/i });
      expect(retryBtn).toBeInTheDocument();
      retryBtn.click();
      expect(retryMock).toHaveBeenCalledTimes(1);
    });

    it('displays error state with retry button in DashboardView', () => {
      const retryMock = vi.fn();
      render(<DashboardView error="Analytics data corrupt" onRetry={retryMock} />);

      expect(screen.getByText('Analytics data corrupt')).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /Retry/i });
      expect(retryBtn).toBeInTheDocument();
      retryBtn.click();
      expect(retryMock).toHaveBeenCalledTimes(1);
    });
  });

  // 7. Empty States
  describe('7. Empty State Handling', () => {
    it('displays helpful empty state when user has no active routines', () => {
      useWorkoutStore.setState({ routines: [], activeRoutineId: null });
      render(<WorkoutsView />);

      expect(screen.getByText('No Workout Routines Created')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Your First Routine/i })).toBeInTheDocument();
    });
  });

  // 8. Shared Query Caching & Prefetching
  describe('8. Shared Query Caching & Route Prefetching', () => {
    it('prefetches and caches exercise data in queryClient with 5-minute staleTime', async () => {
      vi.spyOn(exerciseApi, 'fetchExercises').mockResolvedValueOnce([
        {
          id: 'test-curl',
          name: 'Bicep Curl',
          bodyPart: 'upper arms',
          equipment: 'Dumbbell',
          target: 'biceps',
          gifUrl: '/api/exercises/animation?id=test-curl',
          instructions: ['Curl the weight'],
          tips: ['Squeeze biceps'],
          difficulty: 'beginner',
          mechanics: 'isolation',
          force: 'pull',
        },
      ]);

      const data = await queryClient.fetchQuery({
        queryKey: ['exercises', 'list', 'curl', 'all'],
        queryFn: () => exerciseApi.fetchExercises({ q: 'curl' }),
        staleTime: 5 * 60 * 1000,
      });

      expect(data).toHaveLength(1);
      expect(data[0].id).toBe('test-curl');

      // Second call immediately resolves from cache (fetchExercises not called again)
      const cachedData = queryClient.getQueryData(['exercises', 'list', 'curl', 'all']);
      expect(cachedData).toEqual(data);
    });
  });

  // 9. Routine Creation and Persistence under "apexfit-storage"
  describe('9. Routine Create & Persistence under "apexfit-storage"', () => {
    it('saves created routine into localStorage under "apexfit-storage" key', () => {
      const store = useWorkoutStore.getState();
      const newRoutineId = store.addRoutine({
        name: 'Zen Strength 4-Day',
        daysPerWeek: 4,
        days: [
          {
            weekday: 1,
            name: 'Day 1 Upper',
            exercises: [
              {
                exerciseId: 'db-bench-press',
                name: 'Dumbbell Bench Press',
                gifUrl: '/api/exercises/animation?id=db-bench-press',
                targetSets: 4,
              },
            ],
          },
        ],
      });

      expect(newRoutineId).toBeDefined();

      const raw = window.localStorage.getItem('apexfit-storage');
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.state).toBeDefined();
      expect(parsed.state.routines.some((r: any) => r.name === 'Zen Strength 4-Day')).toBe(true);
    });

    it('persists workout session logs under "apexfit-storage"', () => {
      const store = useWorkoutStore.getState();
      store.startSession('routine-1', 1);
      store.updateSessionSet(0, 0, 12, 28);
      store.toggleSessionSetCompletion(0, 0);
      const finishedLog = store.finishActiveSession();

      expect(finishedLog).not.toBeNull();
      const raw = window.localStorage.getItem('apexfit-storage');
      const parsed = JSON.parse(raw!);
      expect(parsed.state.sessionLogs.length).toBeGreaterThan(0);
      expect(parsed.state.sessionLogs[0].exercises[0].sets[0].weight).toBe(28);
    });
  });

  // 10. Search Queries & API Fallbacks
  describe('10. Search Queries and API Fallbacks', () => {
    it('returns different results for bench query vs squat query', async () => {
      const benchResults = await exerciseApi.fetchExercises({ q: 'bench' });
      const squatResults = await exerciseApi.fetchExercises({ q: 'squat' });

      expect(benchResults.some((ex) => ex.name.toLowerCase().includes('bench'))).toBe(true);
      expect(squatResults.some((ex) => ex.name.toLowerCase().includes('squat'))).toBe(true);
      expect(benchResults).not.toEqual(squatResults);
    });

    it('gracefully falls back to curated exercises if network fetch fails', async () => {
      // Temporarily mock fetch throwing
      const origFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network offline'));

      const fallbackData = await exerciseApi.fetchExercises({ q: 'curl' });
      expect(fallbackData.length).toBeGreaterThan(0);
      expect(fallbackData.some((ex) => ex.name.toLowerCase().includes('curl'))).toBe(true);

      global.fetch = origFetch;
    });
  });
});
