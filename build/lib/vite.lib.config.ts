/** Storybook и Vitest настроены отдельно — build/storybook/main.ts и build/tests/vitest.config.ts. */

import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { createLibBuildConfig } from '../config/build.lib'
import { createCssConfig } from '../config/css'
import { createResolveConfig } from '../config/resolve'
import { createPlugins } from '../plugins'

/**
 * Типы для `import '@ramzes1385/rise-ui-kit/styles'` (exports в package.json): без них TypeScript у потребителя
 * не находит объявление модуля стилей. Файл кладётся в dist вместе со сборкой.
 */
function createStylesTypesPlugin(): Plugin {
	return {
		name: 'rise:styles-types',
		generateBundle() {
			this.emitFile({ type: 'asset', fileName: 'styles.d.ts', source: 'declare const styles: string\n\nexport default styles\n' })
		},
	}
}

export default defineConfig(({ mode }) => ({
	resolve: createResolveConfig(),
	css: createCssConfig(mode),
	plugins: [...createPlugins(mode), createStylesTypesPlugin()],
	build: createLibBuildConfig(),
	// Каталога public/ у библиотеки нет: в dist попадает только собранный код, стили и спрайт
	publicDir: false,
}))
