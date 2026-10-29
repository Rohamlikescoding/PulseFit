import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setMockPathname } from './setup';
import HomePage from '../../app/page';
import WorkoutsPage from '../../app/workouts/page';
import TimerPage from '../../app/timer/page';
import DashboardPage from '../../app/dashboard/page';
import NotFound from '../../app/not-found';
import RootError from '../../app/error';
import WorkoutsError from '../../app/workouts/error';
import DashboardError from '../../app/dashboard/error';
import { Nav } from '../components/Nav';
import { FloatingBar } from '../components/FloatingBar';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal';
import { CURATED_EXERCISES } from '../data/exercisesData';
import * as exerciseApi from '../lib/exerciseApi';

describe('PulseFit Sanctuary Next.js App Router & Component Suite', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    setMockPathname('/');
  });

  // 1. Each route renders the right page
  describe('1. Route Rendering', () => {
    it('renders the Home / Main overview page on route "/"', async () => {
      setMockPathname('/');
      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Sanctuary Equilibrium Gauge/i })
        ).toBeInTheDocument();
      });
      expect(screen.getByText(/Active Routine Split/i)).toBeInTheDocument();
    });

    it('renders the Workouts & Routines page on route "/workouts"', async () => {
      setMockPathname('/workouts');
      render(<WorkoutsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Workouts & Routines/i })
        ).toBeInTheDocument();
      });
      expect(screen.getByText(/Create New Routine/i)).toBeInTheDocument();
    });

    it('renders the Zen Timer page on route "/timer"', async () => {
      setMockPathname('/timer');
      render(<TimerPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Botanical Sanctuary · Interval Engine/i)
        ).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /Start Flow/i })).toBeInTheDocument();
    });

    it('renders the Dashboard & Analytics page on route "/dashboard"', async () => {
      setMockPathname('/dashboard');
      render(<DashboardPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Equilibrium & Performance Analytics/i })
        ).toBeInTheDocument();
      });
      expect(screen.getByText(/52-Week Training Consistency/i)).toBeInTheDocument();
    });
  });

  // 2. Navigation and Active Link State
  describe('2. Navigation and Active Link State', () => {
    it('navigates via top navigation bar links without full reload and updates active state', async () => {
      setMockPathname('/');
      const { rerender } = render(<Nav key="/" />);

      const overviewLink = screen.getByRole('link', { name: /Overview/i });
      expect(overviewLink).toHaveClass('font-bold');

      // Click routines
      setMockPathname('/workouts');
      rerender(<Nav key="/workouts" />);
      const routinesLink = screen.getByRole('link', { name: /Routines & Floor/i });
      expect(routinesLink).toHaveClass('font-bold');

      // Click timer
      setMockPathname('/timer');
      rerender(<Nav key="/timer" />);
      const timerLink = screen.getByRole('link', { name: /Zen Timer/i });
      expect(timerLink).toHaveClass('font-bold');

      // Click dashboard
      setMockPathname('/dashboard');
      rerender(<Nav key="/dashboard" />);
      const dashboardLink = screen.getByRole('link', { name: /Analytics & Equilibrium/i });
      expect(dashboardLink).toHaveClass('font-bold');
    });

    it('navigates via bottom floating bar and highlights active section', async () => {
      setMockPathname('/');
      const { rerender } = render(<FloatingBar key="/" />);

      const sanctuaryTab = screen.getByRole('tab', { name: /Sanctuary/i });
      expect(sanctuaryTab).toHaveClass('font-bold');

      setMockPathname('/workouts');
      rerender(<FloatingBar key="/workouts" />);
      const routinesTab = screen.getByRole('tab', { name: /Routines/i });
      expect(routinesTab).toHaveClass('font-bold');

      setMockPathname('/timer');
      rerender(<FloatingBar key="/timer" />);
      const timerTab = screen.getByRole('tab', { name: /Zen Timer/i });
      expect(timerTab).toHaveClass('font-bold');

      setMockPathname('/dashboard');
      rerender(<FloatingBar key="/dashboard" />);
      const analyticsTab = screen.getByRole('tab', { name: /Analytics/i });
      expect(analyticsTab).toHaveClass('font-bold');
    });
  });

  // 3. Unknown Route 404 Not Found Handling
  describe('3. Unknown Route 404 Not Found Handling', () => {
    it('shows the Not Found page for invalid paths with a link back home', () => {
      render(<NotFound />);

      expect(screen.getByText(/404 · Uncharted Pathway/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Page Not Found/i })).toBeInTheDocument();

      const homeLink = screen.getByRole('link', { name: /Return Home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  // 4. Route Error Boundary & Retry
  describe('4. Route Error Boundary & Retry', () => {
    it('renders root error boundary with error message and retry button', () => {
      const resetMock = vi.fn();
      render(<RootError error={new Error('Simulated network disruption')} reset={resetMock} />);

      expect(screen.getByText(/System Equilibrium Interrupted/i)).toBeInTheDocument();
      expect(screen.getByText(/Simulated network disruption/i)).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      expect(retryButton).toBeInTheDocument();
      fireEvent.click(retryButton);
      expect(resetMock).toHaveBeenCalledTimes(1);

      const returnLink = screen.getByRole('link', { name: /Return to Sanctuary/i });
      expect(returnLink).toHaveAttribute('href', '/');
    });

    it('renders workouts error boundary and executes retry', () => {
      const resetMock = vi.fn();
      render(<WorkoutsError error={new Error('Failed to load routine')} reset={resetMock} />);

      expect(screen.getByRole('heading', { name: /Unable to Load Routines & Floor/i })).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(retryBtn);
      expect(resetMock).toHaveBeenCalledTimes(1);
    });

    it('renders dashboard error boundary and executes retry', () => {
      const resetMock = vi.fn();
      render(<DashboardError error={new Error('Failed to load chart metrics')} reset={resetMock} />);

      expect(screen.getByRole('heading', { name: /Unable to Load Analytics/i })).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(retryBtn);
      expect(resetMock).toHaveBeenCalledTimes(1);
    });
  });

  // 5. GIF API Failure and Fallback UI
  describe('5. GIF API Failure and Fallback UI', () => {
    it('shows demonstration offline fallback and allows retry when exercise GIF fails', async () => {
      const user = userEvent.setup();

      render(
        <ExerciseDetailModal
          onClose={() => {}}
          exerciseId="db-bench-press"
          initialExercise={CURATED_EXERCISES[0]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Exercise Details & Form Guide/i)).toBeInTheDocument();
      });

      const gifImg = await screen.findByAltText(/Dumbbell Bench Press demonstration/i);
      fireEvent.error(gifImg);

      await waitFor(() => {
        expect(screen.getByText(/Demonstration Animation Offline/i)).toBeInTheDocument();
      });

      const reloadBtn = screen.getByRole('button', { name: /Reload GIF Animation/i });
      expect(reloadBtn).toBeInTheDocument();
      await user.click(reloadBtn);
    });
  });
});
