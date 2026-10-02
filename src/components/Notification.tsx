import React from 'react';
import { NotificationAction } from '../types/workout';
import { Bell, X } from 'lucide-react';

interface NotificationProps {
  title: string;
  message: string;
  actions: NotificationAction[];
  onClose?: () => void;
}

/**
 * Purely presentational, reusable Notification component with semantic design tokens
 */
export const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  actions,
  onClose,
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full max-w-md card-token border-accent-token p-4 shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-subtle text-accent-brand border border-accent-token">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-token-primary tracking-tight">{title}</h3>
            <p className="text-xs text-token-secondary leading-relaxed">{message}</p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification"
            className="text-token-muted hover:text-token-primary p-1 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          {actions.map((action, idx) => {
            let style =
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-95';
            if (action.variant === 'primary' || !action.variant) {
              style += ' btn-primary-token';
            } else if (action.variant === 'secondary') {
              style += ' btn-secondary-token';
            } else {
              style += ' text-token-muted hover:text-token-primary hover:bg-surface-secondary';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={action.onClick}
                className={style}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
