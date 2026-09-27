/**
 * Вспомогательные чистые функции сборки.
 */

import { resolve } from 'node:path'

/** Определяет, является ли текущий режим production */
export function isProductionMode(mode: string): boolean {
	return mode === 'production'
}

/** Создаёт абсолютный путь относительно корня проекта */
export function resolveFromRoot(...segments: string[]): string {
	return resolve(process.cwd(), ...segments)
}
