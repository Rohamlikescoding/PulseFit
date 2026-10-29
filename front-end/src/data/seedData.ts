import { formatDateIso } from '../lib/schedule';
import { Routine, SessionLog, Settings } from '../types/workout';

export const DEFAULT_SETTINGS: Settings = {
  weightUnit: 'kg',
  defaultLoopDuration: 60,
  theme: 'dark',
};

export const INITIAL_ROUTINE: Routine = {
  id: 'routine-hypertrophy-split',
  name: '4-Day Strength & Hypertrophy',
  daysPerWeek: 4,
  createdAt: '2026-08-01T08:00:00.000Z',
  days: [
    {
      weekday: 1, // Monday
      name: 'Upper Body Power (Chest & Back)',
      exercises: [
        {
          exerciseId: 'db-bench-press',
          name: 'Dumbbell Bench Press',
          gifUrl: '/api/exercises/animation?id=db-bench-press',
          targetSets: 4,
        },
        {
          exerciseId: 'db-bent-over-row',
          name: 'Bent-Over Dumbbell Row',
          gifUrl: '/api/exercises/animation?id=db-bent-over-row',
          targetSets: 4,
        },
        {
          exerciseId: 'db-overhead-press',
          name: 'Seated Dumbbell Shoulder Press',
          gifUrl: '/api/exercises/animation?id=db-overhead-press',
          targetSets: 3,
        },
        {
          exerciseId: 'db-bicep-curl',
          name: 'Dumbbell Bicep Curl',
          gifUrl: '/api/exercises/animation?id=db-bicep-curl',
          targetSets: 3,
        },
      ],
    },
    {
      weekday: 2, // Tuesday
      name: 'Lower Body & Core',
      exercises: [
        {
          exerciseId: 'db-goblet-squat',
          name: 'Goblet Squat',
          gifUrl: '/api/exercises/animation?id=db-goblet-squat',
          targetSets: 4,
        },
        {
          exerciseId: 'db-romanian-deadlift',
          name: 'Dumbbell Romanian Deadlift',
          gifUrl: '/api/exercises/animation?id=db-romanian-deadlift',
          targetSets: 4,
        },
        {
          exerciseId: 'db-walking-lunge',
          name: 'Dumbbell Walking Lunge',
          gifUrl: '/api/exercises/animation?id=db-walking-lunge',
          targetSets: 3,
        },
        {
          exerciseId: 'db-russian-twist',
          name: 'Weighted Russian Twist',
          gifUrl: '/api/exercises/animation?id=db-russian-twist',
          targetSets: 3,
        },
      ],
    },
    {
      weekday: 4, // Thursday
      name: 'Push & Shoulders Hypertrophy',
      exercises: [
        {
          exerciseId: 'db-incline-bench-press',
          name: 'Incline Dumbbell Press',
          gifUrl: '/api/exercises/animation?id=db-incline-bench-press',
          targetSets: 4,
        },
        {
          exerciseId: 'db-lateral-raise',
          name: 'Dumbbell Lateral Raise',
          gifUrl: '/api/exercises/animation?id=db-lateral-raise',
          targetSets: 4,
        },
        {
          exerciseId: 'db-tricep-overhead-extension',
          name: 'Overhead Tricep Extension',
          gifUrl: '/api/exercises/animation?id=db-overhead-press',
          targetSets: 3,
        },
      ],
    },
    {
      weekday: 5, // Friday
      name: 'Pull & Posterior Chain',
      exercises: [
        {
          exerciseId: 'db-single-arm-row',
          name: 'Single-Arm Dumbbell Row',
          gifUrl: '/api/exercises/animation?id=db-single-arm-row',
          targetSets: 4,
        },
        {
          exerciseId: 'db-bulgarian-split-squat',
          name: 'Bulgarian Split Squat',
          gifUrl: '/api/exercises/animation?id=db-goblet-squat',
          targetSets: 3,
        },
        {
          exerciseId: 'db-hammer-curl',
          name: 'Dumbbell Hammer Curl',
          gifUrl: '/api/exercises/animation?id=db-hammer-curl',
          targetSets: 3,
        },
      ],
    },
  ],
};

/**
 * Generate initial realistic historical session logs for the past 60 days
 * so heatmaps, charts, and streaks look lively and authentic immediately.
 */
export function generateInitialSessionLogs(): SessionLog[] {
  const logs: SessionLog[] = [];
  const baseDate = new Date(); // relative to today
  const routine = INITIAL_ROUTINE;

  // Let's create logs for the past 8 weeks on scheduled days (Mon 1, Tue 2, Thu 4, Fri 5)
  for (let daysAgo = 56; daysAgo >= 1; daysAgo--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - daysAgo);
    const weekday = d.getDay();

    const matchingDay = routine.days.find((day) => day.weekday === weekday);
    if (!matchingDay) continue;

    // Simulate progressive overload weight over weeks
    const weekFactor = Math.floor((56 - daysAgo) / 7);
    const dateStr = formatDateIso(d);

    logs.push({
      id: `seed-log-${dateStr}`,
      routineId: routine.id,
      routineName: routine.name,
      workoutDayName: matchingDay.name,
      date: dateStr,
      completedAt: `${dateStr}T17:45:00.000Z`,
      exercises: matchingDay.exercises.map((ex) => {
        let baseWeight = 16;
        if (ex.exerciseId.includes('squat') || ex.exerciseId.includes('deadlift')) baseWeight = 24;
        if (ex.exerciseId.includes('raise') || ex.exerciseId.includes('curl')) baseWeight = 10;
        const currentWeight = baseWeight + Math.min(weekFactor * 1.5, 8);

        return {
          exerciseId: ex.exerciseId,
          name: ex.name,
          sets: Array.from({ length: ex.targetSets }).map((_, sIdx) => ({
            reps: 10 + (sIdx % 2 === 0 ? 2 : 0),
            weight: currentWeight,
          })),
        };
      }),
    });
  }

  return logs;
}
