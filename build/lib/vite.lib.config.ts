/**
 * Конфигурация Vite для сборки npm-библиотеки (`npm run build:lib`).
 * Storybook и Vitest настроены отдельно: build/storybook/main.ts и build/tests/vitest.config.ts.
 */

import { defineConfig } from 'vite'
import { createLibBuildConfig } from '../config/build.lib'
import { createCssConfig } from '../config/css'
import { createResolveConfig } from '../config/resolve'
import { createPlugins } from '../plugins'

export default defineConfig(({ mode }) => ({
	resolve: createResolveConfig(),
	css: createCssConfig(mode),
	plugins: createPlugins(mode),
	build: createLibBuildConfig(),
	// Каталога public/ у библиотеки нет: в dist попадает только собранный код, стили и спрайт
	publicDir: false,
}))
