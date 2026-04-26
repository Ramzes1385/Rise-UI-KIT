/**
 * Конфигурация Storybook для Vue 3 + Vite.
 * Переиспользует алиасы и SCSS-переменные проекта.
 */

import { resolve } from 'node:path'

import type { StorybookConfig } from '@storybook/vue3-vite'
import svgLoader from 'vite-svg-loader'

const ROOT = resolve(process.cwd())

/** Алиасы проекта — дублируют build/config/alias.ts */
const ALIASES: Record<string, string> = {
	'@': resolve(ROOT, 'src'),
	'@app': resolve(ROOT, 'src/app'),
	'@pages': resolve(ROOT, 'src/pages'),
	'@widgets': resolve(ROOT, 'src/widgets'),
	'@features': resolve(ROOT, 'src/features'),
	'@entities': resolve(ROOT, 'src/entities'),
	'@shared': resolve(ROOT, 'src/shared'),
	'@assets': resolve(ROOT, 'src/shared/assets'),
	'@styles': resolve(ROOT, 'src/shared/assets/styles'),
	'@images': resolve(ROOT, 'src/shared/assets/images'),
	'@ui': resolve(ROOT, 'src/shared/ui'),
	'@lib': resolve(ROOT, 'src/shared/lib'),
	'@api': resolve(ROOT, 'src/shared/api'),
}

/** Глобальные SCSS-импорты — дублируют build/config/css.ts */
const GLOBAL_SCSS_IMPORTS = [
	'@use "@/shared/assets/styles/variables" as *;',
	'@use "@/shared/assets/styles/mixins" as *;',
	'@use "@/shared/assets/styles/functions" as *;',
].join('\n')

/** Глобальные SCSS-файлы, которые не должны импортировать сами себя */
const GLOBAL_SCSS_FILES = ['_variables.scss', '_mixins.scss', '_functions.scss']

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

	addons: ['@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-onboarding', '@storybook/addon-vitest'],

	framework: {
		name: '@storybook/vue3-vite',
		options: {},
	},

	viteFinal(config) {
		/* Алиасы */
		config.resolve ??= {}
		config.resolve.alias = {
			...(config.resolve.alias as Record<string, string>),
			...ALIASES,
		}

		/* SCSS: глобальные переменные и миксины */
		config.css ??= {}
		config.css.preprocessorOptions ??= {}
		const scssOptions = (config.css.preprocessorOptions.scss as Record<string, unknown>) ?? {}

		scssOptions.additionalData = (source: string, filename: string) => {
			const isGlobal = GLOBAL_SCSS_FILES.some(f => filename.endsWith(f))
			if (isGlobal) return source
			return `${GLOBAL_SCSS_IMPORTS}\n${source}`
		}

		scssOptions.silenceDeprecations = ['legacy-js-api']
		scssOptions.charset = false
		config.css.preprocessorOptions.scss = scssOptions

		/* Плагин SVG (Vue уже добавлен фреймворком) */
		config.plugins ??= []
		;(config.plugins as unknown[]).push(svgLoader({ defaultImport: 'component', svgo: true }))

		return config
	},
}

export default config
