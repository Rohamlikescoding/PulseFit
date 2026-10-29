import { Routine, SessionLog, Weekday, WorkoutDay } from '../types/workout';

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * Format Date to ISO string YYYY-MM-DD (local time)
 */
export function formatDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Human friendly date display
 */
export function formatDisplayDate(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(`${dateInput}T00:00:00`) : dateInput;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Returns today's scheduled workout day if it exists in the active routine.
 */
export function getTodaysWorkout(
  routine: Routine | null | undefined,
  date: Date = new Date()
): WorkoutDay | null {
  if (!routine || !routine.days || routine.days.length === 0) return null;
  const currentWeekday = date.getDay() as Weekday;
  return routine.days.find((d) => d.weekday === currentWeekday) ?? null;
}

/**
 * Returns the next scheduled workout day in the future (from tomorrow up to 7 days ahead)
 */
export function getNextWorkout(
  routine: Routine | null | undefined,
  date: Date = new Date()
): { day: WorkoutDay; date: Date; daysAway: number } | null {
  if (!routine || !routine.days || routine.days.length === 0) return null;

  const currentWeekday = date.getDay() as Weekday;
  for (let offset = 1; offset <= 7; offset++) {
    const targetWeekday = ((currentWeekday + offset) % 7) as Weekday;
    const match = routine.days.find((d) => d.weekday === targetWeekday);
    if (match) {
      const targetDate = new Date(date);
      targetDate.setDate(date.getDate() + offset);
      return {
        day: match,
        date: targetDate,
        daysAway: offset,
      };
    }
  }

  return null;
}

/**
 * Computes consecutive scheduled workout days completed.
 * If today is a scheduled workout day and not yet completed, it does not break the streak.
 * If completed, it counts. Then evaluates prior scheduled workout dates consecutively.
 */
export function computeStreak(
  sessionLogs: SessionLog[] = [],
  routine: Routine | null | undefined,
  referenceDate: Date = new Date()
): number {
  if (!sessionLogs || sessionLogs.length === 0) return 0;

  // Set of completed date strings YYYY-MM-DD
  const completedDateStrings = new Set(
    sessionLogs.filter((log) => log.exercises && log.exercises.length > 0).map((log) => log.date)
  );

  // If no routine is active, compute consecutive days or workout entries
  if (!routine || !routine.days || routine.days.length === 0) {
    let streak = 0;
    const checkDate = new Date(referenceDate);
    const todayIso = formatDateIso(checkDate);

    // If today is logged, count it
    if (completedDateStrings.has(todayIso)) {
      streak++;
    }
    // Check backwards day by day
    for (let i = 1; i <= 365; i++) {
      const prevDate = new Date(referenceDate);
      prevDate.setDate(referenceDate.getDate() - i);
      const iso = formatDateIso(prevDate);
      if (completedDateStrings.has(iso)) {
        streak++;
      } else {
        // If today was not logged, but yesterday was, we allow yesterday to continue the streak
        if (i === 1 && !completedDateStrings.has(todayIso)) {
          continue; // keep checking backwards
        }
        break;
      }
    }
    return streak;
  }

  const scheduledWeekdays = new Set<Weekday>(routine.days.map((d) => d.weekday));
  if (scheduledWeekdays.size === 0) return 0;

  let streak = 0;
  const todayIso = formatDateIso(referenceDate);
  const todayWeekday = referenceDate.getDay() as Weekday;
  const isScheduledToday = scheduledWeekdays.has(todayWeekday);

  if (isScheduledToday && completedDateStrings.has(todayIso)) {
    streak++;
  }

  // Iterate backwards day by day to evaluate each scheduled workout day
  const maxLookbackDays = 180;
  for (let offset = 1; offset <= maxLookbackDays; offset++) {
    const pastDate = new Date(referenceDate);
    pastDate.setDate(referenceDate.getDate() - offset);
    const pastWeekday = pastDate.getDay() as Weekday;

    if (scheduledWeekdays.has(pastWeekday)) {
      const pastIso = formatDateIso(pastDate);
      if (completedDateStrings.has(pastIso)) {
        streak++;
      } else {
        // Streak broken at this scheduled day
        break;
      }
    }
  }

  return streak;
}
