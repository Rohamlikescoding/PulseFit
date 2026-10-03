import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Dumbbell, Timer } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-20 px-4 max-w-lg mx-auto text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-secondary border border-token flex items-center justify-center text-[#74a87c] shadow-sm">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-mono tracking-widest uppercase text-token-muted block">
          404 · Uncharted Pathway
        </span>
        <h1 className="text-3xl font-extrabold font-serif-editorial text-token-primary tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-token-muted leading-relaxed">
          The sanctuary path you are seeking does not exist or has been shifted. Choose a destination below to continue your training flow.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          to="/"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-primary-token flex items-center justify-center gap-2 text-xs font-bold"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/workouts"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-secondary-token flex items-center justify-center gap-2 text-xs font-semibold"
        >
          <Dumbbell className="w-4 h-4 text-[#d9c3a5]" />
          <span>Go to Routines</span>
        </Link>
        <Link
          to="/timer"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-secondary-token flex items-center justify-center gap-2 text-xs font-semibold"
        >
          <Timer className="w-4 h-4 text-[#74a87c]" />
          <span>Zen Timer</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
