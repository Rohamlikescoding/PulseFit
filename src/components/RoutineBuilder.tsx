import React, { useState } from 'react';
import { WEEKDAY_NAMES, WEEKDAY_SHORT } from '../lib/schedule';
import { Exercise, PlannedExercise, Routine, Weekday, WorkoutDay } from '../types/workout';
import { ExerciseSearchModal } from './ExerciseSearchModal';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { AlertCircle, ArrowLeft, Check, Dumbbell, Info, Minus, Plus, Trash2 } from 'lucide-react';

interface RoutineBuilderProps {
  initialRoutine?: Routine | null;
  onSave: (routineData: Omit<Routine, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
  initialRoutine,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initialRoutine?.name || '');
  const [previewExerciseId, setPreviewExerciseId] = useState<string | null>(null);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(
    initialRoutine?.daysPerWeek || 3
  );

  const [selectedWeekdays, setSelectedWeekdays] = useState<Weekday[]>(
    initialRoutine?.days.map((d) => d.weekday) || [1, 3, 5]
  );

  const [dayConfigs, setDayConfigs] = useState<Record<Weekday, WorkoutDay>>(() => {
    const map: Record<Weekday, WorkoutDay> = {} as any;
    const defaultLabels: Record<Weekday, string> = {
      0: 'Sunday Conditioning',
      1: 'Monday Upper Power',
      2: 'Tuesday Lower Power',
      3: 'Wednesday Core & Back',
      4: 'Thursday Hypertrophy Push',
      5: 'Friday Hypertrophy Pull',
      6: 'Saturday Full Body',
    };

    [0, 1, 2, 3, 4, 5, 6].forEach((wd) => {
      const weekday = wd as Weekday;
      const existing = initialRoutine?.days.find((d) => d.weekday === weekday);
      if (existing) {
        map[weekday] = { ...existing, exercises: [...existing.exercises] };
      } else {
        map[weekday] = {
          weekday,
          name: defaultLabels[weekday] || `${WEEKDAY_NAMES[weekday]} Workout`,
          exercises: [],
        };
      }
    });
    return map;
  });

  const [activeTabWeekday, setActiveTabWeekday] = useState<Weekday>(
    selectedWeekdays[0] ?? 1
  );

  const [modalTargetWeekday, setModalTargetWeekday] = useState<Weekday | null>(null);

  const isValidDaysCount = selectedWeekdays.length === daysPerWeek;
  const hasValidName = name.trim().length > 0;

  const toggleWeekday = (weekday: Weekday) => {
    if (selectedWeekdays.includes(weekday)) {
      const next = selectedWeekdays.filter((w) => w !== weekday);
      setSelectedWeekdays(next);
      if (activeTabWeekday === weekday && next.length > 0) {
        setActiveTabWeekday(next[0]);
      }
    } else {
      const next = [...selectedWeekdays, weekday].sort((a, b) => a - b);
      setSelectedWeekdays(next);
      setActiveTabWeekday(weekday);
    }
  };

  const handleExerciseAdd = (weekday: Weekday, exercise: Exercise) => {
    setDayConfigs((prev) => {
      const currentDay = prev[weekday];
      const newPlanned: PlannedExercise = {
        exerciseId: exercise.id,
        name: exercise.name,
        gifUrl: exercise.gifUrl,
        targetSets: 3,
      };
      return {
        ...prev,
        [weekday]: {
          ...currentDay,
          exercises: [...currentDay.exercises, newPlanned],
        },
      };
    });
  };

  const handleUpdateTargetSets = (
    weekday: Weekday,
    exerciseIndex: number,
    newSets: number
  ) => {
    setDayConfigs((prev) => {
      const currentDay = prev[weekday];
      const nextExercises = [...currentDay.exercises];
      nextExercises[exerciseIndex] = {
        ...nextExercises[exerciseIndex],
        targetSets: Math.max(1, Math.min(10, newSets)),
      };
      return {
        ...prev,
        [weekday]: {
          ...currentDay,
          exercises: nextExercises,
        },
      };
    });
  };

  const handleRemoveExercise = (weekday: Weekday, exerciseIndex: number) => {
    setDayConfigs((prev) => {
      const currentDay = prev[weekday];
      return {
        ...prev,
        [weekday]: {
          ...currentDay,
          exercises: currentDay.exercises.filter((_, idx) => idx !== exerciseIndex),
        },
      };
    });
  };

