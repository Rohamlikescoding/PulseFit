import '@testing-library/jest-dom/vitest';
import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router-dom';
import { createAppMemoryRouter } from '../router';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal';

describe('PulseFit Sanctuary Multipage Routing & Error Handling', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  // 1. Each route renders the right page
  describe('1. Route Rendering', () => {
    it('renders the Home / Main overview page on route "/"', async () => {
      const router = createAppMemoryRouter(['/']);
      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Sanctuary Equilibrium Gauge/i })
        ).toBeInTheDocument();
      });
      expect(screen.getByText(/Active Routine Split/i)).toBeInTheDocument();
    });

    it('renders the Workouts & Routines page on route "/workouts"', async () => {
      const router = createAppMemoryRouter(['/workouts']);
      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Workouts & Routines/i })
        ).toBeInTheDocument();
      });
      expect(screen.getByText(/Create New Routine/i)).toBeInTheDocument();
    });

    it('renders the Zen Timer page on route "/timer"', async () => {
      const router = createAppMemoryRouter(['/timer']);
      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Botanical Sanctuary · Interval Engine/i)
        ).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /Start Flow|Resume Flow/i })).toBeInTheDocument();
    });

    it('renders the Dashboard & Analytics page on route "/dashboard"', async () => {
      const router = createAppMemoryRouter(['/dashboard']);
      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Equilibrium & Performance Analytics/i })
        ).toBeInTheDocument();
      });
      expect(screen.getByText(/52-Week Training Consistency/i)).toBeInTheDocument();
    });
  });

  // 2. Clicking nav and floating bar links changes route and active state
  describe('2. Navigation and Active Link State', () => {
    it('navigates via top navigation bar links without full reload and updates active state', async () => {
      const user = userEvent.setup();
      const router = createAppMemoryRouter(['/']);
      render(<RouterProvider router={router} />);

      // Verify initial route is Home
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Overview/i })).toHaveClass('font-bold');
      });

      // Click "Routines & Floor" link
      const workoutsNavLink = screen.getByRole('link', { name: /Routines & Floor/i });
      await user.click(workoutsNavLink);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Workouts & Routines/i })).toBeInTheDocument();
        expect(workoutsNavLink).toHaveClass('font-bold');
      });

      // Click "Zen Timer" link
      const timerNavLink = screen.getByRole('link', { name: /Zen Timer/i });
      await user.click(timerNavLink);

      await waitFor(() => {
        expect(screen.getByText(/Botanical Sanctuary · Interval Engine/i)).toBeInTheDocument();
        expect(timerNavLink).toHaveClass('font-bold');
      });

      // Click "Analytics & Equilibrium" link
      const dashboardNavLink = screen.getByRole('link', { name: /Analytics & Equilibrium/i });
      await user.click(dashboardNavLink);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Equilibrium & Performance Analytics/i })).toBeInTheDocument();
        expect(dashboardNavLink).toHaveClass('font-bold');
      });

      // Click Wordmark to return to home
      const wordmarkLink = screen.getByRole('link', { name: /PulseFit Sanctuary/i });
      await user.click(wordmarkLink);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Sanctuary Equilibrium Gauge/i })).toBeInTheDocument();
      });
    });

    it('navigates via floating bottom bar links and highlights active state', async () => {
      const user = userEvent.setup();
      const router = createAppMemoryRouter(['/']);
      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Sanctuary Equilibrium Gauge/i })).toBeInTheDocument();
      });

      // Click FloatingBar "Routines" link
      const routinesBottomTab = screen.getByRole('tab', { name: 'Routines' });
      await user.click(routinesBottomTab);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Workouts & Routines/i })).toBeInTheDocument();
        expect(routinesBottomTab).toHaveClass('font-bold');
      });

      // Click FloatingBar "Zen Timer" link
      const timerBottomTab = screen.getByRole('tab', { name: 'Zen Timer' });
      await user.click(timerBottomTab);

      await waitFor(() => {
        expect(screen.getByText(/Botanical Sanctuary · Interval Engine/i)).toBeInTheDocument();
        expect(timerBottomTab).toHaveClass('font-bold');
      });
    });
  });

  // 3. An unknown URL shows the Not Found page
  describe('3. Unknown Route 404 Not Found Handling', () => {
    it('shows the Not Found page for invalid paths with a link back home', async () => {
      const router = createAppMemoryRouter(['/non-existent-route-path']);
      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Page Not Found/i })).toBeInTheDocument();
      });

      expect(screen.getByText(/404 · Uncharted Pathway/i)).toBeInTheDocument();
      const returnHomeLink = screen.getByRole('link', { name: /Return Home/i });
      expect(returnHomeLink).toBeInTheDocument();
      expect(returnHomeLink).toHaveAttribute('href', '/');
    });
  });

  // 4. A page that throws shows the error boundary, and "Try again" recovers
  describe('4. Error Boundary and Recovery', () => {
    it('displays friendly error boundary when a component throws, and recovers on Try Again', async () => {
      let shouldCrash = true;
      const Bomb = () => {
        if (shouldCrash) {
          throw new Error('Simulated gym equipment sensor malfunction!');
        }
        return <div>Stable Sanctuary Content</div>;
      };

      const TestHarness = () => {
        return (
          <ErrorBoundary
            onReset={() => {
              shouldCrash = false;
            }}
          >
            <Bomb />
          </ErrorBoundary>
        );
      };

      // Suppress console.error in test output for intentional simulated crash
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<TestHarness />);

      // Verify fallback boundary is active
      expect(screen.getByRole('heading', { name: /Something went wrong/i })).toBeInTheDocument();
      expect(screen.getByText(/Simulated gym equipment sensor malfunction!/i)).toBeInTheDocument();

      // Click "Try Again" which triggers onReset and re-renders recovered state
      const tryAgainBtn = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(tryAgainBtn);

      // Verify recovered
      await waitFor(() => {
        expect(screen.getByText('Stable Sanctuary Content')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  // 5. The GIF API failing shows the fallback UI
  describe('5. GIF API Failure and Fallback UI', () => {
    it('shows demonstration offline fallback and allows retry when exercise GIF fails', async () => {
      const mockExercise = {
        id: 'bench-press',
        name: 'Barbell Bench Press',
        gifUrl: '/api/exercises/animation?id=bench-press',
        bodyPart: 'chest',
        equipment: 'barbell',
        target: 'pectorals',
        secondaryMuscles: ['triceps'],
        instructions: ['Lie on bench', 'Press bar'],
        tips: ['Keep wrists straight'],
        difficulty: 'intermediate',
        mechanics: 'compound',
        force: 'push',
      };

      render(
        <ExerciseDetailModal
          exerciseId="bench-press"
          initialExercise={mockExercise as any}
          onClose={() => {}}
        />
      );

      // Verify exercise title rendered
      expect(screen.getByRole('heading', { name: /Barbell Bench Press/i })).toBeInTheDocument();

      // Find the image element and simulate image load error
      const img = screen.getByAltText(/Barbell Bench Press demonstration/i);
      expect(img).toBeInTheDocument();

      fireEvent.error(img);

      // Fallback UI should now be displayed
      await waitFor(() => {
        expect(screen.getByText(/Demonstration Animation Offline/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Reload GIF Animation/i })).toBeInTheDocument();
      });
    });
  });

  // 6. Direct navigation to each URL (a deep link) works
  describe('6. Direct Deep Link Navigation', () => {
    it('directly links to "/workouts"', async () => {
      const router = createAppMemoryRouter(['/workouts']);
      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Workouts & Routines/i })).toBeInTheDocument();
      });
    });

    it('directly links to "/timer"', async () => {
      const router = createAppMemoryRouter(['/timer']);
      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(screen.getByText(/Botanical Sanctuary · Interval Engine/i)).toBeInTheDocument();
      });
    });

    it('directly links to "/dashboard"', async () => {
      const router = createAppMemoryRouter(['/dashboard']);
      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Equilibrium & Performance Analytics/i })).toBeInTheDocument();
      });
    });
  });
});
