import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'rounded' | 'circular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  width,
  height,
  style,
  ...props
}) => {
  const variantClasses = {
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
    circular: 'rounded-full',
  }[variant];

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading..."
      className={`animate-pulse bg-surface-tertiary/75 border border-token-subtle ${variantClasses} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    >
      <span className="sr-only">Loading content...</span>
    </div>
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}> = ({ lines = 2, className = '', lastLineWidth = '65%' }) => {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-busy="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          className={`w-full ${i === lines - 1 ? `max-w-[${lastLineWidth}]` : ''}`}
          style={i === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
      <span className="sr-only">Loading text...</span>
    </div>
  );
};

export const SkeletonCircle: React.FC<{
  size?: number | string;
  className?: string;
}> = ({ size = 48, className = '' }) => {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
    />
  );
};

export const SkeletonCard: React.FC<{
  children?: React.ReactNode;
  className?: string;
  height?: string | number;
}> = ({ children, className = '', height }) => {
  return (
    <div
      role="status"
      aria-busy="true"
      className={`card-token p-5 space-y-4 animate-pulse ${className}`}
      style={height ? { minHeight: typeof height === 'number' ? `${height}px` : height } : undefined}
    >
      {children || (
        <>
          <div className="flex items-center justify-between">
            <Skeleton height={18} width="40%" />
            <Skeleton height={24} width={24} variant="circular" />
          </div>
          <SkeletonText lines={2} />
          <Skeleton height={32} width="100%" className="rounded-xl mt-3" />
        </>
      )}
    </div>
  );
};
