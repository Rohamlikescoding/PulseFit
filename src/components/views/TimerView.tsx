import React from 'react';
import { Timer } from '../Timer';

export const TimerView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Timer />
    </div>
  );
};
