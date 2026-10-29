import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useWorkoutStore } from '../store/workoutStore';
import { useTimerStore } from '../store/timerStore';
import { SetGrid } from './SetGrid';
import { AlertCircle, CheckCircle, Timer, X } from 'lucide-react';
import { CURATED_EXERCISES } from '../data/exercisesData';
import { ExerciseDetailModal } from './ExerciseDetailModal';

interface SessionLoggerProps {
  onFinish: () => void;
  onNavigateTimer: () => void;
}

export const SessionLogger: React.FC<SessionLoggerProps> = ({
  onFinish,
  onNavigateTimer,
}) => {
  const {
    activeSession,
    routines,
    settings,
    updateSessionSet,
    toggleSessionSetCompletion,
    addSetToSessionExercise,
    removeSetFromSessionExercise,
    finishActiveSession,
    cancelActiveSession,
  } = useWorkoutStore();

  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  if (!activeSession) return null;

  const currentRoutine = routines.find((r) => r.id === activeSession.routineId);
  const totalSetsCount = activeSession.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0
  );

  const handleFinish = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#74a87c', '#d9c3a5', '#9dd3a4', '#c47b62'],
      });
    } catch (e) {
      // safe fallback
    }

    finishActiveSession();
    onFinish();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28">
      {/* Session Header Card */}
      <div className="card-token p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-accent-brand uppercase tracking-wider">
              {currentRoutine?.name || 'Workout Routine'}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-token-primary tracking-tight mt-0.5 font-serif-editorial">
              {activeSession.dayName}
            </h1>
            <div className="flex items-center gap-2 text-xs text-token-muted mt-1">
              <span>{activeSession.exercises.length} Exercises</span>
              <span aria-hidden="true">·</span>
              <span>{totalSetsCount} Total Sets</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">Weight Unit: {settings.weightUnit}</span>
            </div>
          </div>

          {/* Rest Timer Quick Bar */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={onNavigateTimer}
              className="px-3.5 py-2 rounded-xl text-xs btn-secondary-token flex items-center gap-2"
            >
              <Timer className="h-4 w-4 text-accent-brand" />
              <span>Interval Timer</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCancelPrompt(true)}
              className="p-2 rounded-xl text-token-muted hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors"
              aria-label="Discard workout"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cancel Confirmation */}
        {showCancelPrompt && (
          <div className="p-4 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-token-primary flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs text-token-secondary">
              <AlertCircle className="h-4 w-4 text-[#ffb4ab] shrink-0" />
              <span>Are you sure you want to discard this in-progress workout session?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowCancelPrompt(false)}
                className="px-3 py-1.5 text-xs btn-secondary-token rounded-lg"
              >
                Keep Training
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelActiveSession();
                  onFinish();
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#93000a] text-[#ffdad6] hover:bg-[#690005] transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Exercises Set Grids */}
      <div className="space-y-5">
        {activeSession.exercises.map((exerciseLog, exIdx) => {
          const matchExercise = CURATED_EXERCISES.find(
            (e) => e.id === exerciseLog.exerciseId
          );
          const gifUrl = matchExercise?.gifUrl;

          return (
            <SetGrid
              key={`${exerciseLog.exerciseId}-${exIdx}`}
              exerciseIndex={exIdx}
              exerciseLog={exerciseLog}
              gifUrl={gifUrl}
              weightUnit={settings.weightUnit}
              onUpdateSet={(sIdx, reps, weight) =>
                updateSessionSet(exIdx, sIdx, reps, weight)
              }
              onToggleComplete={(sIdx) =>
                toggleSessionSetCompletion(exIdx, sIdx)
              }
              onAddSet={() => addSetToSessionExercise(exIdx)}
              onRemoveSet={(sIdx) => removeSetFromSessionExercise(exIdx, sIdx)}
              onOpenDetails={() => setSelectedExerciseId(exerciseLog.exerciseId)}
            />
          );
        })}
      </div>

      {/* Sticky Bottom Finish Workout Bar */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-app via-app/95 to-transparent z-30 pointer-events-none transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 pointer-events-auto">
          <div className="hidden sm:block text-xs text-token-muted font-mono">
            {totalSetsCount} sets logged
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl btn-primary-token flex items-center justify-center gap-2 shadow-xl"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Finish & Save Workout Session</span>
          </button>
        </div>
      </div>

      {/* Exercise Detail Modal for in-workout instruction */}
      {selectedExerciseId && (
        <ExerciseDetailModal
          exerciseId={selectedExerciseId}
          onClose={() => setSelectedExerciseId(null)}
        />
      )}
    </div>
  );
};
