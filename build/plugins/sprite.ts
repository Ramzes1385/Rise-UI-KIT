/**
 * Vite-плагин генерации SVG-спрайта из src/icons/svg.
 *
 * Production: спрайт эмитится в dist/icons.svg через this.emitFile() — без записи в public/.
 * Development: спрайт раздаётся middleware-ом по адресу /icons.svg (in-memory, без файла на диске).
 * HMR: при изменении SVG отправляется full-reload, спрайт пересобирается лениво при следующем запросе.
 *
 * Путь SPRITE_PATH относительный — корректно работает в любом base:
 * Vite dev, Storybook dev, Storybook build под подпапкой (GH Pages: /Rise-UI-KIT/).
 */

import fs from 'node:fs'
import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'

interface SvgSymbol {
	id: string
	content: string
}

const SVG_DIR = 'src/icons/svg'
const SPRITE_FILE_NAME = 'icons.svg'
/** Относительный путь — резолвится относительно base URL текущего документа. */
const SPRITE_PATH = 'icons.svg'
/** Абсолютный путь для dev-middleware — Vite слушает его на корне сервера. */
const SPRITE_DEV_URL = `/${SPRITE_FILE_NAME}`
const ROOT_ATTRIBUTES = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin']

function getSvgId(filePath: string): string {
	return path.basename(filePath, '.svg')
}

function getViewBox(source: string): string {
	const viewMatch = source.match(/viewBox="([^"]+)"/)
	return viewMatch?.[1] ?? ''
}

function getSvgTag(source: string): string {
	const tagMatch = source.match(/<svg\s+([^>]*)>/)
	return tagMatch?.[1] ?? ''
}

function getAttr(source: string, name: string): string {
	const attrMatch = source.match(new RegExp(`${name}="([^"]+)"`))
	return attrMatch?.[1] ?? ''
}

function getSymbolAttr(source: string, name: string): string {
	const value = getAttr(source, name)
	if (!value) return ''
	return `${name}="${value}"`
}

function getSymbolAttrs(source: string): string {
	const svgTag = getSvgTag(source)
	const attrs = ROOT_ATTRIBUTES.map(name => getSymbolAttr(svgTag, name)).filter(Boolean)
	if (!attrs.length) return ''
	return ` ${attrs.join(' ')}`
}

function getSvgInner(source: string): string | null {
	const innerMatch = source.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)
	return innerMatch?.[1]?.trim() ?? null
}

function createSymbol(filePath: string): SvgSymbol | null {
	const source = fs.readFileSync(filePath, 'utf-8')
	const inner = getSvgInner(source)

	if (!inner) return null

	const id = getSvgId(filePath)
	const viewBox = getViewBox(source)
	const attrs = getSymbolAttrs(source)

	return {
		id,
		content: `<symbol id="${id}" viewBox="${viewBox}"${attrs}>${inner}</symbol>`,
	}
}

function readSvgFiles(): string[] {
	if (!fs.existsSync(SVG_DIR)) return []
	return fs.readdirSync(SVG_DIR).filter(file => file.endsWith('.svg'))
}

function generateSprite(): string {
	const symbols = readSvgFiles()
		.map(file => createSymbol(path.join(SVG_DIR, file)))
		.filter((symbol): symbol is SvgSymbol => Boolean(symbol))
		.map(symbol => symbol.content)

	return `<svg xmlns="http://www.w3.org/2000/svg">\n  ${symbols.join('\n  ')}\n</svg>`
}

function attachDevMiddleware(server: ViteDevServer): void {
	server.middlewares.use(SPRITE_DEV_URL, (_req, res) => {
		res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
		res.setHeader('Cache-Control', 'no-cache')
		res.end(generateSprite())
	})
}

/** Создаёт плагин генерации SVG-спрайта. */
export function createSpritePlugin(): Plugin {
	return {
		name: 'svg-sprite-generator',

		configureServer(server): void {
			attachDevMiddleware(server)
		},

		generateBundle(): void {
			this.emitFile({
				type: 'asset',
				fileName: SPRITE_FILE_NAME,
				source: generateSprite(),
			})
		},

		transformIndexHtml(): { tag: 'link'; attrs: Record<string, string>; injectTo: 'head' }[] {
			return [
				{
					tag: 'link',
					injectTo: 'head',
					attrs: {
						rel: 'preload',
						href: SPRITE_PATH,
						as: 'image',
						type: 'image/svg+xml',
						crossorigin: 'anonymous',
					},
				},
			]
		},

		handleHotUpdate({ file, server }): void {
			if (!file.startsWith(path.resolve(SVG_DIR))) return
			server.ws.send({ type: 'full-reload' })
		},
	}
}
