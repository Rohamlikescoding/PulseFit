import React, { useMemo, useState } from 'react';
import {
  computeStreak,
  formatDisplayDate,
  getNextWorkout,
  getTodaysWorkout,
  WEEKDAY_NAMES,
} from '../../lib/schedule';
import { useWorkoutStore } from '../../store/workoutStore';
import { TabSection } from '../../types/workout';
import {
  ArrowRight,
  Calendar,
  Clock,
  Dumbbell,
  Leaf,
  Play,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { ExerciseDetailModal } from '../ExerciseDetailModal';
import { SanctuaryGauge } from '../SanctuaryGauge';

interface MainViewProps {
  onNavigateTab: (tab: TabSection) => void;
}

export const MainView: React.FC<MainViewProps> = ({ onNavigateTab }) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const {
    routines,
    activeRoutineId,
    sessionLogs,
    settings,
    startSession,
    activeSession,
  } = useWorkoutStore();

  const isLight =
    settings.theme === 'light' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches);

  const activeRoutine = useMemo(() => {
    return routines.find((r) => r.id === activeRoutineId) || routines[0] || null;
  }, [routines, activeRoutineId]);

  const streak = useMemo(() => {
    return computeStreak(sessionLogs, activeRoutine, new Date());
  }, [sessionLogs, activeRoutine]);

  const todaysWorkout = useMemo(() => {
    return getTodaysWorkout(activeRoutine, new Date());
  }, [activeRoutine]);

  const nextWorkout = useMemo(() => {
    return getNextWorkout(activeRoutine, new Date());
  }, [activeRoutine]);

  const lastUsedRoutine = useMemo(() => {
    if (sessionLogs.length > 0) {
      const latestLog = sessionLogs[0];
      const match = routines.find((r) => r.id === latestLog.routineId);
      if (match) return match;
    }
    return activeRoutine;
  }, [sessionLogs, routines, activeRoutine]);

  const lastSessionLog = sessionLogs[0] || null;

  const totalLifetimeVolume = useMemo(() => {
    return sessionLogs.reduce((acc, log) => {
      return (
        acc +
        (log.exercises || []).reduce(
          (exAcc, ex) =>
            exAcc +
            (ex.sets || []).reduce(
              (sAcc, s) => sAcc + (s.reps || 0) * (s.weight || 0),
              0
            ),
          0
        )
      );
    }, 0);
  }, [sessionLogs]);

  const handleStartToday = () => {
    if (!activeRoutine || !todaysWorkout) return;
    startSession(activeRoutine.id, todaysWorkout.weekday);
    onNavigateTab('workouts');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-28">
      {/* Header greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className={`text-[11px] font-mono tracking-widest uppercase block ${
            isLight ? 'text-[#466645]' : 'text-[#9dd3a4]'
          }`}>
            Botanical Sanctuaria · Daily Movement Craft
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 text-token-primary font-serif-editorial">
            Mindful Training Sanctuary
          </h1>
        </div>
        <div className="text-xs font-mono text-token-muted bg-surface-secondary/80 px-3.5 py-1.5 rounded-xl border border-token self-start sm:self-auto">
          {formatDisplayDate(new Date())}
        </div>
      </div>

      {/* Hero Mindful Streak & Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mindful Streak Card */}
        <div className="sm:col-span-2 card-token p-6 border-token flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div>
              <div className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? 'text-[#466645]' : 'text-[#9dd3a4]'
              }`}>
                <Leaf className="h-4 w-4 fill-current" />
                <span>Mindful Conditioning Streak</span>
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-token-primary tabular-nums">
                  {streak}
                </span>
                <span className={`text-base sm:text-lg font-bold ${
                  isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'
                }`}>
                  {streak === 1 ? 'Conscious Session' : 'Consistent Sessions'}
                </span>
              </div>
            </div>

            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border shadow-sm ${
              isLight
                ? 'bg-[#c5eabf]/40 text-[#466645] border-[#466645]/30'
                : 'bg-[#74a87c]/15 text-[#9dd3a4] border-[#74a87c]/25'
            }`}>
              <Trophy className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-token flex items-center justify-between text-xs text-token-secondary relative z-10">
            <span>
              {streak > 0
                ? `${streak} consecutive scheduled sessions sustained with mindful balance.`
                : 'Begin your conscious conditioning streak with today’s scheduled movement.'}
            </span>
            <span className={`font-mono shrink-0 font-semibold ml-2 ${
              isLight ? 'text-[#466645]' : 'text-[#9dd3a4]'
            }`}>
              Biophilic Rhythm
            </span>
          </div>
        </div>

        {/* Volume & Completed Count Stat Card */}
        <div className="card-token p-6 flex flex-col justify-between space-y-4 border-token">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-token-muted block mb-1">
              Sanctuary Sessions
            </span>
            <span className="text-3xl font-black font-mono text-token-primary tabular-nums">
              {sessionLogs.length}
            </span>
            <span className="text-xs text-token-muted block mt-0.5">Persisted workouts</span>
          </div>

          <div className="border-t border-token pt-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-token-muted block mb-1">
              Cumulative Load
            </span>
            <span className={`text-xl font-bold font-mono tabular-nums ${
              isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'
            }`}>
              {Math.round(totalLifetimeVolume).toLocaleString()}{' '}
              <span className="text-xs text-token-muted">{settings.weightUnit}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sanctuary Metrics Equilibrium Gauge (Custom Component) */}
      <SanctuaryGauge />

      {/* TODAY'S WORKOUT OR NEXT WORKOUT (Focal Anchor) */}
      <div className="card-token p-6 sm:p-7 space-y-5 border-token">
        {todaysWorkout ? (
          /* Today is a workout day */
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className={`flex h-3 w-3 rounded-full animate-pulse ${
                  isLight ? 'bg-[#466645]' : 'bg-[#74a87c]'
                }`} />
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  isLight ? 'text-[#466645]' : 'text-[#9dd3a4]'
                }`}>
                  Today's Training Sanctuary
                </span>
              </div>
              <div className="text-xs font-mono text-token-muted">
                {formatDisplayDate(new Date())}
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-token-primary tracking-tight font-serif-editorial">
                {todaysWorkout.name}
              </h2>
              <p className="text-xs text-token-secondary mt-1">
                Routine:{' '}
                <strong className="text-token-primary">{activeRoutine?.name}</strong>{' '}
                · {todaysWorkout.exercises.length} planned movements
              </p>
            </div>

            {/* Exercise preview chips with clean unboxed style */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {todaysWorkout.exercises.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedExerciseId(ex.exerciseId)}
                  className="px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface-tertiary border border-token text-xs font-medium text-token-secondary hover:text-token-primary flex items-center gap-2 transition-colors cursor-pointer group text-left min-h-[44px]"
                  title="Click to view form guide, biomechanics & animation"
                >
                  <Dumbbell className={`h-3.5 w-3.5 ${
                    isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'
                  } group-hover:scale-110 transition-transform`} />
                  <span>{ex.name}</span>
                  <span className="text-token-muted font-mono text-[11px]">
                    ({ex.targetSets} sets)
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3.5">
              {activeSession ? (
                <button
                  type="button"
                  onClick={() => onNavigateTab('workouts')}
                  className="min-h-[52px] px-8 rounded-2xl btn-primary-token flex items-center justify-center gap-2.5 text-sm cursor-pointer"
                >
                  <Dumbbell className="h-4 w-4" />
                  <span>Resume Workout In Session</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartToday}
                  className="min-h-[52px] px-8 rounded-2xl btn-primary-token flex items-center justify-center gap-2.5 text-sm cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Begin Today's Session</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onNavigateTab('timer')}
                className="min-h-[52px] px-6 rounded-2xl btn-secondary-token text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clock className={`h-4 w-4 ${isLight ? 'text-[#466645]' : 'text-[#d9c3a5]'}`} />
                <span>Open Zen Flow Timer</span>
              </button>
            </div>
          </div>
        ) : (
          /* Today is a mindful restorative rest day */
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-token-muted flex items-center gap-2">
                <Calendar className={`h-4 w-4 ${isLight ? 'text-[#466645]' : 'text-[#74a87c]'}`} />
                <span>Restorative Rest Day · Upcoming Training</span>
              </span>
              {nextWorkout && (
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                  isLight
                    ? 'bg-[#c5eabf]/40 text-[#466645] border-[#466645]/30'
                    : 'bg-[#74a87c]/15 text-[#9dd3a4] border-[#74a87c]/25'
                }`}>
                  In {nextWorkout.daysAway} day{nextWorkout.daysAway > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {nextWorkout ? (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-token-primary tracking-tight font-serif-editorial">
                  {nextWorkout.day.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-token-secondary mt-1">
                  <span>{formatDisplayDate(nextWorkout.date)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{WEEKDAY_NAMES[nextWorkout.day.weekday]}</span>
                  <span aria-hidden="true">·</span>
                  <span>{nextWorkout.day.exercises.length} movements planned</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-4">
                  {nextWorkout.day.exercises.map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedExerciseId(ex.exerciseId)}
                      className="px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface-tertiary border border-token text-xs font-medium text-token-secondary hover:text-token-primary flex items-center gap-2 transition-colors cursor-pointer group text-left min-h-[44px]"
                      title="Inspect form guide & demonstration"
                    >
                      <Dumbbell className={`h-3.5 w-3.5 ${
                        isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'
                      }`} />
                      <span>{ex.name}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      startSession(activeRoutine?.id || '', nextWorkout.day.weekday);
                      onNavigateTab('workouts');
                    }}
                    className="min-h-[48px] px-6 rounded-2xl btn-secondary-token text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Train Early (Start Now)</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-token-primary">
                  No upcoming workouts scheduled
                </p>
                <p className="text-xs text-token-muted mt-1">
                  Activate or create a training routine in the Routines section to schedule training days.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('workouts')}
                  className="mt-4 min-h-[48px] px-5 py-2.5 rounded-2xl btn-primary-token text-xs cursor-pointer"
                >
                  Configure Routines
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Routine & Session Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Active Routine Card */}
        <div className="card-token p-5 sm:p-6 flex flex-col justify-between space-y-4 border-token">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-token-muted block mb-1">
              Active Routine Split
            </span>
            <h3 className="text-xl font-bold text-token-primary tracking-tight font-serif-editorial">
              {lastUsedRoutine?.name || 'No routine active'}
            </h3>
            <p className="text-xs text-token-secondary mt-1">
              {lastUsedRoutine
                ? `${lastUsedRoutine.daysPerWeek} training days per week · ${lastUsedRoutine.days.length} workouts configured`
                : 'Configure routines in workouts tab'}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-token pt-3">
            <button
              type="button"
              onClick={() => onNavigateTab('workouts')}
              className={`text-xs font-semibold hover:underline flex items-center gap-1.5 transition-opacity cursor-pointer ${
                isLight ? 'text-[#466645]' : 'text-[#9dd3a4]'
              }`}
            >
              <span>Manage Routines & Split</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Latest Completed Session Summary */}
        <div className="card-token p-5 sm:p-6 flex flex-col justify-between space-y-4 border-token">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-token-muted block mb-1">
              Most Recent Completed Session
            </span>
            {lastSessionLog ? (
              <div>
                <h3 className="text-xl font-bold text-token-primary tracking-tight font-serif-editorial">
                  {lastSessionLog.workoutDayName || lastSessionLog.routineName || 'Completed Workout'}
                </h3>
                <div className="flex items-center gap-2 text-xs text-token-secondary mt-1">
                  <span>{formatDisplayDate(lastSessionLog.date)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{lastSessionLog.exercises.length} Exercises Recorded</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-token-muted mt-2">
                No past sessions recorded yet.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-token pt-3">
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className={`text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLight ? 'text-[#466645] hover:text-[#1c1c16]' : 'text-token-secondary hover:text-[#9dd3a4]'
              }`}
            >
              <span>View Sanctuary Analytics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {selectedExerciseId && (
        <ExerciseDetailModal
          exerciseId={selectedExerciseId}
          onClose={() => setSelectedExerciseId(null)}
        />
      )}
    </div>
  );
};