  const handleUpdateDayName = (weekday: Weekday, newName: string) => {
    setDayConfigs((prev) => ({
      ...prev,
      [weekday]: {
        ...prev[weekday],
        name: newName,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidDaysCount || !hasValidName) return;

    const daysPayload: WorkoutDay[] = selectedWeekdays.map((wd) => dayConfigs[wd]);

    onSave({
      name: name.trim(),
      daysPerWeek,
      days: daysPayload,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl btn-secondary-token"
            aria-label="Back to routines"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-token-primary tracking-tight font-serif-editorial">
              {initialRoutine ? 'Edit Routine' : 'Create New Routine'}
            </h1>
            <p className="text-xs text-token-muted mt-0.5">
              Set weekly frequency, schedule weekdays, and customize daily exercise targets.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Routine Name & Frequency Setup */}
        <div className="card-token p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-bold text-token-primary tracking-tight">
            1. Schedule Configuration
          </h2>

          {/* Routine Name */}
          <div className="space-y-1.5">
            <label htmlFor="routine-name" className="text-xs font-semibold text-token-secondary">
              Routine Name
            </label>
            <input
              id="routine-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Push / Pull / Legs Hypertrophy, 4-Day Strength"
              className="w-full px-4 py-2.5 input-token rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Input (a): How many days per week */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-token-secondary">
                  (a) Days Per Week
                </label>
                <span className="text-xs font-mono font-bold text-accent-brand">
                  {daysPerWeek} days
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-secondary p-1.5 border border-token rounded-2xl">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDaysPerWeek(num)}
                    className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                      daysPerWeek === num
                        ? 'btn-primary-token shadow-sm'
                        : 'text-token-secondary hover:text-token-primary hover:bg-surface-tertiary'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Input (b): Which weekdays */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-token-secondary">
                  (b) Which Weekdays
                </label>
                <span
                  className={`text-xs font-mono font-medium ${
                    isValidDaysCount ? 'text-[#9dd3a4]' : 'text-[#d9c3a5]'
                  }`}
                >
                  {selectedWeekdays.length} of {daysPerWeek} selected
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1 bg-surface-secondary p-1.5 border border-token rounded-2xl">
                {[0, 1, 2, 3, 4, 5, 6].map((wd) => {
                  const weekday = wd as Weekday;
                  const isSelected = selectedWeekdays.includes(weekday);

                  return (
                    <button
                      key={weekday}
                      type="button"
                      onClick={() => toggleWeekday(weekday)}
                      className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
                        isSelected
                          ? 'btn-primary-token shadow-sm'
                          : 'text-token-secondary hover:text-token-primary hover:bg-surface-tertiary'
                      }`}
                    >
                      {WEEKDAY_SHORT[weekday]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Validation Feedback */}
          {!isValidDaysCount && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-subtle border border-accent-token text-[#d9c3a5] text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#d9c3a5]" />
              <span>
                Please select exactly <strong>{daysPerWeek}</strong> weekday
                {daysPerWeek > 1 ? 's' : ''} to match your target frequency (currently {selectedWeekdays.length} selected).
              </span>
            </div>
          )}
        </div>

        {/* Step 2: Per-day Workouts & Exercises */}
        {selectedWeekdays.length > 0 && (
          <div className="card-token p-5 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-token pb-4">
              <div>
                <h2 className="text-base font-bold text-token-primary tracking-tight">
                  2. Per-Day Exercise Setup
                </h2>
                <p className="text-xs text-token-muted mt-0.5">
                  Configure exercises and target sets for each scheduled day.
                </p>
              </div>

              {/* Day selection tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {selectedWeekdays.map((wd) => {
                  const isActive = activeTabWeekday === wd;
                  const day = dayConfigs[wd];
                  const exCount = day?.exercises.length || 0;

                  return (
                    <button
                      key={wd}
                      type="button"
                      onClick={() => setActiveTabWeekday(wd)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'btn-primary-token shadow-sm'
                          : 'btn-secondary-token'
                      }`}
                    >
                      <span>{WEEKDAY_SHORT[wd]}</span>
                      <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-[#0e1511]/25 text-[#0e1511]' : 'bg-surface-tertiary text-token-secondary'}`}>
                        {exCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Day Content */}
            {activeTabWeekday !== null && dayConfigs[activeTabWeekday] && (
              <div className="space-y-5">
                {/* Editable Day Title */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-token-secondary block mb-1">
                      Workout Title for {WEEKDAY_NAMES[activeTabWeekday]}
                    </label>
                    <input
                      type="text"
                      value={dayConfigs[activeTabWeekday].name}
                      onChange={(e) =>
                        handleUpdateDayName(activeTabWeekday, e.target.value)
                      }
                      className="w-full px-3.5 py-2 input-token rounded-xl text-sm font-semibold"
                    />
                  </div>

                  <div className="sm:self-end">
                    <button
                      type="button"
                      onClick={() => setModalTargetWeekday(activeTabWeekday)}
                      className="w-full sm:w-auto px-4 py-2.5 text-xs btn-primary-token rounded-xl flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Exercise</span>
                    </button>
                  </div>
                </div>

                {/* Exercises in active day */}
                <div className="space-y-3">
                  {dayConfigs[activeTabWeekday].exercises.length === 0 ? (
                    <div className="text-center py-10 px-4 border border-dashed border-token rounded-2xl bg-surface-secondary/40 space-y-2">
                      <div className="h-10 w-10 mx-auto rounded-full bg-surface-tertiary flex items-center justify-center text-token-muted">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-token-primary">
                        No exercises assigned to {WEEKDAY_NAMES[activeTabWeekday]} yet
                      </p>
                      <p className="text-xs text-token-muted">
                        Click "Add Exercise" above to search the exercise database and configure sets.
                      </p>
                    </div>
                  ) : (
                    dayConfigs[activeTabWeekday].exercises.map((planned, idx) => (
                      <div
                        key={`${planned.exerciseId}-${idx}`}
                        className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-surface-secondary border border-token hover:border-token-strong transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => setPreviewExerciseId(planned.exerciseId)}
                            className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-surface-tertiary border border-token hover:border-accent-token flex items-center justify-center transition-all cursor-pointer group text-left"
                            title="Click to view full instructions & animated demonstration"
                          >
                            {planned.gifUrl ? (
                              <img
                                src={planned.gifUrl}
                                alt={planned.name}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : null}
                            <Dumbbell className="h-5 w-5 text-token-muted absolute" />
                          </button>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setPreviewExerciseId(planned.exerciseId)}
                              className="text-left font-bold text-token-primary hover:text-accent-brand text-sm truncate block transition-colors cursor-pointer group"
                              title="Click to view exercise form guide & details"
                            >
                              <span className="truncate">{planned.name}</span>
                            </button>
                            <div className="flex items-center gap-2 text-xs text-token-muted mt-0.5">
                              <span>Target sets for routine</span>
                              <button
                                type="button"
                                onClick={() => setPreviewExerciseId(planned.exerciseId)}
                                className="text-[11px] text-accent-brand hover:underline flex items-center gap-1 font-medium"
                              >
                                <Info className="h-3 w-3" />
                                <span>View Guide</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Sets Stepper & Delete */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1.5 bg-surface border border-token rounded-xl p-1 shadow-sm">
                            <span className="text-[11px] font-semibold text-token-muted px-1">
                              SETS
                            </span>
                            <button
                              type="button"
                              aria-label="Decrease target sets"
                              onClick={() =>
                                handleUpdateTargetSets(
                                  activeTabWeekday,
                                  idx,
                                  planned.targetSets - 1
                                )
                              }
                              className="h-7 w-7 rounded-lg bg-surface-secondary hover:bg-surface-tertiary text-token-secondary border border-token flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center font-mono font-bold text-sm text-accent-brand">
                              {planned.targetSets}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase target sets"
                              onClick={() =>
                                handleUpdateTargetSets(
                                  activeTabWeekday,
                                  idx,
                                  planned.targetSets + 1
                                )
                              }
                              className="h-7 w-7 rounded-lg bg-surface-secondary hover:bg-surface-tertiary text-token-secondary border border-token flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(activeTabWeekday, idx)}
                            aria-label={`Remove ${planned.name}`}
                            className="p-2 rounded-xl text-token-muted hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs btn-secondary-token"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValidDaysCount || !hasValidName}
            className="px-6 py-2.5 rounded-xl text-xs btn-primary-token flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            <span>Save Routine</span>
          </button>
        </div>
      </form>

      {/* Exercise Search Modal */}
      {modalTargetWeekday !== null && (
        <ExerciseSearchModal
          isOpen={true}
          onClose={() => setModalTargetWeekday(null)}
          onSelectExercise={(ex) => handleExerciseAdd(modalTargetWeekday, ex)}
          alreadySelectedIds={dayConfigs[modalTargetWeekday]?.exercises.map(
            (e) => e.exerciseId
          )}
        />
      )}

      {/* Exercise Detail Modal */}
      {previewExerciseId && (
        <ExerciseDetailModal
          exerciseId={previewExerciseId}
          onClose={() => setPreviewExerciseId(null)}
        />
      )}
    </div>
  );
};
