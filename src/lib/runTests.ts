import { runFeatureAndModeTests } from './featureModes.test';

const report = runFeatureAndModeTests();

console.log(`\n========================================`);
console.log(`SUITE: ${report.suite}`);
console.log(`ALL PASSED: ${report.passed ? 'YES ✅' : 'NO ❌'}`);
console.log(`========================================\n`);

report.results.forEach((r, idx) => {
  const icon = r.passed ? '✅' : '❌';
  console.log(`${idx + 1}. ${icon} ${r.testName}`);
  if (r.message) {
    console.log(`   Detail: ${r.message}`);
  }
});

if (!report.passed) {
  process.exit(1);
} else {
  console.log(`\nAll ${report.results.length} tests passed successfully!`);
}
