export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

export type Exercise = {
  id: string;
  name: string;
  gifUrl: string;
  bodyPart: string;
  equipment?: string;
  target?: string;
  secondaryMuscles?: string[];
  instructions?: string[];
  tips?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  mechanics?: 'compound' | 'isolation' | string;
  force?: 'push' | 'pull' | 'static' | string;
  category?: string;
};

export type PlannedExercise = {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetSets: number;
};

export type WorkoutDay = {
  weekday: Weekday;
  name: string;
  exercises: PlannedExercise[];
};

export type Routine = {
  id: string;
  name: string;
  daysPerWeek: number;
  days: WorkoutDay[];
  createdAt: string;
};

export type SetLog = {
  reps: number;
  weight: number;
  completed?: boolean;
};

export type ExerciseLog = {
  exerciseId: string;
  name?: string;
  bodyPart?: string;
  sets: SetLog[];
};

export type SessionLog = {
  id: string;
  routineId: string;
  date: string; // ISO date 'YYYY-MM-DD'
  routineName?: string;
  workoutDayName?: string;
  exercises: ExerciseLog[];
  completedAt?: string;
};

export type Settings = {
  weightUnit: 'kg' | 'lb';
  defaultLoopDuration: number; // in seconds
  theme: 'dark' | 'light' | 'system';
};

export type NotificationAction = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
};

export type TabSection = 'main' | 'workouts' | 'timer' | 'dashboard';
