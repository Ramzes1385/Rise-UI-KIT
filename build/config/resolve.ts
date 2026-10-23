import type { ResolveOptions } from 'vite'
import { createAliasConfig } from './alias'

const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json'] as const

export function createResolveConfig(): ResolveOptions {
	return {
		alias: createAliasConfig(),
		extensions: [...RESOLVE_EXTENSIONS],
		dedupe: ['vue'],
	} as ResolveOptions
}
