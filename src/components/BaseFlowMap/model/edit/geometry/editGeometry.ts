import type { FlowPoint, FlowRect } from '../../../types/data/flowData.types'
import type { FlowEditView } from '../../../types/internal/edit/flowEdit.types'

export function toCanvas(event: { clientX: number; clientY: number }, view: FlowEditView): FlowPoint {
	const { viewport, box } = view
	return {
		x: (event.clientX - (box?.left ?? 0) - viewport.x) / viewport.zoom,
		y: (event.clientY - (box?.top ?? 0) - viewport.y) / viewport.zoom,
	}
}

export function toScreen(point: FlowPoint, view: FlowEditView): FlowPoint {
	const { viewport } = view
	return { x: point.x * viewport.zoom + viewport.x, y: point.y * viewport.zoom + viewport.y }
}

export function rectBetween(first: FlowPoint, second: FlowPoint): FlowRect {
	return {
		x: Math.min(first.x, second.x),
		y: Math.min(first.y, second.y),
		width: Math.abs(first.x - second.x),
		height: Math.abs(first.y - second.y),
	}
}

export function intersects(first: FlowRect, second: FlowRect): boolean {
	return (
		first.x < second.x + second.width &&
		second.x < first.x + first.width &&
		first.y < second.y + second.height &&
		second.y < first.y + first.height
	)
}

export function containsPoint(rect: FlowRect, point: FlowPoint): boolean {
	return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height
}

export function unionOf(rects: readonly FlowRect[]): FlowRect {
	const left = Math.min(...rects.map(rect => rect.x))
	const top = Math.min(...rects.map(rect => rect.y))
	const right = Math.max(...rects.map(rect => rect.x + rect.width))
	const bottom = Math.max(...rects.map(rect => rect.y + rect.height))
	return { x: left, y: top, width: right - left, height: bottom - top }
}

export function centerOf(rect: FlowRect): FlowPoint {
	return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

export function shifted(rect: FlowRect, delta: FlowPoint): FlowRect {
	return { ...rect, x: rect.x + delta.x, y: rect.y + delta.y }
}

export function snapToGrid(value: number, grid: number): number {
	return grid > 0 ? Math.round(value / grid) * grid : value
}

export function areaOf(rect: FlowRect): number {
	return rect.width * rect.height
}
