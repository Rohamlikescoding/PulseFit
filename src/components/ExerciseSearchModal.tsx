import React, { useEffect, useState } from 'react';
import { BODY_PARTS } from '../data/exercisesData';
import { fetchExercises, getExerciseApiStatus } from '../lib/exerciseApi';
import { Exercise } from '../types/workout';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { ExerciseSearchSkeleton } from './skeleton/PageSkeleton';
import { Check, Dumbbell, Globe, Info, Key, Loader2, Search, X } from 'lucide-react';

interface ExerciseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  alreadySelectedIds?: string[];
}

export const ExerciseSearchModal: React.FC<ExerciseSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  alreadySelectedIds = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('all');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState({ source: 'local', apiKeyConfigured: false });
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    const timer = setTimeout(async () => {
      try {
        const results = await fetchExercises({
          q: searchTerm,
          bodyPart: selectedBodyPart,
        });
        if (isMounted) {
          setExercises(results);
          setApiStatus(getExerciseApiStatus());
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage('Could not load exercises. Using local exercise library.');
          setIsLoading(false);
        }
      }
    }, 280);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, searchTerm, selectedBodyPart]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-search-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0e1511]/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="card-token w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border-token">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-token flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="exercise-search-title" className="text-xl font-bold text-token-primary tracking-tight font-serif-editorial">
                Select Exercise
              </h2>
              {apiStatus.source === 'workoutapi' ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#74a87c]/15 text-[#9dd3a4] border border-[#74a87c]/30 flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span>WorkoutAPI Live</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[#74a87c]/10 text-[#9dd3a4] border border-[#74a87c]/25 flex items-center gap-1">
                  <Key className="h-3 w-3 text-[#d9c3a5]" />
                  <span>WorkoutAPI Ready</span>
                </span>
              )}
            </div>
            <p className="text-xs text-token-muted mt-0.5">
              Browse exercises with animated demonstrations (configured for docs.workoutapi.com)
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-token-muted hover:text-token-primary hover:bg-surface-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input & Category Filters */}
        <div className="p-4 sm:p-5 border-b border-token space-y-3 bg-surface-secondary/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-token-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exercises, target muscles, equipment..."
              className="w-full pl-10 pr-4 py-2.5 input-token rounded-xl text-sm"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-token-muted hover:text-token-primary p-1 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Body Part Segmented Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {BODY_PARTS.map((bp) => (
              <button
                key={bp}
                type="button"
                onClick={() => setSelectedBodyPart(bp)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap capitalize transition-all font-medium ${
                  selectedBodyPart === bp
                    ? 'btn-primary-token shadow-sm'
                    : 'btn-secondary-token text-xs'
                }`}
              >
                {bp}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {isLoading ? (
            <div className="space-y-3 py-1">
              <div className="flex items-center gap-2 text-xs text-token-muted px-1 font-mono">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#74a87c]" />
                <span>Searching botanical exercise catalog...</span>
              </div>
              <ExerciseSearchSkeleton count={4} />
            </div>
          ) : errorMessage ? (
            <div className="text-center py-10 px-4">
              <p className="text-sm text-[#ffb4ab] font-medium">{errorMessage}</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <div className="h-10 w-10 mx-auto rounded-full bg-surface-secondary flex items-center justify-center text-token-muted">
                <Dumbbell className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-token-primary">No exercises found</p>
              <p className="text-xs text-token-muted">
                Try searching for "bench", "curl", "squat", or select "all" body parts.
              </p>
            </div>
          ) : (
            exercises.map((exercise) => {
              const isSelected = alreadySelectedIds.includes(exercise.id);

              return (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface-secondary border border-token hover:border-token-strong transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Media Thumbnail with Clickable Preview */}
                    <button
                      type="button"
                      onClick={() => setPreviewExercise(exercise)}
                      className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-surface-tertiary border border-token hover:border-accent-token flex items-center justify-center transition-all cursor-pointer group text-left"
                      title="Click to view full instructions & animated demonstration"
                    >
                      {exercise.gifUrl ? (
                        <img
                          src={exercise.gifUrl}
                          alt={exercise.name}
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
                        onClick={() => setPreviewExercise(exercise)}
                        className="text-left font-semibold text-token-primary hover:text-accent-brand text-sm truncate block transition-colors cursor-pointer group"
                        title="Click to view exercise form guide & details"
                      >
                        <span className="truncate">{exercise.name}</span>
                      </button>
                      <div className="flex items-center gap-2 text-xs text-token-muted mt-0.5">
                        <span className="capitalize">{exercise.bodyPart}</span>
                        {exercise.target && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="capitalize text-token-subtle">{exercise.target}</span>
                          </>
                        )}
                        {exercise.equipment && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="capitalize text-token-subtle">{exercise.equipment}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewExercise(exercise)}
                      className="p-2 rounded-xl bg-surface hover:bg-surface-tertiary border border-token text-token-secondary hover:text-accent-brand transition-colors cursor-pointer"
                      title="View exercise instructions, animated GIF & form cues"
                    >
                      <Info className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={isSelected}
                      onClick={() => {
                        onSelectExercise(exercise);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-surface-tertiary text-token-muted border border-token cursor-not-allowed'
                          : 'btn-primary-token shadow-sm'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <span>Add</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Exercise Detail Modal Preview */}
      {previewExercise && (
        <ExerciseDetailModal
          exerciseId={previewExercise.id}
          initialExercise={previewExercise}
          onClose={() => setPreviewExercise(null)}
        />
      )}
    </div>
  );
};
