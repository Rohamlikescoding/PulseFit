'use client';

import React from 'react';
import { Timer } from '../Timer';
import { TimerViewSkeleton } from '../skeleton/PageSkeleton';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface TimerViewProps {
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const TimerView: React.FC<TimerViewProps> = ({
  isLoading = false,
  error = null,
  onRetry,
}) => {
  if (isLoading) {
    return <TimerViewSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <div className="card-token p-4 sm:p-5 border border-red-500/30 bg-red-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-red-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3.5 py-1.5 rounded-xl btn-primary-token text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      <Timer />
    </div>
  );
};

export default TimerView;
