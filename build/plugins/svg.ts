/**
 * SVG: загрузка как Vue-компонент + SVGO-оптимизация.
 * Удаляет мусор из SVG (metadata, editor tags), сохраняет viewBox.
 */

import type { PluginOption } from 'vite'
import svgLoader from 'vite-svg-loader'

/** Создаёт плагин SVG-загрузчика */
export function createSvgPlugin(): PluginOption {
	return svgLoader({
		defaultImport: 'component',
		svgo: true,
		svgoConfig: {
			multipass: true,
			plugins: [
				{
					name: 'preset-default',
					params: {
						overrides: {
							removeViewBox: false,
						},
					},
				},
			],
		},
	})
}
