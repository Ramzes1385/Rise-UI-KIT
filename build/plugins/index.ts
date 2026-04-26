/**
 * Агрегатор плагинов.
 * Собирает все плагины в единый массив.
 */

import { visualizer } from 'rollup-plugin-visualizer'
import type { PluginOption } from 'vite'
import { isProductionMode } from '../utils/helpers'
import { createCompressionPlugins } from './compression'
import { createImagePlugin } from './images'
import { createSpritePlugin } from './sprite'
import { createSvgPlugin } from './svg'
import { createVuePlugin } from './vue'

/** Создаёт массив плагинов в зависимости от режима сборки */
export function createPlugins(mode: string): PluginOption[] {
	const isProduction = isProductionMode(mode)

	const plugins: PluginOption[] = [createVuePlugin(mode), createSvgPlugin(), createSpritePlugin()]

	if (isProduction) {
		plugins.push(createImagePlugin(), ...createCompressionPlugins())
	}

	const isAnalyze = process.argv.includes('--analyze')
	if (isAnalyze) {
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
