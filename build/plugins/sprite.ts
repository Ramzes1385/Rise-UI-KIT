/**
 * Vite-плагин для генерации SVG-спрайта из папки src/assets/svg/.
 * На старте сборки и при изменении SVG-файлов пересоздаёт public/icons.svg.
 */

import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/** Директория с исходными SVG-файлами */
const SVG_DIR = 'src/assets/svg'

/** Путь к генерируемому спрайту */
const SPRITE_PATH = 'public/icons.svg'

/** Читает SVG-файл и извлекает содержимое тега <svg> */
function extractSvgContent(filePath: string): { id: string; content: string } | null {
	const raw = fs.readFileSync(filePath, 'utf-8')

	/** Имя файла без расширения — становится ID символа */
	const id = path.basename(filePath, '.svg')

	/** Извлекаем viewBox */
	const viewMatch = raw.match(/viewBox="([^"]+)"/)
	const viewBox = viewMatch ? viewMatch[1] : ''

	/** Извлекаем внутреннее содержимое SVG */
	const innerMatch = raw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)
	if (!innerMatch) return null

	/** Удаляем лишние атрибуты из внутреннего содержимого */
	const inner = innerMatch[1]
		.replace(/<svg[^>]*>/, '')
		.replace(/<\/svg>/, '')
		.trim()

	return {
		id,
		content: `<symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`,
	}
}

/** Генерирует содержимое спрайта из всех SVG в директории */
function generateSprite(): string {
	if (!fs.existsSync(SVG_DIR)) return '<svg xmlns="http://www.w3.org/2000/svg"></svg>'

	const files = fs.readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'))

	const symbols = files
		.map(f => extractSvgContent(path.join(SVG_DIR, f)))
		.filter(Boolean)
		.map(s => s!.content)

	return `<svg xmlns="http://www.w3.org/2000/svg">\n  ${symbols.join('\n  ')}\n</svg>`
}

/** Создаёт плагин генерации SVG-спрайта */
export function createSpritePlugin(): Plugin {
	return {
		name: 'svg-sprite-generator',

		buildStart() {
			const sprite = generateSprite()
			fs.writeFileSync(SPRITE_PATH, sprite, 'utf-8')
		},

		handleHotUpdate({ file, server }) {
			if (!file.startsWith(path.resolve(SVG_DIR))) return

			const sprite = generateSprite()
			fs.writeFileSync(SPRITE_PATH, sprite, 'utf-8')

			server.ws.send({ type: 'full-reload' })
		},
	}
}
