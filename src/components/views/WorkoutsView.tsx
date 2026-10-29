import React, { useState } from 'react';
import { WEEKDAY_NAMES, WEEKDAY_SHORT } from '../../lib/schedule';
import { useWorkoutStore } from '../../store/workoutStore';
import { Routine, TabSection, Weekday } from '../../types/workout';
import { RoutineBuilder } from '../RoutineBuilder';
import { SessionLogger } from '../SessionLogger';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Edit2,
  Info,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ExerciseDetailModal } from '../ExerciseDetailModal';
import { WorkoutsViewSkeleton } from '../skeleton/PageSkeleton';

interface WorkoutsViewProps {
  onNavigateTab?: (tab: TabSection) => void;
  isLoading?: boolean;
}

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({ onNavigateTab, isLoading = false }) => {
  const navigate = useNavigate();
  const navigateTo = (tab: TabSection) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      const map: Record<TabSection, string> = {
        main: '/',
        workouts: '/workouts',
        timer: '/timer',
        dashboard: '/dashboard',
      };
      navigate(map[tab] || '/');
    }
  };
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);
  const {
    routines,
    activeRoutineId,
    activeSession,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    setActiveRoutineId,
    startSession,
    isHydrated,
  } = useWorkoutStore();

  const [isBuildingRoutine, setIsBuildingRoutine] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  if (isLoading || (!isHydrated && routines.length === 0)) {
    return <WorkoutsViewSkeleton />;
  }

  // If in an active session, render the SessionLogger
  if (activeSession) {
    return (
      <SessionLogger
        onFinish={() => {
          // Handled in store
        }}
        onNavigateTimer={() => navigateTo('timer')}
      />
    );
  }

  // If building or editing routine, render RoutineBuilder
  if (isBuildingRoutine || editingRoutine) {
    return (
      <RoutineBuilder
        initialRoutine={editingRoutine}
        onSave={(data) => {
          if (editingRoutine) {
            updateRoutine(editingRoutine.id, data);
          } else {
            addRoutine(data);
          }
          setIsBuildingRoutine(false);
          setEditingRoutine(null);
        }}
        onCancel={() => {
          setIsBuildingRoutine(false);
          setEditingRoutine(null);
        }}
      />
    );
  }

  const activeRoutine =
    routines.find((r) => r.id === activeRoutineId) || routines[0] || null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-token-primary tracking-tight font-serif-editorial">
            Workouts & Routines
          </h1>
          <p className="text-xs text-token-muted mt-0.5">
            Configure custom multi-day training splits, assign exercises, and log sets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingRoutine(null);
            setIsBuildingRoutine(true);
          }}
          className="px-5 py-2.5 rounded-xl btn-primary-token text-xs flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Routine</span>
        </button>
      </div>

      {/* Active Routine Spotlight */}
      {activeRoutine && (
        <div className="card-token p-6 space-y-5 border-accent-token">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-brand">
                ACTIVE PROGRAM
              </span>
              <h2 className="text-xl font-extrabold text-token-primary tracking-tight mt-0.5">
                {activeRoutine.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-token-muted mt-1">
                <span>{activeRoutine.daysPerWeek} Days Per Week</span>
                <span aria-hidden="true">·</span>
                <span>{activeRoutine.days.length} Scheduled Workouts</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingRoutine(activeRoutine)}
                className="px-3.5 py-1.5 rounded-xl text-xs btn-secondary-token flex items-center gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Routine</span>
              </button>
            </div>
          </div>

          {/* Days Grid in Active Routine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeRoutine.days.map((day) => {
              const isToday = day.weekday === new Date().getDay();

              return (
                <div
                  key={day.weekday}
                  className={`p-4 rounded-2xl border transition-all ${
                    isToday
                      ? 'bg-accent-subtle/50 border-[#74a87c]/60 shadow-sm'
                      : 'bg-surface-secondary border-token hover:border-token-strong'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#9dd3a4]">
                          {WEEKDAY_SHORT[day.weekday]}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-mono uppercase bg-[#74a87c]/15 text-[#9dd3a4] border border-[#74a87c]/30 px-1.5 py-0.5 rounded font-bold">
                            Today
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-token-primary mt-1">
                        {day.name}
                      </h3>
                      <p className="text-xs text-token-muted mt-0.5">
                        {day.exercises.length} exercises ·{' '}
                        {day.exercises.reduce((s, e) => s + e.targetSets, 0)} target sets
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => startSession(activeRoutine.id, day.weekday)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                        isToday
                          ? 'btn-primary-token shadow-sm'
                          : 'btn-secondary-token'
                      }`}
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{isToday ? 'Start Today' : 'Train Day'}</span>
                    </button>
                  </div>

                  {/* Exercises interactive chip list */}
                  <div className="mt-3 pt-3 border-t border-token space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-token-muted">
                      <span>Exercises ({day.exercises.length}):</span>
                      <span className="text-[10px] text-accent-brand flex items-center gap-1 font-medium">
                        <Info className="h-3 w-3" />
                        <span>Tap to view GIF & details</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {day.exercises.map((ex, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedExerciseId(ex.exerciseId)}
                          className="text-[11px] text-token-secondary hover:text-token-primary bg-surface hover:bg-surface-tertiary border border-token hover:border-token-strong px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer group text-left shadow-2xs"
                          title="Click to view exercise details, animated GIF & instructions"
                        >
                          <Dumbbell className="h-3 w-3 text-accent-brand group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{ex.name}</span>
                          <span className="text-[10px] font-mono text-token-muted">({ex.targetSets} sets)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Saved Routines List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-token-primary tracking-tight">
          All Saved Routines ({routines.length})
        </h2>

        <div className="space-y-3">
          {routines.map((routine) => {
            const isActive = routine.id === activeRoutineId;
            const isExpanded = expandedRoutineId === routine.id;

            return (
              <div
                key={routine.id}
                className="card-token p-4 sm:p-5 space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-token-primary tracking-tight">
                        {routine.name}
                      </h3>
                      {isActive && (
                        <span className="text-[10px] font-mono uppercase bg-accent-subtle text-accent-brand border border-accent-token px-2 py-0.5 rounded-md font-bold">
                          Active Program
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-token-muted mt-1">
                      <span>{routine.daysPerWeek} days / week</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Scheduled on:{' '}
                        {routine.days.map((d) => WEEKDAY_SHORT[d.weekday]).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRoutineId(isExpanded ? null : routine.id)
                      }
                      className="px-3 py-1.5 rounded-xl text-xs btn-secondary-token flex items-center gap-1.5"
                    >
                      <span>{isExpanded ? 'Hide Workouts' : 'View Workouts & Exercises'}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => setActiveRoutineId(routine.id)}
                        className="px-3 py-1.5 rounded-xl text-xs btn-secondary-token"
                      >
                        Set as Active
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setEditingRoutine(routine)}
                      aria-label={`Edit ${routine.name}`}
                      className="p-2 rounded-xl text-token-muted hover:text-token-primary hover:bg-surface-secondary transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    {routines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteRoutine(routine.id)}
                        aria-label={`Delete ${routine.name}`}
                        className="p-2.5 rounded-xl text-token-muted hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Workout Days & Exercise Details Preview */}
                {isExpanded && (
                  <div className="pt-3 border-t border-token space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs text-token-muted">
                      <span className="font-semibold text-token-primary">
                        Workout Schedule ({routine.days.length} days configured):
                      </span>
                      <span className="text-[11px] text-accent-brand flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>Select any exercise to view animated GIF & details</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {routine.days.map((day) => (
                        <div
                          key={day.weekday}
                          className="p-3 rounded-xl bg-surface-secondary border border-token space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-accent-brand">
                              {WEEKDAY_NAMES[day.weekday]}
                            </span>
                            <span className="text-[11px] text-token-muted">
                              {day.exercises.length} exercises
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-token-primary truncate">
                            {day.name}
                          </h4>

                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {day.exercises.map((ex, exIdx) => (
                              <button
                                key={exIdx}
                                type="button"
                                onClick={() => setSelectedExerciseId(ex.exerciseId)}
                                className="text-[10px] text-token-secondary hover:text-token-primary bg-surface hover:bg-surface-tertiary border border-token px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer group"
                                title="Click to view full instructions & animation"
                              >
                                <Dumbbell className="h-2.5 w-2.5 text-accent-brand group-hover:scale-110 transition-transform" />
                                <span>{ex.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
