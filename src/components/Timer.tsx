"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { useTimerStore, type ExerciseLap } from "../store/timerStore";
import { useWorkoutStore } from "../store/workoutStore";
import {
  Clock,
  Dumbbell,
  ListOrdered,
  Pause,
  Play,
  RotateCcw,
  Square,
  Trash2,
  Volume2,
  VolumeX,
  Wind,
} from "lucide-react";

const pad2 = (n: number) => String(n).padStart(2, "0");

const INNER_RADIUS = 88;
const OUTER_RADIUS = 110;
const INNER_CIRC = 2 * Math.PI * INNER_RADIUS;
const OUTER_CIRC = 2 * Math.PI * OUTER_RADIUS;

interface ClockSnapshot {
  loopMain: string; // MM:SS
  loopTenth: string; // .t
  total: string; // [HH:]MM:SS.t
  innerOffset: number;
  outerOffset: number;
}

/** Pure read of the timer store at a point in time. No React state involved. */
function readClock(now: number): ClockSnapshot {
  const s = useTimerStore.getState();
  const mainMs =
    s.mainAccumulatedMs +
    (s.isRunning && s.mainStartTimestamp ? now - s.mainStartTimestamp : 0);
  const loopMs =
    s.loopAccumulatedMs +
    (s.isRunning && s.loopStartTimestamp ? now - s.loopStartTimestamp : 0);

  const h = Math.floor(mainMs / 3600000);
  const m = Math.floor((mainMs % 3600000) / 60000);
  const sec = Math.floor((mainMs % 60000) / 1000);
  const t = Math.floor((mainMs % 1000) / 100);

  return {
    loopMain: `${pad2(Math.floor(loopMs / 60000))}:${pad2(Math.floor((loopMs % 60000) / 1000))}`,
    loopTenth: `.${Math.floor((loopMs % 1000) / 100)}`,
    total: `${h > 0 ? `${pad2(h)}:` : ""}${pad2(m)}:${pad2(sec)}.${t}`,
    innerOffset: INNER_CIRC - ((loopMs % 60000) / 60000) * INNER_CIRC,
    outerOffset: OUTER_CIRC - ((mainMs % 60000) / 60000) * OUTER_CIRC,
  };
}

/**
 * Box-breathing hint. Owns its own phase state so the 4s phase flips never
 * re-render the rest of the timer.
 */
const StatusLine = memo(function StatusLine({
  breathingMode,
  isLight,
}: {
  breathingMode: boolean;
  isLight: boolean;
}) {
  const isRunning = useTimerStore((s) => s.isRunning);
  const [phase, setPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Pause">(
    "Inhale",
  );

  useEffect(() => {
    if (!breathingMode) return;
    const id = setInterval(() => {
      setPhase((prev) =>
        prev === "Inhale"
          ? "Hold"
          : prev === "Hold"
            ? "Exhale"
            : prev === "Exhale"
              ? "Pause"
              : "Inhale",
      );
    }, 4000);
    return () => clearInterval(id);
  }, [breathingMode]);

  return breathingMode ? (
    <div
      className={`mt-2 flex items-center gap-1.5 text-xs font-semibold zen-breath-pulse ${
        isLight ? "text-[#c56d36]" : "text-[#d9c3a5]"
      }`}
    >
      <Wind className="h-3.5 w-3.5" />
      <span>Box Cadence: {phase} (4s)</span>
    </div>
  ) : (
    <span className="text-[11px] text-token-muted font-medium mt-1">
      {isRunning ? "Continuous movement stream" : "Ready to begin"}
    </span>
  );
});

/**
 * The ticking part of the timer. React renders this ONCE (and again only when
 * the theme flips). While running, a rAF loop writes straight to the DOM nodes
 * via refs and only touches them when the visible value actually changes
 * (10x/sec because of the tenths digit), so there are zero React re-renders per tick.
 */
