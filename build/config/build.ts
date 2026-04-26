/**
 * Конфигурация production-сборки.
 * Чанки, минификация Terser, output-пути, лимиты.
 */

import { extname } from 'node:path'
import type { BuildOptions } from 'vite'
import {
	ASSET_SUBDIRS,
	MAX_CHUNK_WARNING_SIZE_KB,
	OUTPUT_DIR,
	PRODUCTION_DROP_CONSOLE,
	TERSER_COMPRESS_PASSES,
} from '../constants'
import { createAssetFileName } from '../utils/helpers'

/** Пакеты Vue-экосистемы */
const VUE_ECOSYSTEM_PACKAGES = ['vue', '@vue', 'vue-router', 'pinia']

/** Проверяет, принадлежит ли модуль одному из указанных пакетов */
function isFromPackages(moduleId: string, packages: string[]): boolean {
	return packages.some(pkg => moduleId.includes(`node_modules/${pkg}`))
}

/**
 * Стратегия разделения на чанки.
 * Только реально используемые пакеты — без мёртвых групп.
 */
function createManualChunks(moduleId: string): string | undefined {
	if (!moduleId.includes('node_modules')) return undefined

	if (isFromPackages(moduleId, VUE_ECOSYSTEM_PACKAGES)) return 'vendor-vue'

	return 'vendor-libs'
}

/** Создаёт конфигурацию production-сборки */
export function createBuildConfig(): BuildOptions {
	return {
		outDir: OUTPUT_DIR,
		assetsDir: 'assets',
		sourcemap: false,
		cssCodeSplit: true,
		target: 'es2020',

		modulePreload: {
			polyfill: true,
		},

		chunkSizeWarningLimit: MAX_CHUNK_WARNING_SIZE_KB,

		minify: 'terser',
		terserOptions: {
			compress: {
				drop_debugger: true,
				pure_funcs: [...PRODUCTION_DROP_CONSOLE],
				passes: TERSER_COMPRESS_PASSES,
				dead_code: true,
				collapse_vars: true,
				reduce_vars: true,
				hoist_funs: true,
				hoist_vars: false,
				booleans_as_integers: false,
				ecma: 2020,
				module: true,
				toplevel: true,
				unsafe_math: false,
				unsafe_proto: false,
			},
			mangle: {
				safari10: true,
				toplevel: true,
			},
			format: {
				comments: false,
				ascii_only: true,
				ecma: 2020,
			},
		},

		rollupOptions: {
			output: {
				manualChunks: createManualChunks,

				chunkFileNames: `${ASSET_SUBDIRS.js}/[name]-[hash].js`,
				entryFileNames: `${ASSET_SUBDIRS.js}/[name]-[hash].js`,
				assetFileNames: assetInfo => {
					const ext = extname(assetInfo.name ?? '')
					return createAssetFileName(ext)
				},
			},

			treeshake: {
				moduleSideEffects: 'no-external',
				propertyReadSideEffects: false,
			},
		},

		reportCompressedSize: true,
		assetsInlineLimit: 4096,
	}
}
