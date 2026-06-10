/**
 * Конфигурация Storybook для Vue 3 + Vite.
 * Использует aliases и SCSS-модули структуры UI-библиотеки.
 */

import { cpSync, existsSync, mkdirSync } from 'node:fs'
import type { StorybookConfig } from '@storybook/vue3-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { mergeConfig } from 'vite'
import { resolvePathInStorybookCache } from 'storybook/internal/common'
import svgLoader from 'vite-svg-loader'
import { createSpritePlugin } from '../plugins/sprite.ts'

const PROJECT_ROOT = resolve(process.cwd())
const COVERAGE_DIR = resolve(PROJECT_ROOT, 'coverage')
const ADDON_VITEST_CACHE = resolvePathInStorybookCache('coverage')

type StaticDir = { from: string; to: string }

/**
 * Отдаёт /coverage из проектной папки coverage/.
 *
 * Addon-vitest при нажатии «Run tests» пишет HTML-отчёт в свой внутренний кеш
 * (node_modules/.cache/storybook/.../coverage/), а не в coverage/.
 * Vite-миддлвар syncCoverageFromCache синхронизирует кеш → coverage/
 * при первом запросе /coverage/, чтобы /coverage/index.html всегда был доступен.
 *
 * CLI-прогоны (test:storybook:coverage, test:coverage:merged) пишут напрямую
 * в coverage/, миддлвар для них — no-op.
 */
function serveProjectCoverage(staticDirs: StaticDir[]): StaticDir[] {
	mkdirSync(COVERAGE_DIR, { recursive: true })
	const others = staticDirs.filter(dir => dir.to !== '/coverage')
	return [{ from: COVERAGE_DIR, to: '/coverage' }, ...others]
}

/**
 * Vite-плагин: при запросе /coverage/ синхронизирует отчёт из кеша
 * addon-vitest в coverage/, если в coverage/ ещё нет index.html.
 */
function syncCoverageFromCache(): Plugin {
	return {
		name: 'sync-coverage-from-cache',
		configureServer(server) {
			server.middlewares.use((req, _res, next) => {
				const url = req.url ?? ''
				if (!url.startsWith('/coverage')) return next()

				if (!existsSync(resolve(COVERAGE_DIR, 'index.html')) && existsSync(resolve(ADDON_VITEST_CACHE, 'index.html'))) {
					cpSync(ADDON_VITEST_CACHE, COVERAGE_DIR, { recursive: true, force: true })
				}

				next()
			})
		},
	}
}

/** Alias проекта, продублированные из build/config/alias.ts. */
const ALIASES: Record<string, string> = {
	'@': resolve(PROJECT_ROOT, 'src'),
	'@components': resolve(PROJECT_ROOT, 'src/components'),
	'@composables': resolve(PROJECT_ROOT, 'src/composables'),
	'@icons': resolve(PROJECT_ROOT, 'src/icons'),
	'@styles': resolve(PROJECT_ROOT, 'src/styles'),
	'@ui': resolve(PROJECT_ROOT, 'src/components'),
	'@utils': resolve(PROJECT_ROOT, 'src/utils'),
}

/** Глобальный SCSS prelude — продублирован из build/config/css.ts. */
const GLOBAL_SCSS_PRELUDE = [
	'@use "@styles/variables" as *;',
	'@use "@styles/mixins" as *;',
	'@use "@styles/functions" as *;',
	'',
].join('\n')

// Глобальные SCSS-файлы не импортируют сами себя — иначе зацикливание.
const GLOBAL_SCSS_FILES = ['_variables.scss', '_mixins.scss', '_functions.scss']

function shouldSkipImport(filename: string): boolean {
	return GLOBAL_SCSS_FILES.some(file => filename.endsWith(file))
}

function addGlobalImports(source: string, filename: string): string {
	if (shouldSkipImport(filename)) return source
	return `${GLOBAL_SCSS_PRELUDE}${source}`
}

const config: StorybookConfig = {
	stories: ['../../src/components/**/*.stories.ts'],

	addons: ['@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-onboarding', '@storybook/addon-vitest'],

	framework: {
		name: '@storybook/vue3-vite',
		options: {},
	},

	staticDirs: (dirs = []) => serveProjectCoverage(dirs as StaticDir[]),

	viteFinal(config) {
		const isVitest = !!process.env.VITEST
		const merged = mergeConfig(config, {
			root: PROJECT_ROOT,
			server: {
				fs: {
					allow: [PROJECT_ROOT],
				},
			},
			resolve: {
				alias: ALIASES,
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
		})
		const plugins = [...[config.plugins], svgLoader({ defaultImport: 'component', svgo: true })]
		if (!isVitest) plugins.push(vue(), syncCoverageFromCache(), createSpritePlugin())
		merged.plugins = plugins
		return merged
	},
}

export default config
