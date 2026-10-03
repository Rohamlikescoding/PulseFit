import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { FloatingBar } from '../components/FloatingBar';
import { NotificationHost } from '../components/NotificationHost';
import { PageSkeleton } from '../components/skeleton/PageSkeleton';
import { useWorkoutStore } from '../store/workoutStore';
import { runScheduleTests } from '../lib/schedule.test';

interface RootLayoutProps {
  children?: React.ReactNode;
}

export const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const { settings } = useWorkoutStore();
  const location = useLocation();

  // Scroll smoothly to top on route transition for optimal UX
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } catch {
      // Fallback for older test environments
      window.scrollTo(0, 0);
    }
  }, [location?.pathname]);

  // Active Theme Synchronization
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      const isSystemLight =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: light)').matches;

      const isLight =
        settings.theme === 'light' || (settings.theme === 'system' && isSystemLight);

      if (isLight) {
        root.classList.add('light');
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
      }
    };

    applyTheme();

    if (settings.theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: light)');
      const listener = () => applyTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  // Run in-browser automated schedule verification
  useEffect(() => {
    try {
      const testResult = runScheduleTests();
      if (!testResult.passed) {
        console.warn('[ScheduleTests] Some assertions failed:', testResult.results);
      }
    } catch (e) {
      console.error('[ScheduleTests] Error running tests:', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-app text-token-primary flex flex-col antialiased selection:bg-[#74a87c]/30 selection:text-[#9dd3a4] transition-colors duration-200">
      {/* Top Nav Bar with 3-Zone Contract - Persistent for all pages */}
      <Nav />

      {/* Reusable Workout-Day Notification Host */}
      <NotificationHost />

      {/* Main Routed Body - The central content area of the layout */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 focus:outline-none"
      >
        {children ? (
          children
        ) : (
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        )}
      </main>

      {/* Floating Bottom Bar (Mobile-first, highlighted active section) - Persistent for all pages */}
      <FloatingBar />
    </div>
  );
};

export default RootLayout;
