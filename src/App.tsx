import React, { useEffect, useState } from 'react';
import { FloatingBar } from './components/FloatingBar';
import { Nav } from './components/Nav';
import { NotificationHost } from './components/NotificationHost';
import { DashboardView } from './components/views/DashboardView';
import { MainView } from './components/views/MainView';
import { TimerView } from './components/views/TimerView';
import { WorkoutsView } from './components/views/WorkoutsView';
import { runScheduleTests } from './lib/schedule.test';
import { useWorkoutStore } from './store/workoutStore';
import { TabSection } from './types/workout';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabSection>('main');
  const [mounted, setMounted] = useState(false);
  const { settings } = useWorkoutStore();

  // Active Theme Synchronization
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      const isSystemLight =
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

    if (settings.theme === 'system' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: light)');
      const listener = () => applyTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  // Hydration safety & test verification
  useEffect(() => {
    setMounted(true);
    try {
      const testResult = runScheduleTests();
      if (!testResult.passed) {
        console.warn('[ScheduleTests] Some assertions failed:', testResult.results);
      }
    } catch (e) {
      console.error('[ScheduleTests] Error running tests:', e);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center text-token-muted font-mono text-xs">
        Entering PulseFit Sanctuary...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-token-primary flex flex-col antialiased selection:bg-[#74a87c]/30 selection:text-[#9dd3a4] transition-colors duration-200">
      {/* Top Nav Bar with 3-Zone Contract */}
      <Nav currentTab={activeTab} onSelectTab={setActiveTab} />

      {/* Reusable Workout-Day Notification Host */}
      <NotificationHost onNavigateTab={setActiveTab} />

      {/* Main Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        {activeTab === 'main' && <MainView onNavigateTab={setActiveTab} />}
        {activeTab === 'workouts' && <WorkoutsView onNavigateTab={setActiveTab} />}
        {activeTab === 'timer' && <TimerView />}
        {activeTab === 'dashboard' && <DashboardView />}
      </main>

      {/* Floating Bottom Bar (Mobile-first, highlighted active section) */}
      <FloatingBar currentTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
