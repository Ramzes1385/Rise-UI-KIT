/**
 * Конфигурация Vitest для unit и integration тестов.
 * Alias и SCSS-настройки синхронизированы со структурой UI-библиотеки.
 */

/// <reference types="vitest" />

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

/** Корень проекта: build/tests/ → на два уровня выше. */
const ROOT = path.resolve(dirname, '../..')

/** Alias проекта, продублированные из build/config/alias.ts. */
const ALIASES: Record<string, string> = {
	'@': path.resolve(ROOT, 'src'),
	'@components': path.resolve(ROOT, 'src/components'),
	'@composables': path.resolve(ROOT, 'src/composables'),
	'@constants': path.resolve(ROOT, 'src/constants'),
	'@icons': path.resolve(ROOT, 'src/icons'),
	'@plugins': path.resolve(ROOT, 'src/plugins'),
	'@styles': path.resolve(ROOT, 'src/styles'),
	'@ui': path.resolve(ROOT, 'src/components'),
	'@utils': path.resolve(ROOT, 'src/utils'),
}

/** Глобальный SCSS prelude — продублирован из build/config/css.ts. */
const GLOBAL_SCSS_PRELUDE = [
	'@use "@styles/variables" as *;',
	'@use "@styles/mixins" as *;',
	'@use "@styles/functions" as *;',
	'',
].join('\n')

/** Глобальные SCSS-файлы — не должны импортировать сами себя (защита от module loop). */
const GLOBAL_SCSS_FILES = ['_variables.scss', '_mixins.scss', '_functions.scss']

function shouldSkipImport(filename: string): boolean {
	return GLOBAL_SCSS_FILES.some(file => filename.endsWith(file))
}

function addGlobalImports(source: string, filename: string): string {
	if (shouldSkipImport(filename)) return source
	return `${GLOBAL_SCSS_PRELUDE}${source}`
}

/** Базовая зона покрытия для общего прогона Vitest. */
const BASE_COVERAGE_INCLUDE = ['src/utils/**/*.ts', 'src/composables/**/*.ts', 'src/components/**/*.vue']

/** Зона покрытия для components-прогона — UI-компоненты.
 * Точечные include/exclude передаются поверх через CLI (--coverage.include). */
const COMPONENT_COVERAGE_INCLUDE = ['src/components/**/*.vue']

const COVERAGE_MODE = process.env.COVERAGE_MODE ?? ''

function isCi(): boolean {
	return process.env.CI === 'true'
}

function getCoverageDir(): string {
	if (COVERAGE_MODE === 'components') return 'coverage/components'
	return 'coverage'
}

function getCoverageInclude(): string[] {
	if (COVERAGE_MODE === 'components') return COMPONENT_COVERAGE_INCLUDE
	if (COVERAGE_MODE === 'composables') return ['src/composables/**/*.ts']
	if (COVERAGE_MODE === 'utils') return ['src/utils/**/*.ts']
	return BASE_COVERAGE_INCLUDE
}

function getCoverageThresholds() {
	if (!isCi()) return undefined
	return {
		lines: 75,
		functions: 70,
		branches: 65,
		statements: 75,
	}
}

const coverageThresholds = getCoverageThresholds()

export default defineConfig({
	root: ROOT,
	plugins: [vue()],
	resolve: {
		alias: ALIASES,
	},
	optimizeDeps: {
		include: ['vue'],
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler',
				additionalData: addGlobalImports,
				charset: false,
			},
		},
	},
	test: {
		globals: true,
		css: true,
		server: {
			deps: {
				inline: [/icons\.svg/],
			},
		},
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'html', 'lcov', 'json'],
			reportsDirectory: getCoverageDir(),
			reportOnFailure: true,
			include: getCoverageInclude(),
			exclude: [
				'**/*.spec.ts',
				'**/*.integration.spec.ts',
				'**/*.visual.spec.ts',
				'**/*.e2e.spec.ts',
				'**/*.stories.ts',
				'**/*.types.ts',
				'**/*.style.scss',
				'**/index.ts',
			],
			...(coverageThresholds ? { thresholds: coverageThresholds } : {}),
		},
		projects: [
			{
				extends: true,
				test: {
					name: 'unit-integration',
					environment: 'jsdom',
					pool: 'forks',
					testTimeout: 30_000,
					setupFiles: [path.resolve(dirname, 'setup-vitest.ts')],
					include: ['src/**/*.spec.ts', 'src/**/*.integration.spec.ts'],
					exclude: ['src/**/*.visual.spec.ts', 'src/**/*.e2e.spec.ts'],
				},
			},
		],
	},
})
