// Общий список зон для merge-coverage.mjs и invalidate-merged-coverage.mjs — каждый прогон пишет отчёт в coverage/<zone>/.

export const COVERAGE_ZONES = ['components', 'components-heavy', 'composables', 'utils']

export const COVERAGE_SOURCES = COVERAGE_ZONES.map(zone => `coverage/${zone}/coverage-final.json`)
