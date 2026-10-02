import React, { useMemo } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CURATED_EXERCISES } from '../../data/exercisesData';
import { SessionLog } from '../../types/workout';

interface VolumePieChartProps {
  sessionLogs: SessionLog[];
  weightUnit: 'kg' | 'lb';
}

const COLORS = [
  '#74a87c', // Deep Sage
  '#d9c3a5', // Warm Bamboo
  '#aad1a2', // Soft Matcha
  '#c47b62', // Terracotta Clay
  '#564730', // Earth Bamboo
  '#80a67a', // Moss Sage
  '#cbb598', // Light Bamboo
  '#8b9389', // River Stone
];

export const VolumePieChart: React.FC<VolumePieChartProps> = ({
  sessionLogs,
  weightUnit,
}) => {
  const data = useMemo(() => {
    const exerciseMap = new Map<string, string>();
    CURATED_EXERCISES.forEach((ex) => {
      exerciseMap.set(ex.id, ex.bodyPart);
    });

    const volumeByBodyPart: Record<string, number> = {};

    sessionLogs.forEach((log) => {
      (log.exercises || []).forEach((exLog) => {
        const bodyPart =
          exLog.bodyPart ||
          exerciseMap.get(exLog.exerciseId) ||
          'other';

        const exVolume = (exLog.sets || []).reduce(
          (sum, s) => sum + (s.reps || 0) * (s.weight || 0),
          0
        );

        volumeByBodyPart[bodyPart] = (volumeByBodyPart[bodyPart] || 0) + exVolume;
      });
    });

    return Object.entries(volumeByBodyPart)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [sessionLogs]);

  const totalVolume = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="card-token p-6 text-center py-12 space-y-2">
        <h3 className="text-base font-bold text-token-primary">Volume by Muscle Group</h3>
        <p className="text-xs text-token-muted">
          No training session logs found yet. Complete a workout to see volume distribution.
        </p>
      </div>
    );
  }

  return (
    <div className="card-token p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-token-primary tracking-tight">
            Volume by Body Part
          </h3>
          <p className="text-xs text-token-muted mt-0.5">
            Total lifted volume distribution across muscle targets
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-token-muted uppercase font-mono block">
            Total Volume
          </span>
          <span className="text-sm font-mono font-bold text-accent-brand">
            {totalVolume.toLocaleString()} {weightUnit}
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  const percentage = totalVolume
                    ? Math.round(((item.value as number) / totalVolume) * 100)
                    : 0;
                  return (
                    <div className="bg-surface border border-token rounded-xl p-3 shadow-xl text-xs font-mono">
                      <p className="font-bold text-token-primary">{item.name}</p>
                      <p className="text-accent-brand mt-1">
                        {Number(item.value).toLocaleString()} {weightUnit} ({percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-token-secondary font-medium capitalize">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
