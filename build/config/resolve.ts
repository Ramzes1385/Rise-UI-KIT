/**
 * Конфигурация разрешения модулей.
 * Определяет alias, порядок поиска расширений и дедупликацию.
 */

import type { ResolveOptions } from 'vite'
import { createAliasConfig } from './alias'

/** Расширения, которые Vite разрешает без явного указания */
const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json'] as const

/** Создаёт конфигурацию resolve для Vite */
export function createResolveConfig(): ResolveOptions {
	return {
		alias: createAliasConfig(),
		extensions: [...RESOLVE_EXTENSIONS],
		dedupe: ['vue', 'vue-router', 'pinia'],
	} as ResolveOptions
}
