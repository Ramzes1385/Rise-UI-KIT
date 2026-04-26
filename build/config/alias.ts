/**
 * Псевдонимы путей.
 * Исключают магические относительные пути из кодовой базы.
 * Каждый alias ОБЯЗАТЕЛЬНО продублируй в tsconfig.json → paths.
 */

import type { AliasOptions } from 'vite'
import { SOURCE_DIR } from '../constants'
import { resolveFromRoot } from '../utils/helpers'

/** Создаёт карту alias для resolve.alias в Vite */
export function createAliasConfig(): AliasOptions {
	const srcPath = resolveFromRoot(SOURCE_DIR)

	return {
		'@': srcPath,
		'@app': resolveFromRoot(SOURCE_DIR, 'app'),
		'@pages': resolveFromRoot(SOURCE_DIR, 'pages'),
		'@widgets': resolveFromRoot(SOURCE_DIR, 'widgets'),
		'@features': resolveFromRoot(SOURCE_DIR, 'features'),
		'@entities': resolveFromRoot(SOURCE_DIR, 'entities'),
		'@shared': resolveFromRoot(SOURCE_DIR, 'shared'),
		'@assets': resolveFromRoot(SOURCE_DIR, 'shared/assets'),
		'@styles': resolveFromRoot(SOURCE_DIR, 'shared/assets/styles'),
		'@images': resolveFromRoot(SOURCE_DIR, 'shared/assets/images'),
		'@ui': resolveFromRoot(SOURCE_DIR, 'shared/ui'),
		'@lib': resolveFromRoot(SOURCE_DIR, 'shared/lib'),
		'@api': resolveFromRoot(SOURCE_DIR, 'shared/api'),
	}
}
