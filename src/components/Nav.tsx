import React from 'react';
import { TabSection } from '../types/workout';
import { useWorkoutStore } from '../store/workoutStore';
import { useTimerStore } from '../store/timerStore';
import { Dumbbell, Leaf, Moon, Sun, Timer as TimerIcon } from 'lucide-react';

interface NavProps {
  currentTab: TabSection;
  onSelectTab: (tab: TabSection) => void;
}

export const Nav: React.FC<NavProps> = ({ currentTab, onSelectTab }) => {
  const { activeSession, settings, updateSettings } = useWorkoutStore();
  const { isRunning } = useTimerStore();

  const isLight =
    settings.theme === 'light' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches);

  const toggleTheme = () => {
    updateSettings({ theme: isLight ? 'dark' : 'light' });
  };

  return (
    <header className="sticky top-0 z-40 bg-app/90 backdrop-blur-xl border-b border-token px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('main')}
          className="text-lg font-bold tracking-tight text-token-primary hover:text-accent-brand transition-colors flex items-center gap-2.5 text-left cursor-pointer"
        >
          <span className={`flex h-7 w-7 items-center justify-center rounded-xl font-bold text-sm shadow-sm transition-colors ${
            isLight ? 'bg-[#1d1b18] text-[#ffffff]' : 'bg-[#74a87c] text-[#0e1511]'
          }`}>
            <Leaf className="h-4 w-4 fill-current" />
          </span>
          <span className="font-extrabold tracking-tight font-serif-editorial text-xl sm:text-2xl">
            PulseFit Sanctuary
          </span>
        </button>

        {/* Zone 2: 4 nav links, single-line, clean text links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium" aria-label="Main Navigation">
          <button
            onClick={() => onSelectTab('main')}
            className={`transition-colors whitespace-nowrap pb-1 border-b-2 cursor-pointer ${
              currentTab === 'main'
                ? `text-token-primary ${isLight ? 'border-[#1d1b18]' : 'border-[#74a87c]'} font-bold`
                : 'text-token-muted border-transparent hover:text-token-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('workouts')}
            className={`transition-colors whitespace-nowrap pb-1 border-b-2 cursor-pointer ${
              currentTab === 'workouts'
                ? `text-token-primary ${isLight ? 'border-[#1d1b18]' : 'border-[#74a87c]'} font-bold`
                : 'text-token-muted border-transparent hover:text-token-primary'
            }`}
          >
            Routines & Floor
          </button>
          <button
            onClick={() => onSelectTab('timer')}
            className={`transition-colors whitespace-nowrap pb-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'timer'
                ? `text-token-primary ${isLight ? 'border-[#1d1b18]' : 'border-[#74a87c]'} font-bold`
                : 'text-token-muted border-transparent hover:text-token-primary'
            }`}
          >
            <span>Zen Timer</span>
            {isRunning && (
              <span className={`inline-block h-2 w-2 rounded-full animate-pulse ${
                isLight ? 'bg-[#466645]' : 'bg-[#9dd3a4]'
              }`} />
            )}
          </button>
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`transition-colors whitespace-nowrap pb-1 border-b-2 cursor-pointer ${
              currentTab === 'dashboard'
                ? `text-token-primary ${isLight ? 'border-[#1d1b18]' : 'border-[#74a87c]'} font-bold`
                : 'text-token-muted border-transparent hover:text-token-primary'
            }`}
          >
            Analytics & Equilibrium
          </button>
        </nav>

        {/* Zone 3: Primary actions + Quick Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Theme Quick Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isLight ? 'Switch to dark sanctuary' : 'Switch to light sanctuary'}
            className="p-2.5 rounded-xl text-token-secondary hover:text-token-primary hover:bg-surface-tertiary border border-token transition-colors cursor-pointer"
          >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-[#d9c3a5]" />}
          </button>

          {activeSession ? (
            <button
              onClick={() => onSelectTab('workouts')}
              className="px-4 py-2 text-xs font-bold rounded-xl btn-primary-token flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Dumbbell className="h-3.5 w-3.5" />
              <span>In Session</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('workouts')}
              className="px-4 py-2 text-xs font-semibold rounded-xl btn-secondary-token whitespace-nowrap cursor-pointer"
            >
              Begin Session
            </button>
          )}

          {isRunning && currentTab !== 'timer' && (
            <button
              onClick={() => onSelectTab('timer')}
              aria-label="Open Running Timer"
              className="px-3 py-1.5 text-xs font-mono font-medium rounded-xl bg-[#74a87c]/15 text-[#9dd3a4] border border-[#74a87c]/30 flex items-center gap-1.5 hover:bg-[#74a87c]/25 transition-colors cursor-pointer"
            >
              <TimerIcon className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Flow Active</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
