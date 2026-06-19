/**
 * Псевдонимы путей UI-библиотеки.
 * Каждый alias должен быть синхронизирован с paths в tsconfig.json.
 */

import type { AliasOptions } from 'vite'
import { SOURCE_DIR } from '../constants'
import { resolveFromRoot } from '../utils/helpers'

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
		'@ui': resolveFromRoot(SOURCE_DIR, 'components'),
		'@utils': resolveFromRoot(SOURCE_DIR, 'utils'),
	}
}
