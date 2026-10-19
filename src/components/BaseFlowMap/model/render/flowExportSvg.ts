import { shapeView } from './shapes/flowShapes'
import type { FlowRect } from '../../types/data/flowData.types'
import type { FlowExportImageOptions } from '../../types/api/flowController.types'
import type { FlowExportPalette, FlowExportScene } from '../../types/internal/core/flowRenderInternal.types'

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const PADDING = 24
const TOKENS = {
	bg: '--rise-bg-muted',
	node: '--rise-bg',
	border: '--rise-border-accented',
	text: '--rise-text',
	muted: '--rise-text-muted',
}
const FALLBACKS = { bg: '#f6f6f7', node: '#ffffff', border: '#c4c7cc', text: '#2b2f36', muted: '#6b7280' }

const DASH = { solid: '', dashed: ' stroke-dasharray="6 4"', dotted: ' stroke-dasharray="2 4"' }

function escape(text: string): string {
	return text.replace(/[&<>"]/g, char => ENTITIES[char])
}

function paletteOf(root: Element | null): FlowExportPalette {
	const style = root && typeof getComputedStyle !== 'undefined' ? getComputedStyle(root) : null
	const entries = Object.entries(TOKENS).map(([key, token]) => [
		key,
		style?.getPropertyValue(token).trim() || FALLBACKS[key as keyof typeof FALLBACKS],
	])
	return Object.fromEntries(entries) as FlowExportPalette
}

function areaOf(scene: FlowExportScene, options?: FlowExportImageOptions): FlowRect {
	if (options?.area === 'viewport') {
		const { viewport, frame } = scene
		return {
			x: -viewport.x / viewport.zoom,
			y: -viewport.y / viewport.zoom,
			width: frame.width / viewport.zoom,
			height: frame.height / viewport.zoom,
		}
	}
	const { bounds } = scene
	return { x: bounds.x - PADDING, y: bounds.y - PADDING, width: bounds.width + PADDING * 2, height: bounds.height + PADDING * 2 }
}

function groupsOf(scene: FlowExportScene, colors: FlowExportPalette): string {
	return scene.groups
		.map(
			({ rect, group, border }) =>
				`<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" rx="12" fill="none" stroke="${colors.border}"${border === 'dashed' ? ' stroke-dasharray="6 4"' : ''}/>` +
				`<text x="${rect.x + 12}" y="${rect.y + 20}" font-size="12" fill="${colors.muted}">${escape(group.label)}</text>`,
		)
		.join('')
}

function edgesOf(scene: FlowExportScene, colors: FlowExportPalette): string {
	return scene.edges
		.map(({ route, kind, markerEnd, markerStart }) => {
			const dash = DASH[kind.stroke]
			const end = markerEnd ? ` marker-end="url(#${scene.uid}-${markerEnd})"` : ''
			const start = markerStart ? ` marker-start="url(#${scene.uid}-${markerStart})"` : ''
			return `<path d="${route.path}" fill="none" stroke="${colors.border}" stroke-width="1.5"${dash}${end}${start}/>`
		})
		.join('')
}

function markersOf(scene: FlowExportScene, colors: FlowExportPalette): string {
	return scene.markers
		.map(marker => {
			const paint = marker.isFilled ? `fill="${colors.border}"` : `fill="none" stroke="${colors.border}"`
			const body = marker.paths.map(path => `<path d="${path}" ${paint}/>`).join('')
			return `<marker id="${scene.uid}-${marker.id}" viewBox="0 0 10 10" refX="${marker.refX}" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">${body}</marker>`
		})
		.join('')
}

function nodesOf(scene: FlowExportScene, colors: FlowExportPalette): string {
	return scene.nodes
		.map(({ rect, node, kind }) => {
			const shape = shapeView(kind.shape, rect)
			const inner = shape.inner ? `<path d="${shape.inner}" fill="none" stroke="${colors.border}"/>` : ''
			return (
				`<g transform="translate(${rect.x} ${rect.y})"><path d="${shape.path}" fill="${colors.node}" stroke="${colors.border}"/>${inner}` +
				`<text x="${rect.width / 2}" y="${rect.height / 2 + 4}" text-anchor="middle" font-size="13" fill="${colors.text}">${escape(node.label)}</text></g>`
			)
		})
		.join('')
}

function labelsOf(scene: FlowExportScene, colors: FlowExportPalette): string {
	return scene.labels
		.map(
			({ point, text }) =>
				`<text x="${point.x}" y="${point.y + 4}" text-anchor="middle" font-size="11" fill="${colors.muted}">${escape(text)}</text>`,
		)
		.join('')
}

export function buildSceneSvg(scene: FlowExportScene, options?: FlowExportImageOptions): string {
	const colors = paletteOf(scene.root)
	const area = areaOf(scene, options)
	const background =
		options?.background === 'transparent'
			? ''
			: `<rect x="${area.x}" y="${area.y}" width="${area.width}" height="${area.height}" fill="${colors.bg}"/>`
	const body = `<defs>${markersOf(scene, colors)}</defs>${background}${groupsOf(scene, colors)}${edgesOf(scene, colors)}${nodesOf(scene, colors)}${labelsOf(scene, colors)}`
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${area.width}" height="${area.height}" viewBox="${area.x} ${area.y} ${area.width} ${area.height}" font-family="sans-serif">${body}</svg>`
}

function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image()
		image.onload = () => resolve(image)
		image.onerror = () => reject(new Error('svg'))
		image.src = url
	})
}

export async function buildScenePng(scene: FlowExportScene, options?: FlowExportImageOptions): Promise<Blob> {
	const area = areaOf(scene, options)
	const ratio = options?.pixelRatio ?? 2
	const url = URL.createObjectURL(new Blob([buildSceneSvg(scene, options)], { type: 'image/svg+xml' }))
	try {
		const image = await loadImage(url)
		const canvas = document.createElement('canvas')
		canvas.width = Math.max(1, Math.round(area.width * ratio))
		canvas.height = Math.max(1, Math.round(area.height * ratio))
		canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
		return await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob ?? new Blob([], { type: 'image/png' })), 'image/png'))
	} finally {
		URL.revokeObjectURL(url)
	}
}
