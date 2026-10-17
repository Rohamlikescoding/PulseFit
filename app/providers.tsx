'use client';

import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, scheduleIdlePrefetch } from '../src/lib/queryClient';
import { useWorkoutStore } from '../src/store/workoutStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const { settings } = useWorkoutStore();
  // Load persisted workout data on the client after mount (store uses skipHydration).
  useEffect(() => {
    useWorkoutStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    scheduleIdlePrefetch();
  }, []);

  // Synchronize Botanical Sanctuaria & Soma Kanso Themes
  useEffect(() => {
    const applyTheme = () => {
      if (typeof document === 'undefined') return;
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

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
