/**
 * Entrypoint для addon-vitest (Storybook «Run tests»).
 * Addon ищет vitest.config.* по дереву вверх от configDir
 * и проверяет content.includes('@storybook/addon-vitest').
 * Без этого импорта addon не найдёт конфиг, когда configDir = build/storybook.
 */
import '@storybook/addon-vitest/vitest-plugin'

import './build/tests/set-coverage-mode'

export { default } from './build/tests/vitest.config'
