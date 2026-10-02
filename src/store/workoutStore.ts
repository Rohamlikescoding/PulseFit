import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS, INITIAL_ROUTINE, generateInitialSessionLogs } from '../data/seedData';
import { formatDateIso } from '../lib/schedule';
import { appStorage } from '../lib/storage';
import { ExerciseLog, Routine, SessionLog, Settings, Weekday } from '../types/workout';

export interface ActiveSessionState {
  routineId: string;
  weekday: Weekday;
  dayName: string;
  startedAt: string;
  exercises: ExerciseLog[];
}

interface WorkoutStoreState {
  routines: Routine[];
  activeRoutineId: string | null;
  sessionLogs: SessionLog[];
  settings: Settings;
  dismissedNotificationDates: string[];
  activeSession: ActiveSessionState | null;
  isHydrated: boolean;

  // Actions
  addRoutine: (routineData: Omit<Routine, 'id' | 'createdAt'>) => string;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  setActiveRoutineId: (id: string | null) => void;

  saveSessionLog: (logData: Omit<SessionLog, 'id'>) => string;
  deleteSessionLog: (id: string) => void;

  updateSettings: (settingsUpdate: Partial<Settings>) => void;
  dismissNotificationForDate: (dateIso: string) => void;

  // Live Workout Session Tracking
  startSession: (routineId: string, weekday: Weekday) => void;
  updateSessionSet: (
    exerciseIndex: number,
    setIndex: number,
    reps: number,
    weight: number
  ) => void;
  toggleSessionSetCompletion: (exerciseIndex: number, setIndex: number) => void;
  addSetToSessionExercise: (exerciseIndex: number) => void;
  removeSetFromSessionExercise: (exerciseIndex: number, setIndex: number) => void;
  finishActiveSession: () => SessionLog | null;
  cancelActiveSession: () => void;

  // System
  resetAllData: () => void;
}

