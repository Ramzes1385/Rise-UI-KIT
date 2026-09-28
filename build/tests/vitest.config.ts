/**
 * Конфигурация Vitest для unit и integration тестов.
 * Alias и SCSS-настройки — общие со сборкой библиотеки (build/config/alias.ts, build/config/css.ts).
 */

/// <reference types="vitest" />

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { createAliasConfig } from '../config/alias'
import { createScssOptions } from '../config/css'

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

/** Корень проекта: build/tests/ → на два уровня выше. */
const ROOT = path.resolve(dirname, '../..')

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
		alias: createAliasConfig(),
	},
	optimizeDeps: {
		include: ['vue'],
	},
	css: {
		preprocessorOptions: {
			scss: createScssOptions(),
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
					include: ['src/**/*.spec.ts', 'src/**/*.integration.spec.ts', 'build/tests/**/*.spec.ts'],
					exclude: ['src/**/*.visual.spec.ts', 'src/**/*.e2e.spec.ts'],
				},
			},
		],
	},
})
