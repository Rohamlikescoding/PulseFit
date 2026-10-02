import React, { useEffect, useState } from 'react';
import { useTimerStore } from '../store/timerStore';
import { useWorkoutStore } from '../store/workoutStore';
import {
  Clock,
  Dumbbell,
  Heart,
  ListOrdered,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';

export const Timer: React.FC = () => {
  const {
    isRunning,
    mainStartTimestamp,
    mainAccumulatedMs,
    loopStartTimestamp,
    loopAccumulatedMs,
    currentExerciseNumber,
    exerciseLaps,
    soundEnabled,
    startTimer,
    stopTimer,
    loopExercise,
    resetTimer,
    toggleSound,
    clearLaps,
  } = useTimerStore();

  const { settings } = useWorkoutStore();
  const isLight =
    settings.theme === 'light' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches);

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [breathingMode, setBreathingMode] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');

  // High-frequency animation frame loop for precision timing
  useEffect(() => {
    let animId: number;
    const update = () => {
      setCurrentTime(Date.now());
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  // 1. Overall Workout Elapsed Time (Counts Up)
  const totalMainElapsedMs =
    mainAccumulatedMs +
    (isRunning && mainStartTimestamp ? currentTime - mainStartTimestamp : 0);

  const mainHours = Math.floor(totalMainElapsedMs / 3600000);
  const mainMinutes = Math.floor((totalMainElapsedMs % 3600000) / 60000);
  const mainSeconds = Math.floor((totalMainElapsedMs % 60000) / 1000);
  const mainTenths = Math.floor((totalMainElapsedMs % 1000) / 100);

  // 2. Exercise Loop Timer ("Second Timer", Counts Up, NO limit, NO reverse clock)
  const totalLoopElapsedMs =
    loopAccumulatedMs +
    (isRunning && loopStartTimestamp ? currentTime - loopStartTimestamp : 0);

  const loopMinutes = Math.floor(totalLoopElapsedMs / 60000);
  const loopSeconds = Math.floor((totalLoopElapsedMs % 60000) / 1000);
  const loopTenths = Math.floor((totalLoopElapsedMs % 1000) / 100);

  // Circular ring calculations:
  // Inner ring: 60-second revolution loop for exercise cadence
  const innerCycleSeconds = (totalLoopElapsedMs % 60000) / 1000;
  const innerProgress = (innerCycleSeconds / 60) * 100;
  const innerRadius = 88;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerOffset = innerCircumference - (innerProgress / 100) * innerCircumference;

  // Outer ring: Continuous session flow indicator
  const outerCycleSeconds = (totalMainElapsedMs % 60000) / 1000;
  const outerProgress = (outerCycleSeconds / 60) * 100;
  const outerRadius = 110;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerOffset = outerCircumference - (outerProgress / 100) * outerCircumference;

  // Zen 4-4-4-4 Box Breathing cycle when breathing mode is engaged
  useEffect(() => {
    if (!breathingMode) return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        if (prev === 'Exhale') return 'Pause';
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [breathingMode]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isLight ? 'bg-[#466645]' : 'bg-[#74a87c]'}`} />
            <span className={`text-[11px] font-mono tracking-widest uppercase ${
              isLight ? 'text-[#466645]' : 'text-[#9dd3a4]'
            }`}>
              Botanical Sanctuary · Interval Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-token-primary tracking-tight mt-0.5 font-serif-editorial">
            Zen Flow & Dual-Loop Timer
          </h1>
          <p className="text-xs text-token-muted mt-1">
            Continuous forward stopwatch. The second loop tracks individual sets without duration limits.
          </p>
        </div>

        {/* Audio feedback toggle */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundEnabled ? 'Disable loop chime' : 'Enable loop chime'}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            soundEnabled
              ? isLight
                ? 'bg-[#c5eabf]/40 border-[#466645]/40 text-[#466645]'
                : 'bg-[#74a87c]/15 border-[#74a87c]/30 text-[#9dd3a4]'
              : 'bg-surface border-token text-token-muted hover:text-token-primary'
          }`}
          title={soundEnabled ? 'Chime sound is enabled' : 'Chime sound muted'}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      </div>

      {/* Main Dual-Loop Circular Dial Canvas */}
      <div className="card-token p-6 sm:p-10 space-y-8 border-token relative overflow-hidden flex flex-col items-center justify-center glow-sanctuary">
        {/* Soft background ambient glow */}
        <div className={`absolute inset-0 bg-radial pointer-events-none ${
          isLight ? 'from-[#466645]/5 via-transparent to-transparent' : 'from-[#74a87c]/8 via-transparent to-transparent'
        }`} />

        {/* Dual Ring Visual Dial */}
        <div className="relative flex items-center justify-center py-4 select-none">
          <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 transform" viewBox="0 0 260 260">
            <defs>
              {isLight ? (
                <>
                  <linearGradient id="innerLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c56d36" />
                    <stop offset="60%" stopColor="#466645" />
                    <stop offset="100%" stopColor="#2d4c2d" />
                  </linearGradient>
                </>
              ) : (
                <>
                  <linearGradient id="innerLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d9c3a5" />
                    <stop offset="60%" stopColor="#74a87c" />
                    <stop offset="100%" stopColor="#9dd3a4" />
                  </linearGradient>
                </>
              )}
              <filter id="zenGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Ring Background (Total Workout) */}
            <circle
              cx="130"
              cy="130"
              r={outerRadius}
              stroke={isLight ? '#ece8df' : '#161d19'}
              strokeWidth="6"
              fill="transparent"
            />

            {/* Outer Ring Active Arc */}
            <circle
              cx="130"
              cy="130"
              r={outerRadius}
              stroke={isLight ? '#1d1b18' : '#564730'}
              strokeWidth="6"
              strokeDasharray={outerCircumference}
              strokeDashoffset={outerOffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300"
            />

            {/* Inner Ring Background (Current Exercise / Set Loop) */}
            <circle
              cx="130"
              cy="130"
              r={innerRadius}
              stroke={isLight ? '#f7f3ea' : '#1a211d'}
              strokeWidth="9"
              fill="transparent"
            />

            {/* Inner Ring Active Arc */}
            <circle
              cx="130"
              cy="130"
              r={innerRadius}
              stroke="url(#innerLoopGrad)"
              strokeWidth="9"
              strokeDasharray={innerCircumference}
              strokeDashoffset={innerOffset}
              strokeLinecap="round"
              fill="transparent"
              filter={isRunning && !isLight ? 'url(#zenGlow)' : undefined}
              className="transition-all duration-300"
            />
          </svg>

          {/* Central Timer Information Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            {/* Loop Indicator Tag */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider mb-2 border ${
              isLight
                ? 'bg-[#f1ede5] border-[#cdc5bc] text-[#1c1c16]'
                : 'bg-[#161d19] border-[#74a87c]/30 text-[#9dd3a4]'
            }`}>
              <Dumbbell className={`h-3 w-3 ${isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'}`} />
              <span>Exercise Loop #{currentExerciseNumber}</span>
            </div>

            {/* Big Obvious Loop Timer (MM:SS.s) */}
            <div className="flex items-baseline justify-center font-mono font-bold tracking-tight text-token-primary tabular-nums">
              <span className="text-5xl sm:text-6xl font-black">
                {String(loopMinutes).padStart(2, '0')}:{String(loopSeconds).padStart(2, '0')}
              </span>
              <span className={`text-xl sm:text-2xl ml-1 font-bold ${
                isLight ? 'text-[#466645]' : 'text-[#9dd3a4]'
              }`}>
                .{loopTenths}
              </span>
            </div>

            {/* Zen State / Breathing Prompt */}
            {breathingMode ? (
              <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold zen-breath-pulse ${
                isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'
              }`}>
                <Wind className="h-3.5 w-3.5" />
                <span>Box Cadence: {breathPhase} (4s)</span>
              </div>
            ) : (
              <span className="text-[11px] text-token-muted font-medium mt-1">
                {isRunning ? 'Continuous movement stream' : 'Ready to begin'}
              </span>
            )}

            {/* Small Total Elapsed Workout Footer inside Ring */}
            <div className={`mt-3 flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
              isLight
                ? 'bg-[#ffffff] text-[#4b463f] border-[#cdc5bc]'
                : 'bg-[#161d19]/80 text-token-secondary/80 border-token'
            }`}>
              <Clock className={`h-3 w-3 ${isLight ? 'text-[#466645]' : 'text-[#d9c3a5]'}`} />
              <span>
                Total:{' '}
                {mainHours > 0 && `${String(mainHours).padStart(2, '0')}:`}
                {String(mainMinutes).padStart(2, '0')}:{String(mainSeconds).padStart(2, '0')}.{mainTenths}
              </span>
            </div>
          </div>
        </div>

        {/* Tactile Control Buttons (Floored for gym accessibility, min 52px height) */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          {/* Loop / Next Exercise Trigger */}
          <button
            type="button"
            onClick={loopExercise}
            className={`w-full sm:w-auto min-h-[52px] px-6 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer ${
              isLight
                ? 'bg-[#ffffff] hover:bg-[#f7f3ea] border border-[#1d1b18] text-[#1c1c16]'
                : 'bg-[#d9c3a5]/15 hover:bg-[#d9c3a5]/25 border border-[#d9c3a5]/40 text-[#d9c3a5] backdrop-blur-md'
            }`}
            title="Complete current exercise and start next loop at 00:00"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Next Exercise / Loop</span>
          </button>

          {/* Primary Play / Pause Button */}
          {isRunning ? (
            <button
              type="button"
              onClick={stopTimer}
              className={`w-full sm:w-auto min-h-[52px] px-8 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.98] cursor-pointer ${
                isLight
                  ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white shadow-[#ba1a1a]/20'
                  : 'bg-[#c47b62] hover:bg-[#b06a53] text-[#0e1511] shadow-[#c47b62]/20'
              }`}
            >
              <Pause className="h-4 w-4 fill-current" />
              <span>Pause Timer</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startTimer}
              className="w-full sm:w-auto min-h-[52px] px-8 rounded-2xl btn-primary-token text-sm flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{totalMainElapsedMs > 0 ? 'Resume Flow' : 'Start Flow'}</span>
            </button>
          )}

          {/* Breathing Pacer Mode Trigger */}
          <button
            type="button"
            onClick={() => setBreathingMode((prev) => !prev)}
            className={`w-full sm:w-auto min-h-[52px] px-5 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
              breathingMode
                ? isLight
                  ? 'bg-[#c5eabf]/50 border-[#466645] text-[#466645]'
                  : 'bg-[#74a87c]/20 border-[#74a87c] text-[#9dd3a4]'
                : 'bg-surface-secondary border-token text-token-secondary hover:text-token-primary'
            }`}
            title="Toggle restorative box breathing interval pacer"
          >
            <Wind className={`h-4 w-4 ${breathingMode ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            <span>{breathingMode ? 'Pacer Active' : 'Rest Pacer'}</span>
          </button>

          {/* Reset All */}
          <button
            type="button"
            onClick={resetTimer}
            className="w-full sm:w-auto min-h-[52px] px-4 rounded-2xl btn-secondary-token text-xs flex items-center justify-center gap-1.5 cursor-pointer text-token-muted hover:text-token-primary"
            title="Reset both timers to zero"
          >
            <Square className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Exercise Loop History Log */}
        {exerciseLaps.length > 0 && (
          <div className="w-full pt-6 border-t border-token space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-token-primary flex items-center gap-2">
                <ListOrdered className={`h-4 w-4 ${isLight ? 'text-[#466645]' : 'text-[#9dd3a4]'}`} />
                <span>Logged Exercise Loops ({exerciseLaps.length})</span>
              </span>
              <button
                type="button"
                onClick={clearLaps}
                className="text-[11px] font-mono text-token-muted hover:text-[#ffb4ab] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear History</span>
              </button>
            </div>

            <div className="divide-y divide-token/40 max-h-48 overflow-y-auto rounded-2xl bg-surface-secondary/70 border border-token">
              {exerciseLaps.map((lap) => (
                <div
                  key={lap.id}
                  className="flex items-center justify-between px-4 py-3 text-xs hover:bg-surface-tertiary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-6 w-6 rounded-lg font-mono font-bold text-[11px] flex items-center justify-center border ${
                      isLight
                        ? 'bg-[#c5eabf]/50 text-[#466645] border-[#466645]/30'
                        : 'bg-[#74a87c]/15 text-[#9dd3a4] border-[#74a87c]/25'
                    }`}>
                      #{lap.lapNumber}
                    </span>
                    <div>
                      <span className="font-semibold text-token-primary block">
                        Exercise #{lap.lapNumber}
                      </span>
                      <span className="text-[10px] text-token-muted font-mono">
                        Logged at {lap.timestamp}
                      </span>
                    </div>
                  </div>

                  <span className={`font-mono font-bold text-sm tabular-nums ${
                    isLight ? 'text-[#c56d36]' : 'text-[#d9c3a5]'
                  }`}>
                    {lap.formattedDuration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
