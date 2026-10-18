import type { FlowViewport } from '../../types/api/flowController.types'
import type { FlowRect, FlowSize } from '../../types/data/flowData.types'
import type { FlowZoomLimits, FlowZoomStep } from '../../types/internal/core/flowRenderInternal.types'

export const FIT_PADDING = 32
export const DEFAULT_VIEWPORT: FlowViewport = { x: 0, y: 0, zoom: 1 }

export function clampZoom(zoom: number, limits: FlowZoomLimits): number {
	return Math.min(limits.max, Math.max(limits.min, zoom))
}

export function zoomAt(viewport: FlowViewport, { factor, anchor }: FlowZoomStep, limits: FlowZoomLimits): FlowViewport {
	const zoom = clampZoom(viewport.zoom * factor, limits)
	const ratio = zoom / viewport.zoom
	return { zoom, x: anchor.x - (anchor.x - viewport.x) * ratio, y: anchor.y - (anchor.y - viewport.y) * ratio }
}

export function centerViewport(rect: FlowRect, frame: FlowSize, zoom: number): FlowViewport {
	return {
		zoom,
		x: frame.width / 2 - (rect.x + rect.width / 2) * zoom,
		y: frame.height / 2 - (rect.y + rect.height / 2) * zoom,
	}
}

export function fitViewport(bounds: FlowRect, frame: FlowSize, fit: { padding: number; limits: FlowZoomLimits }): FlowViewport {
	const { padding, limits } = fit
	if (bounds.width <= 0 || bounds.height <= 0 || frame.width <= 0 || frame.height <= 0) return DEFAULT_VIEWPORT
	const fitted = Math.min((frame.width - padding * 2) / bounds.width, (frame.height - padding * 2) / bounds.height)
	return centerViewport(bounds, frame, clampZoom(Math.min(1, fitted), limits))
}

export function boundsOf(rects: readonly FlowRect[]): FlowRect | null {
	if (rects.length === 0) return null
	const left = Math.min(...rects.map(rect => rect.x))
	const top = Math.min(...rects.map(rect => rect.y))
	const right = Math.max(...rects.map(rect => rect.x + rect.width))
	const bottom = Math.max(...rects.map(rect => rect.y + rect.height))
	return { x: left, y: top, width: right - left, height: bottom - top }
}

function visibleRect(viewport: FlowViewport, frame: FlowSize, margin: number): FlowRect {
	return {
		x: -viewport.x / viewport.zoom - margin,
		y: -viewport.y / viewport.zoom - margin,
		width: frame.width / viewport.zoom + margin * 2,
		height: frame.height / viewport.zoom + margin * 2,
	}
}

function intersects(first: FlowRect, second: FlowRect): boolean {
	return (
		first.x < second.x + second.width &&
		first.x + first.width > second.x &&
		first.y < second.y + second.height &&
		first.y + first.height > second.y
	)
}

export function mixViewport(from: FlowViewport, to: FlowViewport, progress: number): FlowViewport {
	return {
		x: from.x + (to.x - from.x) * progress,
		y: from.y + (to.y - from.y) * progress,
		zoom: from.zoom + (to.zoom - from.zoom) * progress,
	}
}

export function isRevealed(rect: FlowRect, viewport: FlowViewport, frame: FlowSize): boolean {
	return intersects(rect, visibleRect(viewport, frame, -16))
}
