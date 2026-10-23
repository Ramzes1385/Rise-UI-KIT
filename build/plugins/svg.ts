/** SVGO удаляет мусор из SVG (metadata, editor tags), сохраняет viewBox. */

import type { PluginOption } from 'vite'
import svgLoader from 'vite-svg-loader'

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
