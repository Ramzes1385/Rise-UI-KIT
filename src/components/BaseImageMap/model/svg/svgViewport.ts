import type { SvgAspectRatio, SvgLayerMapping, SvgLayerSize, SvgViewBox } from '../../types/internal/svgViewport.types'

const ALIGN: Record<string, number> = { min: 0, mid: 0.5, max: 1 }
const UNIT_TO_PX: Record<string, number> = { '': 1, px: 1, in: 96, cm: 96 / 2.54, mm: 96 / 25.4, pt: 96 / 72, pc: 16 }
const LENGTH_PATTERN = /^\s*(\d*\.?\d+(?:e[+-]?\d+)?)\s*([a-z%]*)\s*$/i
const ALIGN_PATTERN = /^x(min|mid|max)y(min|mid|max)$/i
const IDENTITY: SvgLayerMapping = { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 }
const DEFAULT_ASPECT: SvgAspectRatio = { alignX: 0.5, alignY: 0.5, isNone: false, isSlice: false }

function isPositive(value: number): boolean {
	return Number.isFinite(value) && value > 0
}

function unsignedZero(value: number): number {
	return value || 0
}

export function parseViewBox(value: string | null | undefined): SvgViewBox | null {
	const parts = (value ?? '')
		.trim()
		.split(/[\s,]+/)
		.map(Number)
	if (parts.length !== 4 || parts.some(part => !Number.isFinite(part))) return null
	const [x, y, width, height] = parts
	return width > 0 && height > 0 ? { x, y, width, height } : null
}

export function parseSvgLength(value: string | null | undefined): number | null {
	const match = LENGTH_PATTERN.exec(value ?? '')
	const factor = match ? UNIT_TO_PX[match[2].toLowerCase()] : undefined
	const length = match && factor ? Number(match[1]) * factor : 0
	return isPositive(length) ? length : null
}

export function parseAspectRatio(value: string | null | undefined): SvgAspectRatio {
	const [align = '', mode = ''] = (value ?? '')
		.trim()
		.split(/\s+/)
		.filter(token => token !== 'defer')
	if (align === 'none') return { alignX: 0, alignY: 0, isNone: true, isSlice: false }
	const match = ALIGN_PATTERN.exec(align)
	if (!match) return DEFAULT_ASPECT
	return { alignX: ALIGN[match[1].toLowerCase()], alignY: ALIGN[match[2].toLowerCase()], isNone: false, isSlice: mode === 'slice' }
}

export function isValidLayerSize(layer: SvgLayerSize): boolean {
	return isPositive(layer.width) && isPositive(layer.height)
}

export function svgViewBox(root: Element, layer: SvgLayerSize): SvgViewBox {
	const box = parseViewBox(root.getAttribute('viewBox'))
	if (box) return box
	const width = parseSvgLength(root.getAttribute('width'))
	const height = parseSvgLength(root.getAttribute('height'))
	return width && height ? { x: 0, y: 0, width, height } : { x: 0, y: 0, width: layer.width, height: layer.height }
}

export function ensureViewBox(root: Element, layer: SvgLayerSize): void {
	if (root.hasAttribute('viewBox') && parseViewBox(root.getAttribute('viewBox'))) return
	const hasOwnSize = Boolean(parseSvgLength(root.getAttribute('width')) && parseSvgLength(root.getAttribute('height')))
	if (!hasOwnSize && !isValidLayerSize(layer)) return
	const box = svgViewBox(root, layer)
	root.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`)
}

export function svgLayerMapping(root: Element, layer: SvgLayerSize): SvgLayerMapping {
	if (!isValidLayerSize(layer)) return IDENTITY
	const box = svgViewBox(root, layer)
	const ratio = parseAspectRatio(root.getAttribute('preserveAspectRatio'))
	const fitX = layer.width / box.width
	const fitY = layer.height / box.height
	if (ratio.isNone) return { scaleX: fitX, scaleY: fitY, offsetX: unsignedZero(-box.x * fitX), offsetY: unsignedZero(-box.y * fitY) }
	const scale = ratio.isSlice ? Math.max(fitX, fitY) : Math.min(fitX, fitY)
	return {
		scaleX: scale,
		scaleY: scale,
		offsetX: unsignedZero((layer.width - box.width * scale) * ratio.alignX - box.x * scale),
		offsetY: unsignedZero((layer.height - box.height * scale) * ratio.alignY - box.y * scale),
	}
}

export function mappingTransform(mapping: SvgLayerMapping): string | null {
	const { scaleX, scaleY, offsetX, offsetY } = mapping
	const isIdentity = scaleX === 1 && scaleY === 1 && offsetX === 0 && offsetY === 0
	return isIdentity ? null : `translate(${offsetX} ${offsetY}) scale(${scaleX} ${scaleY})`
}
