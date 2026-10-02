import type { ImageSize, SvgCandidate } from '../../types/imageMapEditorInternal.types'
import { IMAGE_MAP_OBJECT_TYPES } from '@components/BaseImageMap/types/imageMapData.types'
import type { ImageMapData, ImageMapLayer } from '@components/BaseImageMap/types/imageMapData.types'

const SVG_SHAPE_TAGS = new Set(['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'g', 'line'])
const SKIPPED_PARENTS = 'defs, clipPath, mask, pattern, symbol, linearGradient, radialGradient'
const DEFAULT_SVG_SIZE = 1000

export function isSvgFile(file: File): boolean {
	return file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
}

export function fileTitle(file: File): string {
	return file.name.replace(/\.[^.]+$/, '')
}

export function readDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(String(reader.result))
		reader.onerror = () => reject(reader.error)
		reader.readAsDataURL(file)
	})
}

export function imageSize(url: string): Promise<ImageSize> {
	return new Promise((resolve, reject) => {
		const image = new Image()
		image.onload = () => resolve({ width: image.naturalWidth || DEFAULT_SVG_SIZE, height: image.naturalHeight || DEFAULT_SVG_SIZE })
		image.onerror = () => reject(new Error('image'))
		image.src = url
	})
}

export function svgSize(markup: string): ImageSize | undefined {
	const root = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
	if (root.tagName.toLowerCase() !== 'svg') return undefined
	const viewBox = (root.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number)
	const width = viewBox[2] || Number.parseFloat(root.getAttribute('width') ?? '') || DEFAULT_SVG_SIZE
	const height = viewBox[3] || Number.parseFloat(root.getAttribute('height') ?? '') || DEFAULT_SVG_SIZE
	return { width, height }
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isLayer(value: unknown): value is ImageMapLayer {
	return isRecord(value) && typeof value.id === 'string' && Number(value.width) > 0 && Number(value.height) > 0
}

function isNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value)
}

function hasNumbers(value: Record<string, unknown>, keys: string[]): boolean {
	return keys.every(key => isNumber(value[key]))
}

function isPair(value: unknown): boolean {
	return Array.isArray(value) && value.length === 2 && value.every(isNumber)
}

const SHAPE_CHECKS: Record<string, (value: Record<string, unknown>) => boolean> = {
	point: value => hasNumbers(value, ['x', 'y']),
	rect: value => hasNumbers(value, ['x', 'y', 'width', 'height']),
	ellipse: value => hasNumbers(value, ['x', 'y', 'rx', 'ry']),
	polygon: value => Array.isArray(value.points) && value.points.length >= 3 && value.points.every(isPair),
	svg: value => typeof value.elementId === 'string' && value.elementId !== '',
}

function isObject(value: unknown): boolean {
	if (!isRecord(value) || typeof value.id !== 'string' || !(IMAGE_MAP_OBJECT_TYPES as readonly unknown[]).includes(value.type))
		return false
	return SHAPE_CHECKS[value.type as string]?.(value) === true
}

function isUnique(items: unknown[]): boolean {
	const ids = items.map(item => (item as { id: string }).id)
	return new Set(ids).size === ids.length
}

function isRouteNode(value: unknown): boolean {
	return isRecord(value) && typeof value.id === 'string' && hasNumbers(value, ['x', 'y'])
}

function isRouteEdge(value: unknown): boolean {
	return Array.isArray(value) && value.length === 2 && value.every(item => typeof item === 'string')
}

function isTransition(value: unknown): boolean {
	return (
		isRecord(value) && typeof value.id === 'string' && Array.isArray(value.nodes) && value.nodes.every(item => typeof item === 'string')
	)
}

function isRoutes(value: unknown): boolean {
	if (value === undefined) return true
	if (!isRecord(value) || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) return false
	const transitions = value.transitions ?? []
	if (!Array.isArray(transitions)) return false
	return value.nodes.every(isRouteNode) && isUnique(value.nodes) && value.edges.every(isRouteEdge) && transitions.every(isTransition)
}

export function parseMap(text: string): ImageMapData | undefined {
	let value: unknown
	try {
		value = JSON.parse(text)
	} catch {
		return undefined
	}
	if (!isRecord(value) || !Array.isArray(value.layers) || !Array.isArray(value.objects)) return undefined
	if (!value.layers.every(isLayer) || !value.objects.every(isObject)) return undefined
	if (!isUnique(value.layers) || !isUnique(value.objects) || !isRoutes(value.routes)) return undefined
	return value as unknown as ImageMapData
}

export function downloadText(text: string, fileName: string): void {
	const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
	const link = document.createElement('a')
	link.href = url
	link.download = fileName
	link.click()
	setTimeout(() => URL.revokeObjectURL(url))
}

export function svgCandidates(container: HTMLElement | null, prefix: string, taken: Set<string>): SvgCandidate[] {
	if (!container) return []
	return [...container.querySelectorAll(`[id^="${prefix}"]`)]
		.filter(element => SVG_SHAPE_TAGS.has(element.tagName.toLowerCase()) && !element.parentElement?.closest(SKIPPED_PARENTS))
		.map(element => {
			const elementId = element.id.slice(prefix.length)
			const title = element.querySelector(':scope > title')?.textContent?.trim()
			return { elementId, title: title || elementId }
		})
		.filter(candidate => !taken.has(candidate.elementId))
}
