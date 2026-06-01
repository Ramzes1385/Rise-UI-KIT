/**
 * Оптимизация растровых изображений при production-сборке.
 *
 * Используется vite-plugin-image-optimizer (sharp).
 */

import type { PluginOption } from 'vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { IMAGE_QUALITY } from '../constants'

/** Создаёт плагин оптимизации растровых изображений */
export function createImagePlugin(): PluginOption {
	return ViteImageOptimizer({
		test: /\.(jpe?g|png|gif|webp|avif)$/i,
		includePublic: false,
		logStats: true,
		png: {
			quality: IMAGE_QUALITY.pngQuality.max,
		},
		jpeg: {
			quality: IMAGE_QUALITY.mozjpeg,
			progressive: true,
		},
		jpg: {
			quality: IMAGE_QUALITY.mozjpeg,
			progressive: true,
		},
		webp: {
			quality: IMAGE_QUALITY.webp,
			effort: 6,
		},
		avif: {
			quality: IMAGE_QUALITY.avif,
			effort: 6,
		},
		gif: {
			colors: IMAGE_QUALITY.gif,
		},
	})
}
