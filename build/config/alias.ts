/**
 * Псевдонимы путей UI-библиотеки — единый источник для сборки библиотеки, Storybook и Vitest.
 * TypeScript читает свою копию: paths в tsconfig.app.json (держать в соответствии).
 */

import type { AliasOptions } from 'vite'
import { resolveFromRoot } from '../utils/helpers'

/** Каталог исходников библиотеки */
const SOURCE_DIR = 'src'

/** Создаёт карту alias для resolve.alias в Vite. */
export function createAliasConfig(): AliasOptions {
	const srcPath = resolveFromRoot(SOURCE_DIR)

	return {
		'@': srcPath,
		'@/': `${srcPath}/`,
		'@components': resolveFromRoot(SOURCE_DIR, 'components'),
		'@composables': resolveFromRoot(SOURCE_DIR, 'composables'),
		'@constants': resolveFromRoot(SOURCE_DIR, 'constants'),
		'@icons': resolveFromRoot(SOURCE_DIR, 'icons'),
		'@plugins': resolveFromRoot(SOURCE_DIR, 'plugins'),
		'@styles': resolveFromRoot(SOURCE_DIR, 'styles'),
		'@utils': resolveFromRoot(SOURCE_DIR, 'utils'),
	}
}
