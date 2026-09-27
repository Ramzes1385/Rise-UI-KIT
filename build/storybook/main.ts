/**
 * Конфигурация Storybook для Vue 3 + Vite.
 *
 * Где что лежит:
 * - src/stories/            — вводная страница, Foundations (токены, типографика, размеры, темы) и общие хелперы stories;
 * - src/components/<X>/stories/<X>.stories.ts — stories компонентов;
 * - build/storybook/preview.ts  — глобальные параметры, тема (toolbar «Тема»), a11y;
 * - build/storybook/manager.ts  — оформление интерфейса Storybook.
 */

import type { StorybookConfig } from '@storybook/vue3-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { mergeConfig } from 'vite'
import svgLoader from 'vite-svg-loader'
import { createSpritePlugin } from '../plugins/sprite.ts'

const PROJECT_ROOT = resolve(process.cwd())

/** Alias проекта, продублированные из build/config/alias.ts. */
const ALIASES: Record<string, string> = {
	'@': resolve(PROJECT_ROOT, 'src'),
	'@components': resolve(PROJECT_ROOT, 'src/components'),
	'@composables': resolve(PROJECT_ROOT, 'src/composables'),
	'@constants': resolve(PROJECT_ROOT, 'src/constants'),
	'@icons': resolve(PROJECT_ROOT, 'src/icons'),
	'@plugins': resolve(PROJECT_ROOT, 'src/plugins'),
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
const GLOBAL_SCSS_FILES = ['_tokens.scss', '_variables.scss', '_mixins.scss', '_functions.scss']

function shouldSkipImport(filename: string): boolean {
	return GLOBAL_SCSS_FILES.some(file => filename.endsWith(file))
}

function addGlobalImports(source: string, filename: string): string {
	if (shouldSkipImport(filename)) return source
	return `${GLOBAL_SCSS_PRELUDE}${source}`
}

const config: StorybookConfig = {
	stories: ['../../src/stories/**/*.mdx', '../../src/stories/**/*.stories.ts', '../../src/components/**/*.stories.ts'],

	addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],

	framework: {
		name: '@storybook/vue3-vite',
		options: {},
	},

	core: {
		disableTelemetry: true,
	},

	viteFinal(config) {
		const merged = mergeConfig(config, {
			root: PROJECT_ROOT,
			server: {
				fs: {
					allow: [PROJECT_ROOT],
				},
			},
			resolve: {
				alias: ALIASES,
				extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
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
		// vite:vue должен идти раньше storybook:vue-docgen-plugin из config.plugins: docgen дописывает
		// `_sfc_main.__docgenInfo = …` к уже скомпилированному JS. Если vue() стоит после него, docgen дописывается
		// к исходнику SFC и молча теряется (в Docs нет описаний props), а JSDoc с HTML-тегами ломает сборку.
		merged.plugins = [vue(), ...[config.plugins], svgLoader({ defaultImport: 'component', svgo: true }), createSpritePlugin()]
		return merged
	},
}

export default config
