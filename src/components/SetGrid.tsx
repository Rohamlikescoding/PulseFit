import React from 'react';
import { ExerciseLog } from '../types/workout';
import { Check, Dumbbell, Info, Minus, Plus, Trash2 } from 'lucide-react';

interface SetGridProps {
  exerciseIndex: number;
  exerciseLog: ExerciseLog;
  gifUrl?: string;
  weightUnit: 'kg' | 'lb';
  onUpdateSet: (setIndex: number, reps: number, weight: number) => void;
  onToggleComplete?: (setIndex: number) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onOpenDetails?: () => void;
}

export const SetGrid: React.FC<SetGridProps> = ({
  exerciseIndex,
  exerciseLog,
  gifUrl,
  weightUnit,
  onUpdateSet,
  onToggleComplete,
  onAddSet,
  onRemoveSet,
  onOpenDetails,
}) => {
  const completedSetsCount = exerciseLog.sets.filter((s) => s.completed).length;
  const isAllCompleted = exerciseLog.sets.length > 0 && completedSetsCount === exerciseLog.sets.length;

  return (
    <div className={`card-token p-4 sm:p-5 space-y-4 border-token transition-all duration-200 ${
      isAllCompleted ? 'border-[#74a87c]/40 bg-[#74a87c]/5' : ''
    }`}>
      {/* Exercise Header */}
      <div className="flex items-center justify-between gap-3 border-b border-token pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenDetails}
            className="relative h-13 w-13 shrink-0 rounded-2xl overflow-hidden bg-surface-secondary hover:ring-2 hover:ring-[#74a87c] border border-token flex items-center justify-center transition-all cursor-pointer group text-left shadow-sm"
            title="Inspect form guide, biomechanics, and animated demonstration"
          >
            {gifUrl ? (
              <img
                src={gifUrl}
                alt={exerciseLog.name || 'Exercise'}
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
              onClick={onOpenDetails}
              className="text-left font-bold text-token-primary hover:text-[#9dd3a4] text-base truncate block transition-colors cursor-pointer group flex items-center gap-2"
              title="Click to view full exercise form guide & demonstration"
            >
              <span className="truncate">{exerciseLog.name || 'Exercise'}</span>
              <span className="text-[10px] font-mono font-medium text-[#d9c3a5] opacity-80 group-hover:opacity-100 transition-opacity">
                (Guide)
              </span>
            </button>
            <div className="flex items-center gap-2 text-xs text-token-muted mt-0.5">
              <span>
                {exerciseLog.sets.length} {exerciseLog.sets.length === 1 ? 'set' : 'sets'}
              </span>
              {completedSetsCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#9dd3a4] font-medium font-mono">
                    {completedSetsCount}/{exerciseLog.sets.length} done
                  </span>
                </>
              )}
              {exerciseLog.bodyPart && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{exerciseLog.bodyPart}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenDetails && (
            <button
              type="button"
              onClick={onOpenDetails}
              className="px-3 py-2 text-xs rounded-xl bg-surface-secondary hover:bg-surface-tertiary border border-token text-token-secondary hover:text-[#9dd3a4] flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
              title="View biomechanics, muscle map, and demonstration"
            >
              <Info className="h-4 w-4 text-[#74a87c]" />
              <span className="hidden sm:inline font-medium">Form Guide</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddSet}
            className="px-3.5 py-2 text-xs btn-secondary-token rounded-xl flex items-center gap-1.5 shrink-0 min-h-[44px] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-[#d9c3a5]" />
            <span>Add Set</span>
          </button>
        </div>
      </div>

      {/* Grid of Sets with Botanical Tactile Checkpoints */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-mono font-semibold tracking-wider text-token-muted border-b border-token">
              <th className="py-2 px-2 w-12 text-center">DONE</th>
              <th className="py-2 px-2 w-14">SET</th>
              <th className="py-2 px-2">REPS</th>
              <th className="py-2 px-2">LOAD ({weightUnit.toUpperCase()})</th>
              <th className="py-2 px-2 w-12 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-token/40">
            {exerciseLog.sets.map((set, sIdx) => {
              const isChecked = Boolean(set.completed);
              return (
                <tr
                  key={sIdx}
                  className={`transition-colors ${
                    isChecked
                      ? 'bg-[#74a87c]/8 hover:bg-[#74a87c]/12'
                      : 'hover:bg-surface-secondary/40'
                  }`}
                >
                  {/* Botanical Tactile Checkpoint (24px rounded square with 6px corner radius) */}
                  <td className="py-3 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleComplete?.(sIdx)}
                      aria-label={isChecked ? `Mark set ${sIdx + 1} incomplete` : `Complete set ${sIdx + 1}`}
                      className={`checkpoint-box ${isChecked ? 'checked' : ''} min-w-[24px]`}
                      title="Tap to confirm set completion"
                    >
                      {isChecked && <Check className="h-3.5 w-3.5 text-[#0e1511] stroke-[3]" />}
                    </button>
                  </td>

                  {/* Set Index */}
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-surface-secondary text-xs font-mono font-bold text-token-secondary border border-token">
                      {sIdx + 1}
                    </span>
                  </td>

                  {/* Reps Input with Floor Adjusters */}
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1.5 max-w-[144px]">
                      <button
                        type="button"
                        aria-label={`Decrease reps for set ${sIdx + 1}`}
                        onClick={() =>
                          onUpdateSet(sIdx, Math.max(0, set.reps - 1), set.weight)
                        }
                        className="h-9 w-9 shrink-0 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-token-secondary border border-token flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="250"
                        value={set.reps}
                        onChange={(e) =>
                          onUpdateSet(
                            sIdx,
                            parseInt(e.target.value, 10) || 0,
                            set.weight
                          )
                        }
                        aria-label={`Reps for set ${sIdx + 1}`}
                        className="w-14 py-1.5 px-1 text-center input-token rounded-xl text-sm font-mono font-bold"
                      />
                      <button
                        type="button"
                        aria-label={`Increase reps for set ${sIdx + 1}`}
                        onClick={() =>
                          onUpdateSet(sIdx, set.reps + 1, set.weight)
                        }
                        className="h-9 w-9 shrink-0 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-token-secondary border border-token flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Weight / Load Input with Floor Adjusters */}
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1.5 max-w-[154px]">
                      <button
                        type="button"
                        aria-label={`Decrease weight for set ${sIdx + 1}`}
                        onClick={() =>
                          onUpdateSet(
                            sIdx,
                            set.reps,
                            Math.max(0, Number((set.weight - 2.5).toFixed(1)))
                          )
                        }
                        className="h-9 w-9 shrink-0 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-token-secondary border border-token flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight}
                        onChange={(e) =>
                          onUpdateSet(
                            sIdx,
                            set.reps,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        aria-label={`Weight for set ${sIdx + 1} in ${weightUnit}`}
                        className="w-16 py-1.5 px-1 text-center input-token rounded-xl text-sm font-mono font-bold"
                      />
                      <button
                        type="button"
                        aria-label={`Increase weight for set ${sIdx + 1}`}
                        onClick={() =>
                          onUpdateSet(
                            sIdx,
                            set.reps,
                            Number((set.weight + 2.5).toFixed(1))
                          )
                        }
                        className="h-9 w-9 shrink-0 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-token-secondary border border-token flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Remove Set */}
                  <td className="py-3 px-2 text-right">
                    <button
                      type="button"
                      disabled={exerciseLog.sets.length <= 1}
                      onClick={() => onRemoveSet(sIdx)}
                      aria-label={`Delete set ${sIdx + 1}`}
                      className="p-2 rounded-xl text-token-muted hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 disabled:opacity-25 disabled:hover:text-token-muted disabled:hover:bg-transparent transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
