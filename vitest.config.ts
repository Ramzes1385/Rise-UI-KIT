/**
 * Конфигурация Vitest по умолчанию — для `npx vitest` без --config и IDE-расширений Vitest.
 * Совпадает с конфигурацией npm-скриптов (build/tests/vitest.config.ts).
 *
 * Раньше файл импортировал '@storybook/addon-vitest/vitest-plugin', но аддона нет в devDependencies:
 * запуск без --config падал на старте с ERR_MODULE_NOT_FOUND.
 */
export { default } from './build/tests/vitest.config'
