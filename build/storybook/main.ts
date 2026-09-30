/** Структура: src/stories/ — вводная и Foundations; src/components/<X>/stories/ — stories компонентов; preview.ts — тема и a11y; manager.ts — интерфейс Storybook. */

import type { StorybookConfig } from '@storybook/vue3-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { mergeConfig } from 'vite'
import svgLoader from 'vite-svg-loader'
import { createAliasConfig } from '../config/alias.ts'
import { createScssOptions } from '../config/css.ts'
import { createSpritePlugin } from '../plugins/sprite.ts'
import { createSlotDocsPlugin } from '../plugins/slotDocs.ts'

const PROJECT_ROOT = resolve(process.cwd())

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
				alias: createAliasConfig(),
				extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
			},
			css: {
				preprocessorOptions: {
					scss: createScssOptions(),
				},
			},
		})
		// vite:vue должен идти раньше storybook:vue-docgen-plugin из config.plugins: docgen дописывает
		// `_sfc_main.__docgenInfo = …` к уже скомпилированному JS. Если vue() стоит после него, docgen дописывается
		// к исходнику SFC и молча теряется (в Docs нет описаний props), а JSDoc с HTML-тегами ломает сборку.
		merged.plugins = [
			vue(),
			...[config.plugins],
			createSlotDocsPlugin(),
			svgLoader({ defaultImport: 'component', svgo: true }),
			createSpritePlugin(),
		]
		return merged
	},
}

export default config
