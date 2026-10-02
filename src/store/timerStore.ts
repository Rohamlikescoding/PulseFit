import { create } from 'zustand';

// Web Audio API beep synthesizer for exercise loop transitions
function playLoopChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Two pleasant ascending chimes (D5 -> A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.debug('Audio chime prevented:', err);
  }
}

export interface ExerciseLap {
  id: string;
  lapNumber: number;
  durationMs: number;
  formattedDuration: string;
  timestamp: string;
}

interface TimerStoreState {
  // Global Running State
  isRunning: boolean;

  // 1. Overall Workout Timer (counts up)
  mainStartTimestamp: number | null;
  mainAccumulatedMs: number;

  // 2. Exercise Loop Timer ("Second timer", counts up, NO reverse clock, NO duration limit)
  loopStartTimestamp: number | null;
  loopAccumulatedMs: number;
  currentExerciseNumber: number;
  exerciseLaps: ExerciseLap[];

  // Sound chime on loop
  soundEnabled: boolean;

  // Actions
  startTimer: () => void;
  stopTimer: () => void;
  loopExercise: () => void; // Loops to next exercise: resets second timer to 0, overall timer keeps running
  resetTimer: () => void;
  toggleSound: () => void;
  clearLaps: () => void;
}

function formatLapTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

export const useTimerStore = create<TimerStoreState>((set, get) => ({
  isRunning: false,
  mainStartTimestamp: null,
  mainAccumulatedMs: 0,

  loopStartTimestamp: null,
  loopAccumulatedMs: 0,
  currentExerciseNumber: 1,
  exerciseLaps: [],

  soundEnabled: true,

  // Start Timer: starts both Overall timer and the Exercise Loop timer simultaneously
  startTimer: () => {
    const now = Date.now();
    set((state) => ({
      isRunning: true,
      mainStartTimestamp: state.mainStartTimestamp ?? now,
      loopStartTimestamp: state.loopStartTimestamp ?? now,
    }));
  },

  // Stop Timer: separate stop button to pause all timers
  stopTimer: () => {
    const now = Date.now();
    set((state) => {
      if (!state.isRunning) return state;
      const addedMain = state.mainStartTimestamp ? now - state.mainStartTimestamp : 0;
      const addedLoop = state.loopStartTimestamp ? now - state.loopStartTimestamp : 0;
      return {
        isRunning: false,
        mainStartTimestamp: null,
        mainAccumulatedMs: state.mainAccumulatedMs + addedMain,
        loopStartTimestamp: null,
        loopAccumulatedMs: state.loopAccumulatedMs + addedLoop,
      };
    });
  },

  // Loop Exercise: Resets the second timer back to 00:00 for the next exercise,
  // while the overall workout timer continues running without interruption!
  loopExercise: () => {
    const state = get();
    const now = Date.now();

    // Calculate elapsed time for the exercise being completed
    const currentLoopElapsed =
      state.loopAccumulatedMs +
      (state.isRunning && state.loopStartTimestamp ? now - state.loopStartTimestamp : 0);

    if (state.soundEnabled) {
      playLoopChime();
    }

    const newLap: ExerciseLap = {
      id: `${Date.now()}-${state.currentExerciseNumber}`,
      lapNumber: state.currentExerciseNumber,
      durationMs: currentLoopElapsed,
      formattedDuration: formatLapTime(currentLoopElapsed),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    set({
      loopStartTimestamp: state.isRunning ? now : null,
      loopAccumulatedMs: 0,
      currentExerciseNumber: state.currentExerciseNumber + 1,
      exerciseLaps: [newLap, ...state.exerciseLaps],
    });
  },

  // Reset Both Timers
  resetTimer: () => {
    set({
      isRunning: false,
      mainStartTimestamp: null,
      mainAccumulatedMs: 0,
      loopStartTimestamp: null,
      loopAccumulatedMs: 0,
      currentExerciseNumber: 1,
      exerciseLaps: [],
    });
  },

  toggleSound: () => {
    set((state) => ({ soundEnabled: !state.soundEnabled }));
  },

  clearLaps: () => {
    set({ exerciseLaps: [] });
  },
}));
