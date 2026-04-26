/**
 * Оптимизация растровых изображений.
 * Сжимает PNG, JPEG, WebP, GIF при сборке.
 */

import type { PluginOption } from 'vite'
import imagemin from 'vite-plugin-imagemin'
import { IMAGE_QUALITY } from '../constants'

/** Создаёт плагин оптимизации изображений */
export function createImagePlugin(): PluginOption {
	return imagemin({
		gifsicle: {
			optimizationLevel: 3,
			interlaced: true,
			colors: IMAGE_QUALITY.gif,
		},

		optipng: {
			optimizationLevel: 7,
		},

		mozjpeg: {
			quality: IMAGE_QUALITY.mozjpeg,
			progressive: true,
		},

		pngquant: {
			quality: [IMAGE_QUALITY.pngQuality.min / 100, IMAGE_QUALITY.pngQuality.max / 100],
			speed: 4,
		},

		webp: {
			quality: IMAGE_QUALITY.webp,
			method: 6,
		},

		svgo: false,
	})
}
