/** Storybook и Vitest настроены отдельно — build/storybook/main.ts и build/tests/vitest.config.ts. */

import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { createLibBuildConfig } from '../config/build.lib'
import { createCssConfig } from '../config/css'
import { createResolveConfig } from '../config/resolve'
import { createPlugins } from '../plugins'
import { createCssDedupePlugin } from '../plugins/cssDedupe'
import { createCssSplitPlugins } from '../plugins/cssSplit'

/** `@ramzes1385/rise-ui-kit/styles.layer.css`: весь кит в слое `rise` — стили приложения без слоя сильнее без `!important` */
const LAYER_CSS = "@import url('./styles.css') layer(rise);\n"

/** `@ramzes1385/rise-ui-kit/media.layer.css`: стили плеера (`media.css`, их собирает vite.media-css.config.ts) в том же слое `rise` */
const MEDIA_LAYER_CSS = "@import url('./media.css') layer(rise);\n"

/**
 * Типы для `import '@ramzes1385/rise-ui-kit/styles'` (exports в package.json): без них TypeScript у потребителя
 * не находит объявление модуля стилей (то же объявление у `media.css`). Файл кладётся в dist вместе со сборкой.
 */
function createStylesTypesPlugin(): Plugin {
	return {
		name: 'rise:styles-types',
		generateBundle() {
			this.emitFile({ type: 'asset', fileName: 'styles.d.ts', source: 'declare const styles: string\n\nexport default styles\n' })
			this.emitFile({ type: 'asset', fileName: 'styles.layer.css', source: LAYER_CSS })
			this.emitFile({ type: 'asset', fileName: 'media.layer.css', source: MEDIA_LAYER_CSS })
		},
	}
}

export default defineConfig(({ mode }) => ({
	resolve: createResolveConfig(),
	css: createCssConfig(mode),
	plugins: [...createPlugins(mode), ...createCssSplitPlugins('exclude'), createStylesTypesPlugin(), createCssDedupePlugin()],
	build: createLibBuildConfig(),
	// Каталога public/ у библиотеки нет: в dist попадает только собранный код, стили и спрайт
	publicDir: false,
}))
