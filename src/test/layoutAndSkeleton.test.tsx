import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, MemoryRouter } from 'react-router-dom';
import { createAppMemoryRouter } from '../router';
import * as exerciseApi from '../lib/exerciseApi';
import {
  PageSkeleton,
  MainViewSkeleton,
  WorkoutsViewSkeleton,
  TimerViewSkeleton,
  DashboardViewSkeleton,
  ExerciseSearchSkeleton,
  ExerciseDetailSkeleton,
} from '../components/skeleton/PageSkeleton';
import { Skeleton, SkeletonCard, SkeletonCircle, SkeletonText } from '../components/skeleton/Skeleton';
import { MainView } from '../components/views/MainView';
import { WorkoutsView } from '../components/views/WorkoutsView';
import { TimerView } from '../components/views/TimerView';
import { DashboardView } from '../components/views/DashboardView';
import { ExerciseSearchModal } from '../components/ExerciseSearchModal';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal';

describe('Unified Layout & Biophilic Skeleton Loading System', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.scrollTo = vi.fn();
    vi.clearAllMocks();
  });

  describe('1. Universal Layout Architecture (Nav and FloatingBar on All Pages)', () => {
    it('renders top Nav and floating bottom bar on the Home overview page', async () => {
      const router = createAppMemoryRouter(['/']);
      render(<RouterProvider router={router} />);

      // Top Nav Wordmark and Links
      expect(screen.getByRole('link', { name: /PulseFit Sanctuary/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Overview/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Routines & Floor/i })).toBeInTheDocument();

      // Floating bottom bar tabs
      expect(screen.getByRole('tab', { name: 'Sanctuary' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Routines' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Zen Timer' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Analytics' })).toBeInTheDocument();

      // Main content region
      const mainElement = document.querySelector('main#main-content');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toContainElement(
        await screen.findByRole('heading', { name: /Sanctuary Equilibrium Gauge/i })
      );
    });

    it('renders top Nav and floating bottom bar on Workouts & Routines page', async () => {
      const router = createAppMemoryRouter(['/workouts']);
      render(<RouterProvider router={router} />);

      expect(screen.getByRole('link', { name: /PulseFit Sanctuary/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Routines' })).toBeInTheDocument();

      const mainElement = document.querySelector('main#main-content');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toContainElement(
        await screen.findByRole('heading', { name: /Workouts & Routines/i })
      );
    });

    it('renders top Nav and floating bottom bar on Zen Timer page', async () => {
      const router = createAppMemoryRouter(['/timer']);
      render(<RouterProvider router={router} />);

      expect(screen.getByRole('link', { name: /PulseFit Sanctuary/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Zen Timer' })).toBeInTheDocument();

      const mainElement = document.querySelector('main#main-content');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toContainElement(
        await screen.findByText(/Botanical Sanctuary · Interval Engine/i)
      );
    });

    it('renders top Nav and floating bottom bar on Dashboard & Analytics page', async () => {
      const router = createAppMemoryRouter(['/dashboard']);
      render(<RouterProvider router={router} />);

      expect(screen.getByRole('link', { name: /PulseFit Sanctuary/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Analytics' })).toBeInTheDocument();

      const mainElement = document.querySelector('main#main-content');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toContainElement(
        await screen.findByRole('heading', { name: /Equilibrium & Performance Analytics/i })
      );
    });

    it('renders top Nav and floating bottom bar on 404 Unknown Route page', async () => {
      const router = createAppMemoryRouter(['/random-undefined-path-xyz']);
      render(<RouterProvider router={router} />);

      // Top Nav and FloatingBar are preserved
      expect(screen.getByRole('link', { name: /PulseFit Sanctuary/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Sanctuary' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Routines' })).toBeInTheDocument();

      // Main container has 404 Not Found
      const mainElement = document.querySelector('main#main-content');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toContainElement(
        await screen.findByRole('heading', { name: /Page Not Found/i })
      );
    });
  });

  describe('2. Skeleton Primitives & Accessible Attributes', () => {
    it('renders Skeleton primitives with role="status" and aria-busy="true"', () => {
      render(
        <div>
          <Skeleton data-testid="basic-skel" width={200} height={30} />
          <SkeletonCircle data-testid="circle-skel" size={40} />
          <SkeletonText lines={3} />
          <SkeletonCard data-testid="card-skel" />
        </div>
      );

      const statusElements = screen.getAllByRole('status');
      expect(statusElements.length).toBeGreaterThan(0);
      statusElements.forEach((el) => {
        expect(el).toHaveAttribute('aria-busy', 'true');
      });
    });
  });

  describe('3. Route-Aware PageSkeleton Screens', () => {
    it('renders MainViewSkeleton with Sanctuary gauge and metric placeholders', () => {
      render(<MainViewSkeleton />);
      const statusElement = screen.getByRole('status', { name: /Loading Overview/i });
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('aria-busy', 'true');
    });

    it('renders WorkoutsViewSkeleton with routine selector and split chips', () => {
      render(<WorkoutsViewSkeleton />);
      const statusElement = screen.getByRole('status', { name: /Loading Workouts & Routines/i });
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('aria-busy', 'true');
    });

    it('renders TimerViewSkeleton with interval dial and chips placeholders', () => {
      render(<TimerViewSkeleton />);
      const statusElement = screen.getByRole('status', { name: /Loading Zen Timer/i });
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('aria-busy', 'true');
    });

    it('renders DashboardViewSkeleton with 4 metric cards and chart placeholders', () => {
      render(<DashboardViewSkeleton />);
      const statusElement = screen.getByRole('status', { name: /Loading Equilibrium Dashboard/i });
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('aria-busy', 'true');
    });

    it('renders adaptive PageSkeleton dynamically based on forcePath', () => {
      const { rerender } = render(<PageSkeleton forcePath="/workouts" />);
      expect(screen.getByRole('status', { name: /Loading Workouts & Routines/i })).toBeInTheDocument();

      rerender(<PageSkeleton forcePath="/timer" />);
      expect(screen.getByRole('status', { name: /Loading Zen Timer/i })).toBeInTheDocument();

      rerender(<PageSkeleton forcePath="/dashboard" />);
      expect(screen.getByRole('status', { name: /Loading Equilibrium Dashboard/i })).toBeInTheDocument();

      rerender(<PageSkeleton forcePath="/" />);
      expect(screen.getByRole('status', { name: /Loading Overview/i })).toBeInTheDocument();
    });
  });

  describe('4. Component Views Skeleton Loading States', () => {
    it('renders skeleton loading in MainView when isLoading is true', () => {
      render(
        <MemoryRouter>
          <MainView isLoading={true} />
        </MemoryRouter>
      );
      expect(screen.getByRole('status', { name: /Loading Overview/i })).toBeInTheDocument();
    });

    it('renders skeleton loading in WorkoutsView when isLoading is true', () => {
      render(
        <MemoryRouter>
          <WorkoutsView isLoading={true} />
        </MemoryRouter>
      );
      expect(screen.getByRole('status', { name: /Loading Workouts & Routines/i })).toBeInTheDocument();
    });

    it('renders skeleton loading in TimerView when isLoading is true', () => {
      render(<TimerView isLoading={true} />);
      expect(screen.getByRole('status', { name: /Loading Zen Timer/i })).toBeInTheDocument();
    });

    it('renders skeleton loading in DashboardView when isLoading is true', () => {
      render(<DashboardView isLoading={true} />);
      expect(screen.getByRole('status', { name: /Loading Equilibrium Dashboard/i })).toBeInTheDocument();
    });
  });

  describe('5. Modal Skeleton Loading (Exercise Catalog & Details)', () => {
    it('renders ExerciseSearchSkeleton in ExerciseSearchModal when loading exercises', async () => {
      vi.spyOn(exerciseApi, 'fetchExercises').mockReturnValue(new Promise(() => {}));

      render(
        <ExerciseSearchModal
          isOpen={true}
          onClose={() => {}}
          onSelectExercise={() => {}}
        />
      );

      // Verify the search modal renders with loading status and skeleton items
      await waitFor(() => {
        expect(screen.getByText(/Searching botanical exercise catalog/i)).toBeInTheDocument();
      });

      const skeletonList = screen.getByRole('status', { name: /Loading exercises/i });
      expect(skeletonList).toBeInTheDocument();
      expect(skeletonList).toHaveAttribute('aria-busy', 'true');
    });

    it('renders ExerciseDetailSkeleton in ExerciseDetailModal while fetching exercise data', async () => {
      vi.spyOn(exerciseApi, 'fetchExerciseById').mockReturnValue(new Promise(() => {}));

      render(
        <ExerciseDetailModal
          exerciseId="test-loading-id"
          onClose={() => {}}
        />
      );

      // Verifies loading message and skeleton guide
      await waitFor(() => {
        expect(screen.getByText(/Loading exercise biomechanics & demonstration/i)).toBeInTheDocument();
      });

      const detailSkeleton = screen.getByRole('status', { name: /Loading exercise form guide/i });
      expect(detailSkeleton).toBeInTheDocument();
      expect(detailSkeleton).toHaveAttribute('aria-busy', 'true');
    });
  });
});
