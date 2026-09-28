/** `--analyze` добавляет отчёт о размере бандла (stats.html). */

import { visualizer } from 'rollup-plugin-visualizer'
import type { PluginOption } from 'vite'
import { createSpritePlugin } from './sprite'
import { createSvgPlugin } from './svg'
import { createVuePlugin } from './vue'

export function createPlugins(mode: string): PluginOption[] {
	const plugins: PluginOption[] = [createVuePlugin(mode), createSvgPlugin(), createSpritePlugin()]

	if (process.argv.includes('--analyze')) {
		plugins.push(
			visualizer({
				filename: 'stats.html',
				open: true,
				gzipSize: true,
				brotliSize: true,
				template: 'treemap',
			}) as PluginOption,
		)
	}

	return plugins
}
