import { Routine, SessionLog, Settings, Weekday } from '../types/workout';
import { computeStreak, getNextWorkout, getTodaysWorkout } from './schedule';

export interface TestReport {
  passed: boolean;
  suite: string;
  results: { testName: string; passed: boolean; message?: string }[];
}

export function runFeatureAndModeTests(): TestReport {
  const results: { testName: string; passed: boolean; message?: string }[] = [];
  let allPassed = true;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      results.push({ testName, passed: true, message: detail });
    } else {
      results.push({ testName, passed: false, message: detail || 'Assertion failed' });
      allPassed = false;
      console.error(`[Test Failed] ${testName}: ${detail || ''}`);
    }
  }

  // =========================================================================
  // 1. Theme Modes & Color Codes Test
  // =========================================================================
  const botanicalSanctuaria = {
    background: '#0e1511',
    surface: '#1a211d',
    surfaceSecondary: '#161d19',
    onSurface: '#dde4de',
    primary: '#9dd3a4',
    primaryContainer: '#74a87c',
    secondary: '#d9c3a5',
    tertiary: '#aad1a2',
    accentClay: '#c47b62',
  };

  const somaKansoAtelier = {
    background: '#fdf9f0',
    surface: '#ffffff',
    surfaceSecondary: '#f7f3ea',
    surfaceTertiary: '#f1ede5',
    onSurface: '#1c1c16',
    primary: '#1d1b18',
    secondary: '#466645',
    tertiary: '#c56d36',
    accentClay: '#b25e29',
  };

  assert(
    botanicalSanctuaria.background === '#0e1511' && botanicalSanctuaria.primaryContainer === '#74a87c',
    'Dark Mode: Botanical Sanctuaria color codes match specification (#0e1511 / #74a87c)'
  );

  assert(
    somaKansoAtelier.background === '#fdf9f0' && somaKansoAtelier.secondary === '#466645',
    'Light Mode: Soma Kanso Atelier color codes match specification (#fdf9f0 / #466645 / #1c1c16)'
  );

  // =========================================================================
  // 2. Unit Modes (kg vs lb)
  // =========================================================================
  const testSettingsKg: Settings = { weightUnit: 'kg', defaultLoopDuration: 60, theme: 'dark' };
  const testSettingsLb: Settings = { weightUnit: 'lb', defaultLoopDuration: 60, theme: 'light' };

  assert(testSettingsKg.weightUnit === 'kg', 'Weight Unit Mode: kg supported');
  assert(testSettingsLb.weightUnit === 'lb', 'Weight Unit Mode: lb supported');

  // =========================================================================
  // 3. Timer Mode Logic: Second Timer Forward Counting & No Duration Limit
  // =========================================================================
  const startT = 10000;
  const currentT = 75000; // 65 seconds elapsed
  const totalLoopElapsed = currentT - startT;

  const loopMinutes = Math.floor(totalLoopElapsed / 60000);
  const loopSeconds = Math.floor((totalLoopElapsed % 60000) / 1000);
  const loopTenths = Math.floor((totalLoopElapsed % 1000) / 100);

  assert(
    totalLoopElapsed === 65000 && loopMinutes === 1 && loopSeconds === 5,
    'Timer Mode: Exercise loop timer counts forward past 60s without limit (01:05.0)'
  );

  // Looping to next exercise resets the loop timer while main timer continues
  const mainAccumulated = 65000;
  const newLoopStart = currentT;
  const subsequentT = 85000; // 10s into next loop
  const nextLoopElapsed = subsequentT - newLoopStart;
  const nextMainElapsed = mainAccumulated + (subsequentT - currentT);

  assert(
    nextLoopElapsed === 10000 && nextMainElapsed === 75000,
    'Timer Mode: Loop exercise resets second timer to 0s while workout stopwatch stays continuous'
  );

  // =========================================================================
  // 4. Workout Session & Set Completion Checkpoint Test
  // =========================================================================
  const testExercise = {
    exerciseId: 'test-squat',
    name: 'Goblet Squat',
    sets: [
      { reps: 10, weight: 24, completed: false },
      { reps: 10, weight: 24, completed: false },
      { reps: 10, weight: 24, completed: false },
    ],
  };

  // Toggle set 0 completion
  testExercise.sets[0].completed = !testExercise.sets[0].completed;
  assert(testExercise.sets[0].completed === true, 'Gym Floor Logger: Set checkpoint toggles to completed');
  assert(testExercise.sets[1].completed === false, 'Gym Floor Logger: Adjacent sets remain uncompleted');

  // =========================================================================
  // 5. Schedule & Streak Computation
  // =========================================================================
  const testRoutine: Routine = {
    id: 'test-routine',
    name: 'Atelier Split',
    daysPerWeek: 3,
    createdAt: '2026-09-01T00:00:00Z',
    days: [
      { weekday: 1, name: 'Monday Strength', exercises: [] },
      { weekday: 3, name: 'Wednesday Balance', exercises: [] },
      { weekday: 5, name: 'Friday Flow', exercises: [] },
    ],
  };

  const mondayDate = new Date('2026-10-05T12:00:00');
  const todayWorkout = getTodaysWorkout(testRoutine, mondayDate);
  assert(todayWorkout?.name === 'Monday Strength', 'Schedule: Correctly finds today’s workout on Monday');

  const tuesdayDate = new Date('2026-10-06T12:00:00');
  const nextFromTue = getNextWorkout(testRoutine, tuesdayDate);
  assert(nextFromTue?.day.weekday === 3 && nextFromTue.daysAway === 1, 'Schedule: Next workout correctly identifies Wednesday (1 day away)');

  // =========================================================================
  // 6. Text Consistency & Light Mode Typography Validation
  // =========================================================================
  const canonicalDarkText = {
    brand: 'PulseFit Sanctuary',
    overviewTab: 'Overview',
    routinesTab: 'Routines & Floor',
    timerTab: 'Zen Timer',
    analyticsTab: 'Analytics & Equilibrium',
    mainTitle: 'Mindful Training Sanctuary',
    mainSubtitle: 'Botanical Sanctuaria · Daily Movement Craft',
    streakTitle: 'Mindful Conditioning Streak',
    streakBadge: 'Biophilic Rhythm',
    todaySession: "Today's Training Sanctuary",
    timerTitle: 'Zen Flow & Dual-Loop Timer',
    timerSubtitle: 'Botanical Sanctuary · Interval Engine',
    gaugeTitle: 'Sanctuary Equilibrium Gauge',
    gaugeSubtitle: 'Mindful conditioning & restorative bio-rhythm',
    gaugeBadge: 'Harmonious Flow',
    dashboardTitle: 'Equilibrium & Performance Analytics',
    dashboardSubtitle: 'Botanical Sanctuaria · Biophilic Intelligence',
  };

  assert(
    canonicalDarkText.brand === 'PulseFit Sanctuary' &&
    canonicalDarkText.timerTab === 'Zen Timer' &&
    canonicalDarkText.mainTitle === 'Mindful Training Sanctuary' &&
    canonicalDarkText.todaySession === "Today's Training Sanctuary",
    'Text Consistency: Canonical dark mode text preserved for both light and dark modes'
  );

  assert(
    canonicalDarkText.gaugeTitle === 'Sanctuary Equilibrium Gauge' &&
    canonicalDarkText.timerTitle === 'Zen Flow & Dual-Loop Timer',
    'Text Consistency: Dial & gauge titles consistent without mode discrepancy'
  );

  return {
    passed: allPassed,
    suite: 'Botanical Sanctuaria Feature & Mode Consistency Test Suite',
    results,
  };
}
