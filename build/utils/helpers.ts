/**
 * Вспомогательные чистые функции сборки.
 * Каждая функция решает одну задачу (SRP — Чистый код, гл.3).
 * Все функции детерминированные — один вход, один выход.
 */

import { resolve } from 'node:path'

/** Определяет, является ли текущий режим production */
export function isProductionMode(mode: string): boolean {
	return mode === 'production'
}

/** Определяет, является ли текущий режим development */
export function isDevelopmentMode(mode: string): boolean {
	return mode === 'development'
}

/** Создаёт абсолютный путь относительно корня проекта */
export function resolveFromRoot(...segments: string[]): string {
	return resolve(process.cwd(), ...segments)
}

/**
 * Определяет поддиректорию ассета по расширению файла.
 * Используется в output.assetFileNames для организации dist/.
 */
export function getAssetSubdirByExtension(extname: string): string {
	const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp', '.tiff'])
	const fontExtensions = new Set(['.woff', '.woff2', '.eot', '.ttf', '.otf'])
	const mediaExtensions = new Set(['.mp4', '.webm', '.ogg', '.mp3', '.wav', '.flac', '.aac'])

	if (imageExtensions.has(extname)) return 'images'
	if (fontExtensions.has(extname)) return 'fonts'
	if (mediaExtensions.has(extname)) return 'media'

	return 'css'
}

/** Формирует шаблон имени файла для ассетов */
export function createAssetFileName(extname: string): string {
	const subdir = getAssetSubdirByExtension(extname)
	return `assets/${subdir}/[name]-[hash][extname]`
}
