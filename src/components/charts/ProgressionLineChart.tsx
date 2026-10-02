import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CURATED_EXERCISES } from '../../data/exercisesData';
import { formatDisplayDate } from '../../lib/schedule';
import { SessionLog } from '../../types/workout';

interface ProgressionLineChartProps {
  sessionLogs: SessionLog[];
  weightUnit: 'kg' | 'lb';
}

export const ProgressionLineChart: React.FC<ProgressionLineChartProps> = ({
  sessionLogs,
  weightUnit,
}) => {
  const availableExercises = useMemo(() => {
    const exerciseMap = new Map<string, string>();
    CURATED_EXERCISES.forEach((ex) => exerciseMap.set(ex.id, ex.name));

    const found = new Map<string, string>();
    sessionLogs.forEach((log) => {
      (log.exercises || []).forEach((ex) => {
        const name = ex.name || exerciseMap.get(ex.exerciseId) || ex.exerciseId;
        found.set(ex.exerciseId, name);
      });
    });

    return Array.from(found.entries()).map(([id, name]) => ({ id, name }));
  }, [sessionLogs]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    availableExercises[0]?.id || 'db-bench-press'
  );
  const [metric, setMetric] = useState<'weight' | 'volume'>('weight');

  const chartData = useMemo(() => {
    if (!selectedExerciseId) return [];

    const sortedLogs = [...sessionLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const points: {
      date: string;
      displayDate: string;
      maxWeight: number;
      totalVolume: number;
      setsCount: number;
    }[] = [];

    sortedLogs.forEach((log) => {
      const matchEx = (log.exercises || []).find(
        (e) => e.exerciseId === selectedExerciseId
      );
      if (!matchEx || !matchEx.sets || matchEx.sets.length === 0) return;

      const maxWeight = Math.max(...matchEx.sets.map((s) => s.weight || 0));
      const totalVolume = matchEx.sets.reduce(
        (sum, s) => sum + (s.reps || 0) * (s.weight || 0),
        0
      );

      points.push({
        date: log.date,
        displayDate: formatDisplayDate(log.date),
        maxWeight: Math.round(maxWeight * 10) / 10,
        totalVolume: Math.round(totalVolume),
        setsCount: matchEx.sets.length,
      });
    });

    return points;
  }, [sessionLogs, selectedExerciseId]);

  return (
    <div className="card-token p-5 sm:p-6 space-y-4">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-token-primary tracking-tight">
            Exercise Progression Over Time
          </h3>
          <p className="text-xs text-token-muted mt-0.5">
            Track strength load and volume increases across completed sessions
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Exercise Selector */}
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="px-3 py-1.5 input-token rounded-xl text-xs font-semibold"
          >
            {availableExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>

          {/* Metric Toggle */}
          <div className="flex items-center gap-1 bg-surface-secondary p-1 border border-token rounded-xl">
            <button
              type="button"
              onClick={() => setMetric('weight')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                metric === 'weight'
                  ? 'btn-primary-token shadow-sm'
                  : 'text-token-secondary hover:text-token-primary'
              }`}
            >
              Max Weight
            </button>
            <button
              type="button"
              onClick={() => setMetric('volume')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                metric === 'volume'
                  ? 'btn-primary-token shadow-sm'
                  : 'text-token-secondary hover:text-token-primary'
              }`}
            >
              Total Volume
            </button>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-token rounded-2xl bg-surface-secondary/40">
          <p className="text-sm font-semibold text-token-primary">
            No session logs found for this exercise
          </p>
          <p className="text-xs text-token-muted mt-1">
            Perform this exercise in a workout to begin tracking progression.
          </p>
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="var(--color-chart-axis)"
                tick={{ fill: 'var(--color-chart-axis)', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="var(--color-chart-axis)"
                tick={{ fill: 'var(--color-chart-axis)', fontSize: 11 }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-surface border border-token rounded-xl p-3 shadow-xl text-xs font-mono">
                        <p className="font-bold text-token-primary">{data.displayDate}</p>
                        <p className="text-accent-brand mt-1">
                          Max Weight: {data.maxWeight} {weightUnit}
                        </p>
                        <p className="text-[#9dd3a4] mt-0.5">
                          Total Volume: {data.totalVolume} {weightUnit} ({data.setsCount} sets)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey={metric === 'weight' ? 'maxWeight' : 'totalVolume'}
                stroke="#74a87c"
                strokeWidth={3}
                dot={{ fill: '#74a87c', r: 4, stroke: 'var(--color-surface)', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#9dd3a4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
