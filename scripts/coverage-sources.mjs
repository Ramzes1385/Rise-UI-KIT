// Зоны покрытия: каждый тест-прогон пишет свой отчёт в coverage/<zone>/.
// Общий список для merge-coverage.mjs и invalidate-merged-coverage.mjs.

export const COVERAGE_ZONES = ['components', 'components-heavy', 'composables', 'utils']

export const COVERAGE_SOURCES = COVERAGE_ZONES.map(zone => `coverage/${zone}/coverage-final.json`)
