import React from 'react';
import { useRouteError, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  const errorMessage =
    error?.statusText ||
    error?.message ||
    (typeof error === 'string' ? error : 'An unexpected error occurred while loading this view.');

  const handleTryAgain = () => {
    // Re-navigating to the current path or refreshing route
    navigate(0);
  };

  return (
    <div className="py-16 px-4 max-w-lg mx-auto text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab] shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-mono tracking-widest uppercase text-token-muted block">
          Route Error Encountered
        </span>
        <h2 className="text-2xl font-extrabold font-serif-editorial text-token-primary tracking-tight">
          Unable to Load View
        </h2>
        <p className="text-xs sm:text-sm text-token-muted leading-relaxed">
          We encountered a hiccup while rendering this section of the sanctuary. Your routines and session records remain untouched.
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-surface-secondary border border-token text-left">
        <span className="text-[10px] font-mono uppercase text-token-muted block">Diagnostic Message</span>
        <p className="text-xs font-mono text-[#ffb4ab] mt-1 break-words">
          {errorMessage}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleTryAgain}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-primary-token flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        <Link
          to="/"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-secondary-token flex items-center justify-center gap-2 text-xs font-semibold"
        >
          <Home className="w-4 h-4 text-[#d9c3a5]" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
