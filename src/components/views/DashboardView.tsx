import React, { useMemo } from 'react';
import { useWorkoutStore } from '../../store/workoutStore';
import { useTimerStore } from '../../store/timerStore';
import { HeatMap } from '../charts/HeatMap';
import { VolumePieChart } from '../charts/VolumePieChart';
import { ProgressionLineChart } from '../charts/ProgressionLineChart';
import { SanctuaryGauge } from '../SanctuaryGauge';
import {
  Laptop,
  Leaf,
  Moon,
  RefreshCw,
  Scale,
  Settings as SettingsIcon,
  Sun,
  Timer,
  Trash2,
  Volume2,
} from 'lucide-react';
import { formatDisplayDate } from '../../lib/schedule';

export const DashboardView: React.FC = () => {
  const {
    sessionLogs,
    settings,
    updateSettings,
    deleteSessionLog,
    resetAllData,
  } = useWorkoutStore();
  const { soundEnabled, toggleSound } = useTimerStore();

  const isLight =
    settings.theme === 'light' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches);

  // Metrics
  const totalVolume = useMemo(() => {
    return sessionLogs.reduce(
      (acc, log) =>
        acc +
        (log.exercises || []).reduce(
          (exAcc, ex) =>
            exAcc +
            (ex.sets || []).reduce(
              (sAcc, s) => sAcc + (s.reps || 0) * (s.weight || 0),
              0
            ),
          0
        ),
      0
    );
  }, [sessionLogs]);

  const totalSets = useMemo(() => {
    return sessionLogs.reduce(
      (acc, log) =>
        acc +
        (log.exercises || []).reduce(
          (exAcc, ex) => exAcc + (ex.sets ? ex.sets.length : 0),
          0
        ),
      0
    );
  }, [sessionLogs]);

  const totalReps = useMemo(() => {
    return sessionLogs.reduce(
      (acc, log) =>
        acc +
        (log.exercises || []).reduce(
          (exAcc, ex) =>
            exAcc +
            (ex.sets || []).reduce((sAcc, s) => sAcc + (s.reps || 0), 0),
          0
        ),
      0
    );
  }, [sessionLogs]);

  const activeBtnClass = isLight
    ? 'bg-[#1d1b18] text-[#ffffff] font-bold shadow-sm'
    : 'bg-[#74a87c] text-[#0e1511] font-bold shadow-sm';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className={`text-[11px] font-mono tracking-widest uppercase block ${
            isLight ? 'text-[#466645]' : 'text-[#9dd3a4]'
          }`}>
            Botanical Sanctuaria · Biophilic Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-token-primary tracking-tight mt-0.5 font-serif-editorial">
            Equilibrium & Performance Analytics
          </h1>
          <p className="text-xs text-token-muted mt-1">
            Dynamic biophilic metrics computed from all persisted personal training session records.
          </p>
        </div>
      </div>

      {/* 1. Sanctuary Metrics Equilibrium Gauge (Custom Component) */}
      <SanctuaryGauge />

      {/* 2. Aggregate Stat Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="card-token p-4">
          <span className="text-[11px] font-mono font-semibold uppercase text-token-muted block mb-1">
            Total Sessions
          </span>
          <span className="text-2xl font-black font-mono text-token-primary tabular-nums">
            {sessionLogs.length}
          </span>
        </div>

        <div className="card-token p-4">
          <span className="text-[11px] font-mono font-semibold uppercase text-token-muted block mb-1">
            Cumulative Load
          </span>
          <span className={`text-2xl font-black font-mono tabular-nums ${
            isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'
          }`}>
            {Math.round(totalVolume).toLocaleString()}
          </span>
          <span className="text-[10px] text-token-muted font-mono ml-1">{settings.weightUnit}</span>
        </div>

        <div className="card-token p-4">
          <span className="text-[11px] font-mono font-semibold uppercase text-token-muted block mb-1">
            Total Sets
          </span>
          <span className="text-2xl font-black font-mono text-token-primary tabular-nums">
            {totalSets.toLocaleString()}
          </span>
        </div>

        <div className="card-token p-4">
          <span className="text-[11px] font-mono font-semibold uppercase text-token-muted block mb-1">
            Total Reps
          </span>
          <span className={`text-2xl font-black font-mono tabular-nums ${
            isLight ? 'text-[#466645]' : 'text-[#9dd3a4]'
          }`}>
            {totalReps.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. Heat Map Component */}
      <HeatMap sessionLogs={sessionLogs} referenceDate={new Date()} />

      {/* 4. Visual Charts Grid: Pie & Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VolumePieChart sessionLogs={sessionLogs} weightUnit={settings.weightUnit} />
        <ProgressionLineChart sessionLogs={sessionLogs} weightUnit={settings.weightUnit} />
      </div>

      {/* 5. Settings Card */}
      <div className="card-token p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-token pb-4">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
            isLight
              ? 'bg-[#c5eabf]/50 text-[#466645] border-[#466645]/30'
              : 'bg-[#74a87c]/15 text-[#9dd3a4] border-[#74a87c]/25'
          }`}>
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-token-primary tracking-tight font-serif-editorial">
              Sanctuary Preferences & Environment
            </h2>
            <p className="text-xs text-token-muted">
              Biophilic theme modes, measurement standards, and audio pacing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Weight Unit */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-token-secondary flex items-center gap-2">
              <Scale className={`h-3.5 w-3.5 ${isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'}`} />
              <span>Weight Unit</span>
            </label>
            <div className="flex items-center gap-1.5 bg-surface-secondary p-1 border border-token rounded-xl">
              <button
                type="button"
                onClick={() => updateSettings({ weightUnit: 'kg' })}
                className={`flex-1 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                  settings.weightUnit === 'kg'
                    ? activeBtnClass
                    : 'text-token-secondary hover:text-token-primary'
                }`}
              >
                Kilograms (kg)
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ weightUnit: 'lb' })}
                className={`flex-1 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                  settings.weightUnit === 'lb'
                    ? activeBtnClass
                    : 'text-token-secondary hover:text-token-primary'
                }`}
              >
                Pounds (lb)
              </button>
            </div>
          </div>

          {/* Timer Sound Alerts */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-token-secondary flex items-center gap-2">
              <Volume2 className={`h-3.5 w-3.5 ${isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'}`} />
              <span>Exercise Chime Alerts</span>
            </label>
            <div className="flex items-center gap-1.5 bg-surface-secondary p-1 border border-token rounded-xl">
              <button
                type="button"
                onClick={() => {
                  if (!soundEnabled) toggleSound();
                }}
                className={`flex-1 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                  soundEnabled
                    ? activeBtnClass
                    : 'text-token-secondary hover:text-token-primary'
                }`}
              >
                Chime On
              </button>
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) toggleSound();
                }}
                className={`flex-1 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                  !soundEnabled
                    ? activeBtnClass
                    : 'text-token-secondary hover:text-token-primary'
                }`}
              >
                Mute
              </button>
            </div>
          </div>

          {/* Theme Selector (Dark Sanctuary, Light Atelier, System) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-token-secondary flex items-center gap-2">
              <Sun className={`h-3.5 w-3.5 ${isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'}`} />
              <span>Sanctuary Environment</span>
            </label>
            <div className="flex items-center gap-1.5 bg-surface-secondary p-1 border border-token rounded-xl">
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex-1 py-2 text-xs capitalize rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  settings.theme === 'dark'
                    ? activeBtnClass
                    : 'text-token-secondary hover:text-token-primary'
                }`}
                title="Botanical Sanctuaria (Dark Pine Slate)"
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Pine Dark</span>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex-1 py-2 text-xs capitalize rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  settings.theme === 'light'
                    ? activeBtnClass
                    : 'text-token-secondary hover:text-token-primary'
                }`}
                title="Botanical Sanctuaria (Light Chalk)"
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Sanctuary Light</span>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ theme: 'system' })}
                className={`flex-1 py-2 text-xs capitalize rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  settings.theme === 'system'
                    ? activeBtnClass
                    : 'text-token-secondary hover:text-token-primary'
                }`}
                title="Auto-detect system theme"
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>System</span>
              </button>
            </div>
          </div>
        </div>

        {/* Demo reset button */}
        <div className="pt-4 border-t border-token flex items-center justify-between">
          <div className="text-xs text-token-muted">
            Reset to sample routine and curated mindful movement logs
          </div>
          <button
            type="button"
            onClick={resetAllData}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl btn-secondary-token flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'}`} />
            <span>Restore Demo Dataset</span>
          </button>
        </div>
      </div>

      {/* 6. Session Logs History List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-token-primary tracking-tight">
          Recent Training History ({sessionLogs.length})
        </h2>

        <div className="space-y-3">
          {sessionLogs.slice(0, 10).map((log) => {
            const exCount = log.exercises?.length || 0;
            const logSets = (log.exercises || []).reduce(
              (sum, ex) => sum + (ex.sets ? ex.sets.length : 0),
              0
            );

            return (
              <div
                key={log.id}
                className="card-token p-4 transition-all flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-token-primary">
                    {log.workoutDayName || log.routineName || 'Completed Workout'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-token-muted mt-0.5">
                    <span>{formatDisplayDate(log.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{exCount} Exercises</span>
                    <span aria-hidden="true">·</span>
                    <span>{logSets} Sets</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteSessionLog(log.id)}
                  aria-label="Delete session log"
                  className="p-2 rounded-xl text-token-muted hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
