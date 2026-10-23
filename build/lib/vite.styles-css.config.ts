/** Второй проход сборки пакета: `dist/styles.css` — входы и чанки как до подпутей (createLibBuildConfig без них), стили плеера исключены. */

import { defineConfig } from 'vite'
import { createLibBuildConfig, LIB_BASE } from '../config/build.lib'
import { createCssConfig } from '../config/css'
import { createResolveConfig } from '../config/resolve'
import { createPlugins } from '../plugins'
import { createCssDedupePlugin } from '../plugins/cssDedupe'
import { createCssSplitPlugins, createKeepCssPlugin } from '../plugins/cssSplit'

export default defineConfig(({ mode }) => ({
	resolve: createResolveConfig(),
	css: createCssConfig(mode),
	plugins: [...createPlugins(mode), ...createCssSplitPlugins('exclude'), createCssDedupePlugin(), createKeepCssPlugin('styles.css')],
	build: createLibBuildConfig({ withSubpaths: false }),
	base: LIB_BASE,
	publicDir: false,
}))
