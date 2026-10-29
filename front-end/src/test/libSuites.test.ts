import { describe, it, expect } from 'vitest';
import { runScheduleTests } from '../lib/schedule.test';
import { runFeatureAndModeTests } from '../lib/featureModes.test';

describe('lib logic suites', () => {
  it('schedule: all checks pass', () => {
    const report = runScheduleTests();
    expect(report.results.length).toBeGreaterThan(0);
    expect(report.passed).toBe(true);
  });

  it('feature modes: all checks pass', () => {
    const report = runFeatureAndModeTests();
    expect(report.results.length).toBeGreaterThan(0);
    const failed = report.results.filter((r) => !r.passed);
    expect(failed).toEqual([]);
  });
});
