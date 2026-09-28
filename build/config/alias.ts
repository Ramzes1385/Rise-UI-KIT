/** TypeScript читает свою копию алиасов в paths tsconfig.app.json — держать в соответствии. */

import type { AliasOptions } from 'vite'
import { resolveFromRoot } from '../utils/helpers'

const SOURCE_DIR = 'src'

export function createAliasConfig(): AliasOptions {
	const srcPath = resolveFromRoot(SOURCE_DIR)

	return {
		'@': srcPath,
		'@/': `${srcPath}/`,
		'@components': resolveFromRoot(SOURCE_DIR, 'components'),
		'@composables': resolveFromRoot(SOURCE_DIR, 'composables'),
		'@icons': resolveFromRoot(SOURCE_DIR, 'icons'),
		'@styles': resolveFromRoot(SOURCE_DIR, 'styles'),
		'@utils': resolveFromRoot(SOURCE_DIR, 'utils'),
	}
}