const TimerDial = memo(function TimerDial({
  isLight,
  currentExerciseNumber,
  breathingMode,
}: {
  isLight: boolean;
  currentExerciseNumber: number;
  breathingMode: boolean;
}) {
  const loopMainRef = useRef<HTMLSpanElement>(null);
  const loopTenthRef = useRef<HTMLSpanElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  const innerArcRef = useRef<SVGCircleElement>(null);
  const outerArcRef = useRef<SVGCircleElement>(null);
  const isRunning = useTimerStore((s) => s.isRunning);

  // Snapshot used for the first paint only; later values are written via refs.
  const [initial] = useState(() => readClock(Date.now()));

  useEffect(() => {
    let raf = 0;
    let last = "";

    const paint = () => {
      const c = readClock(Date.now());
      // Cheap change detection: skip all DOM writes if nothing visible changed.
      const key = `${c.loopMain}${c.loopTenth}|${c.total}`;
      if (key === last) return;
      last = key;
      if (loopMainRef.current) loopMainRef.current.textContent = c.loopMain;
      if (loopTenthRef.current) loopTenthRef.current.textContent = c.loopTenth;
      if (totalRef.current) totalRef.current.textContent = c.total;
      innerArcRef.current?.setAttribute("stroke-dashoffset", String(c.innerOffset));
      outerArcRef.current?.setAttribute("stroke-dashoffset", String(c.outerOffset));
    };

    const loop = () => {
      paint();
      if (useTimerStore.getState().isRunning) raf = requestAnimationFrame(loop);
    };
    // Re-sync whenever the store changes (start/pause/lap/reset); the frame
    // loop only runs while the timer is actually running.
    const sync = () => {
      cancelAnimationFrame(raf);
      last = "";
      loop();
    };

    sync();
    const unsubscribe = useTimerStore.subscribe(sync);
    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center py-4 select-none">
      <svg
        className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 transform"
        viewBox="0 0 260 260"
      >
        <defs>
          <linearGradient id="innerLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            {isLight ? (
              <>
                <stop offset="0%" stopColor="#c56d36" />
                <stop offset="60%" stopColor="#466645" />
                <stop offset="100%" stopColor="#2d4c2d" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#d9c3a5" />
                <stop offset="60%" stopColor="#74a87c" />
                <stop offset="100%" stopColor="#9dd3a4" />
              </>
            )}
          </linearGradient>
          <filter id="zenGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer ring background (total workout) */}
        <circle
          cx="130"
          cy="130"
          r={OUTER_RADIUS}
          stroke={isLight ? "#ece8df" : "#161d19"}
          strokeWidth="6"
          fill="transparent"
        />
        {/* Outer ring active arc */}
        <circle
          ref={outerArcRef}
          cx="130"
          cy="130"
          r={OUTER_RADIUS}
          stroke={isLight ? "#1d1b18" : "#564730"}
          strokeWidth="6"
          strokeDasharray={OUTER_CIRC}
          strokeDashoffset={initial.outerOffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-300"
        />

        {/* Inner ring background (current exercise / set loop) */}
        <circle
          cx="130"
          cy="130"
          r={INNER_RADIUS}
          stroke={isLight ? "#f7f3ea" : "#1a211d"}
          strokeWidth="9"
          fill="transparent"
        />
        {/* Inner ring active arc */}
        <circle
          ref={innerArcRef}
          cx="130"
          cy="130"
          r={INNER_RADIUS}
          stroke="url(#innerLoopGrad)"
          strokeWidth="9"
          strokeDasharray={INNER_CIRC}
          strokeDashoffset={initial.innerOffset}
          strokeLinecap="round"
          fill="transparent"
          filter={isRunning && !isLight ? "url(#zenGlow)" : undefined}
          className="transition-all duration-300"
        />
      </svg>

      {/* Central timer information display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider mb-2 border ${
            isLight
              ? "bg-[#f1ede5] border-[#cdc5bc] text-[#1c1c16]"
              : "bg-[#161d19] border-[#74a87c]/30 text-[#9dd3a4]"
          }`}
        >
          <Dumbbell
            className={`h-3 w-3 ${isLight ? "text-[#c56d36]" : "text-[#d9c3a5]"}`}
          />
          <span>Exercise Loop #{currentExerciseNumber}</span>
        </div>

        {/* Big loop timer (MM:SS.s) */}
        <div className="flex items-baseline justify-center font-mono font-bold tracking-tight text-token-primary tabular-nums">
          <span ref={loopMainRef} className="text-5xl sm:text-6xl font-black">
            {initial.loopMain}
          </span>
          <span
            ref={loopTenthRef}
            className={`text-xl sm:text-2xl ml-1 font-bold ${
              isLight ? "text-[#466645]" : "text-[#9dd3a4]"
            }`}
          >
            {initial.loopTenth}
          </span>
        </div>

        <StatusLine breathingMode={breathingMode} isLight={isLight} />

        {/* Total elapsed workout footer inside the ring */}
        <div
          className={`mt-3 flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
            isLight
              ? "bg-[#ffffff] text-[#4b463f] border-[#cdc5bc]"
              : "bg-[#161d19]/80 text-token-secondary/80 border-token"
          }`}
        >
          <Clock
            className={`h-3 w-3 ${isLight ? "text-[#466645]" : "text-[#d9c3a5]"}`}
          />
          <span>
            Total: <span ref={totalRef}>{initial.total}</span>
          </span>
        </div>
      </div>
    </div>
  );
});

