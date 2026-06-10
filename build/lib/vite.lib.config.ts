/**
 * Конфигурация Vite для npm library build.
 * Не используется для dev/storybook/playground.
 */

import { defineConfig } from 'vite'
import { createLibBuildConfig } from '../config/build.lib'
import { createCssConfig } from '../config/css'
import { createResolveConfig } from '../config/resolve'
import { createPlugins } from '../plugins'

export default defineConfig(({ mode }) => ({
	resolve: createResolveConfig(),
	css: createCssConfig(mode),
	plugins: createPlugins(mode, { target: 'lib' }),
	build: createLibBuildConfig(),
}))
