'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto my-12 card-token p-6 sm:p-8 text-center space-y-5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
        <AlertCircle className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold font-serif-editorial text-token-primary">
          Unable to Load Analytics
        </h2>
        <p className="text-xs text-token-secondary max-w-md mx-auto">
          {error?.message || 'An error occurred while compiling your workout analytics and charts.'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-xl btn-primary-token text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-md"
      >
        <RotateCcw className="h-4 w-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