const LapHistory = memo(function LapHistory({
  laps,
  isLight,
  onClear,
}: {
  laps: ExerciseLap[];
  isLight: boolean;
  onClear: () => void;
}) {
  if (laps.length === 0) return null;
  return (
    <div className="w-full pt-6 border-t border-token space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-token-primary flex items-center gap-2">
          <ListOrdered
            className={`h-4 w-4 ${isLight ? "text-[#466645]" : "text-[#9dd3a4]"}`}
          />
          <span>Logged Exercise Loops ({laps.length})</span>
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] font-mono text-token-muted hover:text-[#ffb4ab] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="divide-y divide-token/40 max-h-48 overflow-y-auto rounded-2xl bg-surface-secondary/70 border border-token">
        {laps.map((lap) => (
          <div
            key={lap.id}
            className="flex items-center justify-between px-4 py-3 text-xs hover:bg-surface-tertiary/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`h-6 w-6 rounded-lg font-mono font-bold text-[11px] flex items-center justify-center border ${
                  isLight
                    ? "bg-[#c5eabf]/50 text-[#466645] border-[#466645]/30"
                    : "bg-[#74a87c]/15 text-[#9dd3a4] border-[#74a87c]/25"
                }`}
              >
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
            <span
              className={`font-mono font-bold text-sm tabular-nums ${
                isLight ? "text-[#c56d36]" : "text-[#d9c3a5]"
              }`}
            >
              {lap.formattedDuration}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export const Timer: React.FC = () => {
  // Narrow selectors: this component only re-renders when one of these
  // actually changes (start/pause/lap/reset), never on a clock tick.
  const isRunning = useTimerStore((s) => s.isRunning);
  const hasProgress = useTimerStore((s) => s.mainAccumulatedMs > 0);
  const currentExerciseNumber = useTimerStore((s) => s.currentExerciseNumber);
  const exerciseLaps = useTimerStore((s) => s.exerciseLaps);
  const soundEnabled = useTimerStore((s) => s.soundEnabled);
  const startTimer = useTimerStore((s) => s.startTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const loopExercise = useTimerStore((s) => s.loopExercise);
  const resetTimer = useTimerStore((s) => s.resetTimer);
  const toggleSound = useTimerStore((s) => s.toggleSound);
  const clearLaps = useTimerStore((s) => s.clearLaps);

  const theme = useWorkoutStore((s) => s.settings.theme);
  const isLight =
    theme === "light" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches);

  // Breathing mode has no UI toggle yet; kept so it can be wired up later.
  const [breathingMode] = useState<boolean>(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isLight ? "bg-[#466645]" : "bg-[#74a87c]"}`}
            />
            <span
              className={`text-[11px] font-mono tracking-widest uppercase ${
                isLight ? "text-[#466645]" : "text-[#9dd3a4]"
              }`}
            >
              Interval Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-token-primary tracking-tight mt-0.5 font-serif-editorial">
            Dual-Loop Timer
          </h1>
          <p className="text-xs text-token-muted mt-1">
            Continuous forward stopwatch. The second loop tracks individual sets
            without duration limits.
          </p>
        </div>

        {/* Audio feedback toggle */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundEnabled ? "Disable loop chime" : "Enable loop chime"}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            soundEnabled
              ? isLight
                ? "bg-[#c5eabf]/40 border-[#466645]/40 text-[#466645]"
                : "bg-[#74a87c]/15 border-[#74a87c]/30 text-[#9dd3a4]"
              : "bg-surface border-token text-token-muted hover:text-token-primary"
          }`}
          title={soundEnabled ? "Chime sound is enabled" : "Chime sound muted"}
        >
          {soundEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Main Dual-Loop Circular Dial Canvas */}
      <div className="card-token p-6 sm:p-10 space-y-8 border-token relative overflow-hidden flex flex-col items-center justify-center glow-sanctuary">
        {/* Soft background ambient glow */}
        <div
          className={`absolute inset-0 bg-radial pointer-events-none ${
            isLight
              ? "from-[#466645]/5 via-transparent to-transparent"
              : "from-[#74a87c]/8 via-transparent to-transparent"
          }`}
        />

        <TimerDial
          isLight={isLight}
          currentExerciseNumber={currentExerciseNumber}
          breathingMode={breathingMode}
        />

        {/* Tactile Control Buttons (Floored for gym accessibility, min 52px height) */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          {/* Loop / Next Exercise Trigger */}
          <button
            type="button"
            onClick={loopExercise}
            className={`w-full sm:w-auto min-h-[52px] px-6 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer ${
              isLight
                ? "bg-[#ffffff] hover:bg-[#f7f3ea] border border-[#1d1b18] text-[#1c1c16]"
                : "bg-[#d9c3a5]/15 hover:bg-[#d9c3a5]/25 border border-[#d9c3a5]/40 text-[#d9c3a5] backdrop-blur-md"
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
                  ? "bg-[#ba1a1a] hover:bg-[#93000a] text-white shadow-[#ba1a1a]/20"
                  : "bg-[#c47b62] hover:bg-[#b06a53] text-[#0e1511] shadow-[#c47b62]/20"
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
              <span>
                {hasProgress ? "Resume Flow" : "Start Flow"}
              </span>
            </button>
          )}

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

        <LapHistory laps={exerciseLaps} isLight={isLight} onClear={clearLaps} />
      </div>
    </div>
  );
};
