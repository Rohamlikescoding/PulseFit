import React, { useEffect, useMemo, useState } from 'react';
import { fetchExerciseById, getExerciseApiStatus } from '../lib/exerciseApi';
import { useWorkoutStore } from '../store/workoutStore';
import { Exercise } from '../types/workout';
import { ExerciseDetailSkeleton } from './skeleton/PageSkeleton';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Flame,
  Info,
  Layers,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Wind,
  X,
  Zap,
} from 'lucide-react';

interface ExerciseDetailModalProps {
  exerciseId: string | null;
  initialExercise?: Exercise | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exerciseId,
  initialExercise,
  onClose,
}) => {
  const { sessionLogs, settings } = useWorkoutStore();
  const [exercise, setExercise] = useState<Exercise | null>(initialExercise || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageHasError, setImageHasError] = useState(false);
  const [imageReloadKey, setImageReloadKey] = useState(0);
  const apiStatus = getExerciseApiStatus();

  // Reset image state when exercise changes
  useEffect(() => {
    setIsImageLoaded(false);
    setImageHasError(false);
  }, [exercise?.id, exercise?.gifUrl]);

  // Fetch full details from API whenever exerciseId changes
  useEffect(() => {
    if (!exerciseId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setIsImageLoaded(false);
    setImageHasError(false);

    fetchExerciseById(exerciseId)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setExercise(data);
        } else if (initialExercise) {
          setExercise(initialExercise);
        } else {
          setError('Exercise details could not be retrieved from Workout API.');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (initialExercise) {
          setExercise(initialExercise);
        } else {
          setError('Failed to connect to Workout API. Check network or API configuration.');
        }
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [exerciseId, initialExercise]);

  // Derive user's personal training history for this exercise from sessionLogs
  const personalStats = useMemo(() => {
    if (!exerciseId) return null;

    let maxWeight = 0;
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;
    let sessionsCount = 0;

    sessionLogs.forEach((log) => {
      const match = (log.exercises || []).find(
        (e) =>
          e.exerciseId === exerciseId ||
          e.name?.toLowerCase() === exercise?.name?.toLowerCase()
      );

      if (match && match.sets && match.sets.length > 0) {
        sessionsCount++;
        match.sets.forEach((set) => {
          totalSets++;
          totalReps += set.reps || 0;
          totalVolume += (set.reps || 0) * (set.weight || 0);
          if ((set.weight || 0) > maxWeight) {
            maxWeight = set.weight;
          }
        });
      }
    });

    return {
      maxWeight,
      totalSets,
      totalReps,
      totalVolume: Math.round(totalVolume),
      sessionsCount,
    };
  }, [sessionLogs, exerciseId, exercise?.name]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!exerciseId) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0e1511]/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="card-token w-full max-w-3xl max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 border-token">
        {/* Top Header Bar with Back Button & Close */}
        <div className="p-3.5 sm:p-5 border-b border-token flex items-center justify-between gap-3 bg-surface sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl text-token-muted hover:text-token-primary hover:bg-surface-secondary border border-token/60 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              aria-label="Back to workout"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9dd3a4]">
                  Exercise Details & Form Guide
                </span>
                {apiStatus.apiKeyConfigured ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#74a87c]/15 text-[#9dd3a4] border border-[#74a87c]/30 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9dd3a4] animate-pulse" />
                    WorkoutAPI Live
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-tertiary text-token-muted border border-token">
                    Curated Biomechanics
                  </span>
                )}
              </div>
              <h2
                id="exercise-detail-title"
                className="text-base sm:text-xl font-extrabold text-token-primary tracking-tight truncate mt-0.5 font-serif-editorial"
              >
                {exercise?.name || 'Loading Exercise Details...'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close exercise details"
            className="p-2 rounded-xl text-token-muted hover:text-token-primary hover:bg-surface-secondary border border-transparent hover:border-token transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading && !exercise ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-token-muted px-1 font-mono">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#74a87c]" />
                <span>Loading exercise biomechanics & demonstration...</span>
              </div>
              <ExerciseDetailSkeleton />
            </div>
          ) : error && !exercise ? (
            <div className="p-4 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/25 text-[#ffb4ab] text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (exerciseId) {
                    setIsLoading(true);
                    setError(null);
                    fetchExerciseById(exerciseId).then((data) => {
                      if (data) setExercise(data);
                      setIsLoading(false);
                    });
                  }
                }}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-[#93000a] text-[#ffdad6] hover:bg-[#690005] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : exercise ? (
            <>
              {/* 1. GIF Demonstration Box */}
              <div className="space-y-3">
                <div className="relative w-full rounded-2xl overflow-hidden bg-[#161d19] border border-token aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center shadow-inner group">
                  {exercise.gifUrl && !imageHasError ? (
                    <img
                      key={`${exercise.gifUrl}-${imageReloadKey}`}
                      src={`${exercise.gifUrl}${exercise.gifUrl.includes('?') ? '&' : '?'}r=${imageReloadKey}`}
                      alt={`${exercise.name} demonstration`}
                      className={`max-h-full max-w-full object-contain mx-auto transition-opacity duration-300 ${
                        isImageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading="eager"
                      onLoad={() => {
                        setIsImageLoaded(true);
                        setImageHasError(false);
                      }}
                      onError={() => {
                        setIsImageLoaded(false);
                        setImageHasError(true);
                      }}
                    />
                  ) : null}

                  {/* Loading Indicator while GIF streams */}
                  {!isImageLoaded && !imageHasError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-token-muted p-4 text-center bg-[#161d19]/90 gap-2.5">
                      <Loader2 className="h-8 w-8 text-[#9dd3a4] animate-spin" />
                      <span className="text-xs font-mono font-medium text-token-primary">
                        Loading Exercise Animation...
                      </span>
                      <span className="text-[10px] text-token-muted font-mono">
                        Streaming from Workout API
                      </span>
                    </div>
                  )}

                  {/* Fallback & Retry when image failed */}
                  {imageHasError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-token-muted p-4 text-center bg-[#161d19] gap-2">
                      <Dumbbell className="h-10 w-10 text-token-muted opacity-40 mb-1" />
                      <span className="text-xs font-semibold text-token-primary">
                        Demonstration Animation Offline
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setImageHasError(false);
                          setIsImageLoaded(false);
                          setImageReloadKey((k) => k + 1);
                        }}
                        className="mt-1 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#74a87c]/20 text-[#9dd3a4] border border-[#74a87c]/30 hover:bg-[#74a87c]/30 transition-colors"
                      >
                        Reload GIF Animation
                      </button>
                    </div>
                  )}

                  {/* Animated Badge Indicator */}
                  {isImageLoaded && (
                    <>
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-surface/90 backdrop-blur-md border border-token text-[10px] font-mono font-bold text-token-primary flex items-center gap-1.5 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-[#74a87c] animate-pulse" />
                        <span>Workout API · Form Animation</span>
                      </div>

                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-[#0e1511]/80 backdrop-blur-md text-[10px] font-mono text-[#dde4de] flex items-center gap-1 shadow-sm border border-token">
                        <RotateCcw className="h-3 w-3 text-[#d9c3a5]" />
                        <span>Continuous Loop</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Biomechanical Execution Tempo & Breathing Cue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-surface-secondary border border-token flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent-brand shrink-0" />
                    <div>
                      <span className="font-semibold text-token-primary block text-[11px]">Recommended Tempo</span>
                      <span className="text-[10px] text-token-muted font-mono">2s eccentric descent · 1s pause · 1s concentric</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-secondary border border-token flex items-center gap-2">
                    <Wind className="h-4 w-4 text-accent-brand shrink-0" />
                    <div>
                      <span className="font-semibold text-token-primary block text-[11px]">Breathing Pattern</span>
                      <span className="text-[10px] text-token-muted">Exhale on effort (concentric), inhale on return</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Metadata Tags & Target Muscles (Things the API Returns) */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-token-muted block">
                  Exercise Anatomy & Specifications
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  <div className="p-3 rounded-xl bg-surface-secondary border border-token">
                    <span className="text-[10px] font-mono uppercase text-token-muted block">
                      Body Part
                    </span>
                    <span className="text-xs font-bold text-token-primary capitalize mt-0.5 block truncate">
                      {exercise.bodyPart}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-secondary border border-token">
                    <span className="text-[10px] font-mono uppercase text-token-muted block">
                      Primary Target
                    </span>
                    <span className="text-xs font-bold text-accent-brand capitalize mt-0.5 block truncate">
                      {exercise.target || 'General'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-secondary border border-token">
                    <span className="text-[10px] font-mono uppercase text-token-muted block">
                      Equipment
                    </span>
                    <span className="text-xs font-bold text-token-primary capitalize mt-0.5 block truncate">
                      {exercise.equipment || 'Dumbbell'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-secondary border border-token">
                    <span className="text-[10px] font-mono uppercase text-token-muted block">
                      Difficulty
                    </span>
                    <span className="text-xs font-bold text-token-primary capitalize mt-0.5 block truncate">
                      {exercise.difficulty || 'Intermediate'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-secondary border border-token">
                    <span className="text-[10px] font-mono uppercase text-token-muted block">
                      Mechanics
                    </span>
                    <span className="text-xs font-bold text-token-primary capitalize mt-0.5 block truncate">
                      {exercise.mechanics || 'Compound'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-secondary border border-token">
                    <span className="text-[10px] font-mono uppercase text-token-muted block">
                      Force
                    </span>
                    <span className="text-xs font-bold text-token-primary capitalize mt-0.5 block truncate">
                      {exercise.force || 'Push'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Muscles Activated */}
              {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-token-secondary flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-accent-brand" />
                    <span>Secondary Synergist Muscles Activated</span>
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {exercise.secondaryMuscles.map((muscle, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-surface-secondary border border-token text-xs text-token-secondary capitalize flex items-center gap-1"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-brand" />
                        <span>{muscle}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Step-by-Step Instructions (From Workout API) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-token pb-2">
                  <CheckCircle2 className="h-4 w-4 text-[#74a87c]" />
                  <h3 className="text-sm font-bold text-token-primary">
                    Step-by-Step Execution Guide
                  </h3>
                </div>

                {exercise.instructions && exercise.instructions.length > 0 ? (
                  <ol className="space-y-2.5">
                    {exercise.instructions.map((step, sIdx) => (
                      <li
                        key={sIdx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-surface-secondary border border-token/70 text-xs text-token-secondary leading-relaxed"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-accent-brand font-mono font-bold text-[11px] border border-accent-token">
                          {sIdx + 1}
                        </span>
                        <span className="mt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-token-muted italic">
                    Standard lifting mechanics apply. Maintain controlled tempo and focus on the target muscle contraction.
                  </p>
                )}
              </div>

              {/* 4. Form Tips & Coaching Cues (From Workout API) */}
              {exercise.tips && exercise.tips.length > 0 && (
                <div className="space-y-2.5 p-4 rounded-2xl bg-accent-subtle border border-accent-token">
                  <div className="flex items-center gap-2 text-xs font-bold text-accent-brand">
                    <Lightbulb className="h-4 w-4" />
                    <span>Pro Form Tips & Coaching Cues</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-token-secondary leading-relaxed">
                    {exercise.tips.map((tip, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2">
                        <span className="text-accent-brand mt-0.5">▸</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 5. User's Personal Best & History */}
              {personalStats && personalStats.sessionsCount > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-token pb-2">
                    <span className="text-xs font-bold text-token-primary flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 text-accent-brand" />
                      <span>Your Personal Training Record for {exercise.name}</span>
                    </span>
                    <span className="text-[11px] font-mono text-token-muted">
                      {personalStats.sessionsCount} session{personalStats.sessionsCount > 1 ? 's' : ''} logged
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-surface-secondary border border-token">
                      <span className="text-[10px] font-mono uppercase text-token-muted block">
                        Personal Best
                      </span>
                      <span className="text-sm font-black font-mono text-accent-brand mt-0.5 block">
                        {personalStats.maxWeight} {settings.weightUnit}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-secondary border border-token">
                      <span className="text-[10px] font-mono uppercase text-token-muted block">
                        Total Sets
                      </span>
                      <span className="text-sm font-black font-mono text-token-primary mt-0.5 block">
                        {personalStats.totalSets}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-secondary border border-token">
                      <span className="text-[10px] font-mono uppercase text-token-muted block">
                        Total Volume
                      </span>
                      <span className="text-sm font-black font-mono text-token-primary mt-0.5 block">
                        {personalStats.totalVolume.toLocaleString()} {settings.weightUnit}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-token bg-surface flex items-center justify-between gap-3">
          <div className="text-xs text-token-muted hidden sm:block">
            Powered by Workout API & Curated Biomechanical Guides
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl btn-primary-token text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Back to Workout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