export const useWorkoutStore = create<WorkoutStoreState>()(
  persist(
    (set, get) => ({
      routines: [INITIAL_ROUTINE],
      activeRoutineId: INITIAL_ROUTINE.id,
      sessionLogs: generateInitialSessionLogs(),
      settings: DEFAULT_SETTINGS,
      dismissedNotificationDates: [],
      activeSession: null,
      isHydrated: false,

      addRoutine: (routineData) => {
        const id = `routine-${Date.now()}`;
        const newRoutine: Routine = {
          ...routineData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          routines: [...state.routines, newRoutine],
          activeRoutineId: state.activeRoutineId ? state.activeRoutineId : id,
        }));
        return id;
      },

      updateRoutine: (id, updates) => {
        set((state) => ({
          routines: state.routines.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },

      deleteRoutine: (id) => {
        set((state) => {
          const nextRoutines = state.routines.filter((r) => r.id !== id);
          return {
            routines: nextRoutines,
            activeRoutineId:
              state.activeRoutineId === id
                ? nextRoutines[0]?.id || null
                : state.activeRoutineId,
          };
        });
      },

      setActiveRoutineId: (id) => {
        set({ activeRoutineId: id });
      },

      saveSessionLog: (logData) => {
        const id = `session-${Date.now()}`;
        const newLog: SessionLog = {
          ...logData,
          id,
          completedAt: logData.completedAt || new Date().toISOString(),
        };
        set((state) => ({
          sessionLogs: [newLog, ...state.sessionLogs],
        }));
        return id;
      },

      deleteSessionLog: (id) => {
        set((state) => ({
          sessionLogs: state.sessionLogs.filter((log) => log.id !== id),
        }));
      },

      updateSettings: (settingsUpdate) => {
        set((state) => ({
          settings: { ...state.settings, ...settingsUpdate },
        }));
      },

      dismissNotificationForDate: (dateIso) => {
        set((state) => ({
          dismissedNotificationDates: state.dismissedNotificationDates.includes(dateIso)
            ? state.dismissedNotificationDates
            : [...state.dismissedNotificationDates, dateIso],
        }));
      },

      startSession: (routineId, weekday) => {
        const state = get();
        const routine = state.routines.find((r) => r.id === routineId);
        if (!routine) return;

        const dayConfig = routine.days.find((d) => d.weekday === weekday);
        if (!dayConfig) return;

        const initialExercises: ExerciseLog[] = dayConfig.exercises.map((planned) => ({
          exerciseId: planned.exerciseId,
          name: planned.name,
          sets: Array.from({ length: Math.max(1, planned.targetSets) }).map(() => ({
            reps: 10,
            weight: 12,
          })),
        }));

        set({
          activeSession: {
            routineId,
            weekday,
            dayName: dayConfig.name,
            startedAt: new Date().toISOString(),
            exercises: initialExercises,
          },
        });
      },

      updateSessionSet: (exerciseIndex, setIndex, reps, weight) => {
        set((state) => {
          if (!state.activeSession) return state;
          const nextExercises = [...state.activeSession.exercises];
          const targetEx = nextExercises[exerciseIndex];
          if (!targetEx) return state;

          const nextSets = [...targetEx.sets];
          nextSets[setIndex] = {
            reps: Math.max(0, reps),
            weight: Math.max(0, weight),
          };

          nextExercises[exerciseIndex] = {
            ...targetEx,
            sets: nextSets,
          };

          return {
            activeSession: {
              ...state.activeSession,
              exercises: nextExercises,
            },
          };
        });
      },

      toggleSessionSetCompletion: (exerciseIndex, setIndex) => {
        set((state) => {
          if (!state.activeSession) return state;
          const nextExercises = [...state.activeSession.exercises];
          const targetEx = nextExercises[exerciseIndex];
          if (!targetEx) return state;

          const nextSets = [...targetEx.sets];
          const currentSet = nextSets[setIndex];
          if (!currentSet) return state;

          nextSets[setIndex] = {
            ...currentSet,
            completed: !currentSet.completed,
          };

          nextExercises[exerciseIndex] = {
            ...targetEx,
            sets: nextSets,
          };

          return {
            activeSession: {
              ...state.activeSession,
              exercises: nextExercises,
            },
          };
        });
      },

      addSetToSessionExercise: (exerciseIndex) => {
        set((state) => {
          if (!state.activeSession) return state;
          const nextExercises = [...state.activeSession.exercises];
          const targetEx = nextExercises[exerciseIndex];
          if (!targetEx) return state;

          const lastSet = targetEx.sets[targetEx.sets.length - 1];
          const newSet = lastSet ? { ...lastSet } : { reps: 10, weight: 12 };

          nextExercises[exerciseIndex] = {
            ...targetEx,
            sets: [...targetEx.sets, newSet],
          };

          return {
            activeSession: {
              ...state.activeSession,
              exercises: nextExercises,
            },
          };
        });
      },

      removeSetFromSessionExercise: (exerciseIndex, setIndex) => {
        set((state) => {
          if (!state.activeSession) return state;
          const nextExercises = [...state.activeSession.exercises];
          const targetEx = nextExercises[exerciseIndex];
          if (!targetEx || targetEx.sets.length <= 1) return state;

          nextExercises[exerciseIndex] = {
            ...targetEx,
            sets: targetEx.sets.filter((_, idx) => idx !== setIndex),
          };

          return {
            activeSession: {
              ...state.activeSession,
              exercises: nextExercises,
            },
          };
        });
      },

      finishActiveSession: () => {
        const state = get();
        const session = state.activeSession;
        if (!session) return null;

        const routine = state.routines.find((r) => r.id === session.routineId);
        const todayIso = formatDateIso(new Date());

        const newLog: SessionLog = {
          id: `session-${Date.now()}`,
          routineId: session.routineId,
          routineName: routine?.name || 'Workout',
          workoutDayName: session.dayName,
          date: todayIso,
          completedAt: new Date().toISOString(),
          exercises: session.exercises,
        };

        set((s) => ({
          sessionLogs: [newLog, ...s.sessionLogs],
          activeSession: null,
        }));

        return newLog;
      },

      cancelActiveSession: () => {
        set({ activeSession: null });
      },

      resetAllData: () => {
        set({
          routines: [INITIAL_ROUTINE],
          activeRoutineId: INITIAL_ROUTINE.id,
          sessionLogs: generateInitialSessionLogs(),
          settings: DEFAULT_SETTINGS,
          dismissedNotificationDates: [],
          activeSession: null,
        });
      },
    }),
    {
      name: 'apexfit-storage',
      storage: createJSONStorage(() => appStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);
