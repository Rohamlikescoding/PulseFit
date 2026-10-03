import React from 'react';
import { Timer } from '../Timer';
import { TimerViewSkeleton } from '../skeleton/PageSkeleton';

interface TimerViewProps {
  isLoading?: boolean;
}

export const TimerView: React.FC<TimerViewProps> = ({ isLoading = false }) => {
  if (isLoading) {
    return <TimerViewSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Timer />
    </div>
  );
};

export default TimerView;
