import { computeStreak, getNextWorkout, getTodaysWorkout } from './schedule';
import { Routine, SessionLog, Weekday } from '../types/workout';

/**
 * Self-executing lightweight unit tests for pure scheduling functions.
 * Can be run in node or verified on startup.
 */
export function runScheduleTests(): { passed: boolean; results: string[] } {
  const results: string[] = [];
  let allPassed = true;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      results.push(`PASS: ${testName}`);
    } else {
      results.push(`FAIL: ${testName}`);
      allPassed = false;
      console.error(`Test assertion failed: ${testName}`);
    }
  }

  // Sample Routine: Mon (1), Wed (3), Fri (5)
  const mockRoutine: Routine = {
    id: 'routine-1',
    name: '3-Day Split',
    daysPerWeek: 3,
    createdAt: '2026-09-01T00:00:00.000Z',
    days: [
      {
        weekday: 1,
        name: 'Upper Body A',
        exercises: [{ exerciseId: 'ex1', name: 'Dumbbell Bench Press', gifUrl: '', targetSets: 3 }],
      },
      {
        weekday: 3,
        name: 'Lower Body & Core',
        exercises: [{ exerciseId: 'ex2', name: 'Goblet Squat', gifUrl: '', targetSets: 4 }],
      },
      {
        weekday: 5,
        name: 'Upper Body B',
        exercises: [{ exerciseId: 'ex3', name: 'Dumbbell Row', gifUrl: '', targetSets: 3 }],
      },
    ],
  };

  // Test 1: getTodaysWorkout on a Monday
  const mondayDate = new Date('2026-10-05T10:00:00'); // 2026-10-05 is a Monday (weekday 1)
  const todayWorkoutMon = getTodaysWorkout(mockRoutine, mondayDate);
  assert(todayWorkoutMon?.name === 'Upper Body A', 'getTodaysWorkout matches scheduled Monday');

  // Test 2: getTodaysWorkout on a Tuesday (rest day)
  const tuesdayDate = new Date('2026-10-06T10:00:00'); // Tuesday (weekday 2)
  const todayWorkoutTue = getTodaysWorkout(mockRoutine, tuesdayDate);
  assert(todayWorkoutTue === null, 'getTodaysWorkout returns null on unscheduled Tuesday');

  // Test 3: getNextWorkout on Tuesday -> should find Wednesday
  const nextFromTue = getNextWorkout(mockRoutine, tuesdayDate);
  assert(nextFromTue?.day.weekday === 3 && nextFromTue.daysAway === 1, 'getNextWorkout finds Wednesday from Tuesday');

  // Test 4: computeStreak with completed logs on Mon, Wed, Fri
  const sampleLogs: SessionLog[] = [
    {
      id: 'log-1',
      routineId: 'routine-1',
      date: '2026-10-05', // Mon
      exercises: [{ exerciseId: 'ex1', sets: [{ reps: 10, weight: 20 }] }],
    },
    {
      id: 'log-2',
      routineId: 'routine-1',
      date: '2026-10-02', // Fri
      exercises: [{ exerciseId: 'ex3', sets: [{ reps: 12, weight: 22 }] }],
    },
    {
      id: 'log-3',
      routineId: 'routine-1',
      date: '2026-09-30', // Wed
      exercises: [{ exerciseId: 'ex2', sets: [{ reps: 10, weight: 30 }] }],
    },
  ];

  // From Monday 2026-10-05 (which is logged), streak should be 3
  const streak = computeStreak(sampleLogs, mockRoutine, mondayDate);
  assert(streak === 3, `computeStreak correctly computes 3 consecutive scheduled workouts (got ${streak})`);

  return { passed: allPassed, results };
}
