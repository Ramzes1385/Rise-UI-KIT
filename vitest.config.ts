/**
 * Конфигурация Vitest: unit/integration (jsdom) + Storybook (browser).
 * Storybook-проект использует @storybook/addon-vitest/vitest-plugin
 * и @vitest/browser-playwright для запуска play-тестов в браузере.
 */

/// <reference types="vitest" />

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

/** Алиасы проекта — дублируют build/config/alias.ts */
const ALIASES: Record<string, string> = {
	'@': path.resolve(__dirname, 'src'),
	'@app': path.resolve(__dirname, 'src/app'),
	'@pages': path.resolve(__dirname, 'src/pages'),
	'@widgets': path.resolve(__dirname, 'src/widgets'),
	'@features': path.resolve(__dirname, 'src/features'),
	'@entities': path.resolve(__dirname, 'src/entities'),
	'@shared': path.resolve(__dirname, 'src/shared'),
	'@assets': path.resolve(__dirname, 'src/shared/assets'),
	'@styles': path.resolve(__dirname, 'src/shared/assets/styles'),
	'@images': path.resolve(__dirname, 'src/shared/assets/images'),
	'@ui': path.resolve(__dirname, 'src/shared/ui'),
	'@lib': path.resolve(__dirname, 'src/shared/lib'),
	'@api': path.resolve(__dirname, 'src/shared/api'),
	'/icons.svg': path.resolve(__dirname, 'public/icons.svg'),
}

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

/** Глобальные SCSS-файлы, доступные во всех компонентах без импорта */
const GLOBAL_SCSS_IMPORTS = [
	'@use "@/shared/assets/styles/variables" as *;',
	'@use "@/shared/assets/styles/mixins" as *;',
	'@use "@/shared/assets/styles/functions" as *;',
].join('\n')

/** Глобальные SCSS-файлы, которые не должны импортировать сами себя */
const GLOBAL_SCSS_FILES = ['_variables.scss', '_mixins.scss', '_functions.scss']

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: ALIASES,
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: (source: string, filename: string) => {
					const isGlobal = GLOBAL_SCSS_FILES.some(f => filename.endsWith(f))
					if (isGlobal) return source
					return `${GLOBAL_SCSS_IMPORTS}\n${source}`
				},
				silenceDeprecations: ['legacy-js-api'],
				charset: false,
			},
		},
	},
	test: {
		globals: true,
		css: true,
		setupFiles: ['./tests/setup-vitest.ts'],
		server: {
			deps: {
				inline: [/icons\.svg/],
			},
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 70,
				statements: 80,
			},
		},
		projects: [
			{
				extends: true,
				test: {
					name: 'unit-integration',
					environment: 'jsdom',
					setupFiles: ['./tests/setup-vitest.ts'],
					include: ['src/**/*.spec.ts', 'src/**/*.integration.spec.ts'],
				},
			},
			{
				extends: true,
				plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [{ browser: 'chromium' }],
					},
					setupFiles: [],
				},
			},
		],
	},
})
