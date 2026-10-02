import React from 'react';
import { TabSection } from '../types/workout';
import { useTimerStore } from '../store/timerStore';
import { useWorkoutStore } from '../store/workoutStore';
import { BarChart3, Dumbbell, Leaf, Timer } from 'lucide-react';

interface FloatingBarProps {
  currentTab: TabSection;
  onSelectTab: (tab: TabSection) => void;
}

export const FloatingBar: React.FC<FloatingBarProps> = ({ currentTab, onSelectTab }) => {
  const { isRunning } = useTimerStore();
  const { activeSession, settings } = useWorkoutStore();

  const isLight =
    settings.theme === 'light' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches);

  const tabs: { id: TabSection; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'main', label: 'Sanctuary', icon: Leaf },
    { id: 'workouts', label: 'Routines', icon: Dumbbell },
    { id: 'timer', label: 'Zen Timer', icon: Timer },
    { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md px-2 py-1.5 bg-surface/95 border border-token shadow-2xl backdrop-blur-2xl rounded-2xl transition-all"
    >
      <div className="grid grid-cols-4 gap-1 items-center" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const showDot =
            (tab.id === 'timer' && isRunning) ||
            (tab.id === 'workouts' && Boolean(activeSession));

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 min-h-[44px] cursor-pointer ${
                isActive
                  ? isLight
                    ? 'bg-[#ece8df] text-[#1d1b18] font-bold shadow-sm'
                    : 'bg-[#74a87c]/18 text-[#9dd3a4] font-bold shadow-sm'
                  : 'text-token-muted hover:text-token-primary hover:bg-surface-tertiary/40'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? (isLight ? 'scale-110 text-[#1d1b18]' : 'scale-110 text-[#9dd3a4]') : ''
                  }`}
                />
                {showDot && (
                  <span
                    className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ring-2 ring-surface ${
                      tab.id === 'timer'
                        ? isLight ? 'bg-[#466645] animate-pulse' : 'bg-[#9dd3a4] animate-pulse'
                        : isLight ? 'bg-[#c56d36]' : 'bg-[#d9c3a5]'
                    }`}
                  />
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-1 leading-none select-none font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
