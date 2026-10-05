/** Структура: src/stories/ — вводная и Foundations; src/components/<X>/stories/ — stories компонентов; preview.ts — тема и a11y; manager.ts — интерфейс Storybook. */

import type { StorybookConfig } from '@storybook/vue3-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { mergeConfig, type PluginOption } from 'vite'
import svgLoader from 'vite-svg-loader'
import { createAliasConfig } from '../config/alias.ts'
import { createScssOptions } from '../config/css.ts'
import { createSpritePlugin } from '../plugins/sprite.ts'
import { createSlotDocsPlugin } from '../plugins/slotDocs.ts'
import { createVueDocgenPlugin, STORYBOOK_DOCGEN_PLUGIN_NAME } from '../plugins/vueDocgen.ts'

const PROJECT_ROOT = resolve(process.cwd())

/** Штатный docgen Storybook не знает алиасов (`@composables/…`) — подменяем его своим с теми же алиасами, на том же месте. */
function replaceDocgenPlugin(plugins: PluginOption[] | undefined): PluginOption[] {
	return (plugins ?? []).flat(Infinity as 1).map(plugin => (isDocgenPlugin(plugin) ? createVueDocgenPlugin() : plugin))
}

function isDocgenPlugin(plugin: PluginOption): boolean {
	return typeof plugin === 'object' && plugin !== null && 'name' in plugin && plugin.name === STORYBOOK_DOCGEN_PLUGIN_NAME
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
			...replaceDocgenPlugin(config.plugins),
			createSlotDocsPlugin(),
			svgLoader({ defaultImport: 'component', svgo: true }),
			createSpritePlugin(),
		]
		return merged
	},
}

export default config
