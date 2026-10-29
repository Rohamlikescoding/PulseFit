'use client';

import React from 'react';

export const Field: React.FC<{
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor: string;
}> = ({ label, error, hint, children, htmlFor }) => (
  <div className="space-y-1.5">
    <label htmlFor={htmlFor} className="text-xs font-semibold text-token-secondary block">
      {label}
    </label>
    {children}
    {error ? (
      <p role="alert" className="text-[11px] text-[#ffb4ab]">{error}</p>
    ) : hint ? (
      <p className="text-[11px] text-token-muted">{hint}</p>
    ) : null}
  </div>
);

export const inputClass =
  'input-token w-full px-3.5 py-3 rounded-xl text-sm min-h-[48px]';

export const AuthCard: React.FC<{ children: React.ReactNode; wide?: boolean }> = ({ children, wide }) => (
  <div className={`card-token p-6 sm:p-8 w-full ${wide ? 'max-w-xl' : 'max-w-md'} mx-auto glow-sanctuary`}>
    {children}
  </div>
);
