/** Второй проход сборки пакета (после vite.lib.config.ts): `dist/media.css` — стили плеера, вынесенные из `dist/styles.css`. */

import { defineConfig } from 'vite'
import { createMediaCssBuildConfig } from '../config/build.mediaCss'
import { createCssConfig } from '../config/css'
import { createResolveConfig } from '../config/resolve'
import { createPlugins } from '../plugins'
import { createCssDedupePlugin } from '../plugins/cssDedupe'
import { createCssSplitPlugins } from '../plugins/cssSplit'

export default defineConfig(({ mode }) => ({
	resolve: createResolveConfig(),
	css: createCssConfig(mode),
	plugins: [...createPlugins(mode), ...createCssSplitPlugins('only'), createCssDedupePlugin()],
	build: createMediaCssBuildConfig(),
	publicDir: false,
}))
