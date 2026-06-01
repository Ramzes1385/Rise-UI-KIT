/**
 * Side-effect модуль: выставляет COVERAGE_MODE=storybook ДО загрузки vitest.config.
 * Импортируется первым из корневого vitest.config.ts (entrypoint для Storybook addon-vitest),
 * чтобы getCoverageDir() в основной конфигурации увидел режим storybook и направил
 * coverage в coverage/storybook/ вместо корня coverage/.
 *
 * ESM выполняет статические импорты в порядке их объявления, поэтому это присваивание
 * гарантированно произойдёт до чтения process.env.COVERAGE_MODE в build/tests/vitest.config.ts.
 */

process.env.COVERAGE_MODE ||= 'storybook'

export {}
