/** Третий проход сборки пакета (после vite.lib.config.ts и vite.media-css.config.ts): `components/<Имя>/style.css` и `tokens.css` для подпутей. */

import { defineConfig } from 'vite'
import { LIB_BASE } from '../config/build.lib'
import { createSubpathCssBuildConfig } from '../config/build.subpathCss'
import { createCssConfig } from '../config/css'
import { createResolveConfig } from '../config/resolve'
import { createPlugins } from '../plugins'
import { createCssDedupePlugin } from '../plugins/cssDedupe'
import { createSubpathCssPlugins, createSubpathScssOptions } from '../plugins/subpathCss'

export default defineConfig(({ mode }) => ({
	resolve: createResolveConfig(),
	css: createCssConfig(mode, createSubpathScssOptions()),
	plugins: [...createPlugins(mode), ...createSubpathCssPlugins(), createCssDedupePlugin()],
	build: createSubpathCssBuildConfig(),
	base: LIB_BASE,
	publicDir: false,
}))
