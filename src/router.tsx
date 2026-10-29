import React from 'react';
import {
  createBrowserRouter,
  createMemoryRouter,
  RouteObject,
} from 'react-router-dom';
import { RootLayout } from './pages/RootLayout';
import { RouteErrorBoundary } from './pages/RouteErrorBoundary';

// Lazy-load each page with React.lazy
const HomePage = React.lazy(() => import('./pages/HomePage'));
const WorkoutsPage = React.lazy(() => import('./pages/WorkoutsPage'));
const TimerPage = React.lazy(() => import('./pages/TimerPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: (
      <RootLayout>
        <RouteErrorBoundary />
      </RootLayout>
    ),
    children: [
      {
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'workouts',
            element: <WorkoutsPage />,
          },
          {
            path: 'timer',
            element: <TimerPage />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
];

// Production browser router
export const router = createBrowserRouter(routes, {basename: import.meta.env.BASE_URL});

// Factory for testing deep links and route transitions with memory router
export function createAppMemoryRouter(initialEntries: string[] = ['/']) {
  return createMemoryRouter(routes, {
    initialEntries,
  });
}
