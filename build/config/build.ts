/**
 * Конфигурация production-сборки.
 * Чанки, минификация (oxc — нативный минификатор rolldown), output-пути, лимиты.
 */

import { extname } from 'node:path'
import type { BuildOptions } from 'vite'
import { ASSET_SUBDIRS, MAX_CHUNK_WARNING_SIZE_KB, OUTPUT_DIR } from '../constants'
import { createAssetFileName } from '../utils/helpers'

/** Пакеты Vue-экосистемы */
const VUE_ECOSYSTEM_PACKAGES = ['vue', '@vue']

/**
 * Карта тяжёлых компонентов приложения → имя предсказуемого чанка.
 * Применяется в createManualChunks(): если путь модуля начинается с указанной директории,
 * Rollup выносит его в отдельный async-чанк с фиксированным именем.
 */
const HEAVY_APP_CHUNKS: Record<string, string> = {
	'src/components/BaseChat/': 'base-chat',
	'src/components/BaseEditor/': 'base-editor',
	'src/components/BaseDatePicker/': 'base-date-picker',
	'src/components/BaseCalendar/': 'base-calendar',
	'src/components/BaseTable/': 'base-table',
	'src/components/BaseFileUpload/': 'base-file-upload',
}

/** Проверяет, принадлежит ли модуль одному из указанных пакетов */
function isFromPackages(moduleId: string, packages: string[]): boolean {
	return packages.some(pkg => moduleId.includes(`node_modules/${pkg}`))
}

/**
 * Сопоставляет id модуля с таблицей тяжёлых компонентов приложения.
 * Нормализует разделители путей под POSIX перед сравнением.
 */
function matchHeavyAppChunk(id: string): string | null {
	const normalized = id.replace(/\\/g, '/')
	for (const [prefix, chunkName] of Object.entries(HEAVY_APP_CHUNKS)) {
		if (normalized.includes(prefix)) return chunkName
	}
	return null
}

/** Сопоставляет id модуля из node_modules с именем vendor-чанка */
function matchVendorChunk(moduleId: string): string {
	if (isFromPackages(moduleId, VUE_ECOSYSTEM_PACKAGES)) return 'vendor-vue'
	return 'vendor-libs'
}

/**
 * Стратегия разделения на чанки.
 * Сначала — тяжёлые app-компоненты (физический split под defineAsyncComponent),
 * затем — vendor-пакеты.
 */
function createManualChunks(moduleId: string): string | undefined {
	const heavyChunk = matchHeavyAppChunk(moduleId)
	if (heavyChunk) return heavyChunk

	if (!moduleId.includes('node_modules')) return undefined

	return matchVendorChunk(moduleId)
}

/** Имя выходного файла ассета по его исходному имени. */
function buildAssetFileName({ name }: { name?: string }): string {
	return createAssetFileName(extname(name ?? ''))
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

		minify: 'oxc',

		rollupOptions: {
			output: {
				manualChunks: createManualChunks,

				chunkFileNames: `${ASSET_SUBDIRS.js}/[name]-[hash].js`,
				entryFileNames: `${ASSET_SUBDIRS.js}/[name]-[hash].js`,
				assetFileNames: buildAssetFileName,
			},

			treeshake: {
				propertyReadSideEffects: false,
			},
		},

		reportCompressedSize: false,
		assetsInlineLimit: 4096,
	}
}
