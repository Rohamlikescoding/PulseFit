'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full card-token p-7 sm:p-9 text-center space-y-6 shadow-2xl border-token">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/25">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-widest uppercase text-red-400 block font-semibold">
            System Equilibrium Interrupted
          </span>
          <h1 className="text-2xl font-bold font-serif-editorial text-token-primary">
            Something went wrong
          </h1>
          <p className="text-xs text-token-secondary leading-relaxed">
            {error?.message || 'An unexpected runtime issue occurred. Your workout data in storage remains safe.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-primary-token text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-secondary-token text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Return to Sanctuary</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
