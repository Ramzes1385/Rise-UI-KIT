import { objectArea } from '@components/BaseImageMap/model/data/shapeGeometry'
import type { EditorHandle, EditorPoint } from '../../types/imageMapEditorInternal.types'
import type { ImageMapArea, ImageMapObject } from '@components/BaseImageMap/types/imageMapData.types'

const PRECISION = 10_000
const MIN_SIZE = 0.005
const CLICK_SIZE = 0.01
const DEFAULT_SIZE = 0.1

export function round(value: number): number {
	return Math.round(value * PRECISION) / PRECISION
}

export function clamp(value: number, min = 0, max = 1): number {
	return Math.min(max, Math.max(min, value))
}

export function clampPoint(point: EditorPoint): EditorPoint {
	return { x: round(clamp(point.x)), y: round(clamp(point.y)) }
}

function boundsFromCorners(a: EditorPoint, b: EditorPoint): ImageMapArea {
	const x = clamp(Math.min(a.x, b.x))
	const y = clamp(Math.min(a.y, b.y))
	return {
		x,
		y,
		width: Math.max(MIN_SIZE, clamp(Math.max(a.x, b.x)) - x),
		height: Math.max(MIN_SIZE, clamp(Math.max(a.y, b.y)) - y),
	}
}

function clickBounds(point: EditorPoint): ImageMapArea {
	const half = DEFAULT_SIZE / 2
	return {
		x: clamp(point.x - half, 0, 1 - DEFAULT_SIZE),
		y: clamp(point.y - half, 0, 1 - DEFAULT_SIZE),
		width: DEFAULT_SIZE,
		height: DEFAULT_SIZE,
	}
}

export function dragBounds(start: EditorPoint, end: EditorPoint): ImageMapArea {
	const isClick = Math.abs(end.x - start.x) < CLICK_SIZE && Math.abs(end.y - start.y) < CLICK_SIZE
	return isClick ? clickBounds(start) : boundsFromCorners(start, end)
}

function polygonBounds(points: [number, number][], bounds: ImageMapArea, next: ImageMapArea): [number, number][] {
	const scaleX = bounds.width ? next.width / bounds.width : 1
	const scaleY = bounds.height ? next.height / bounds.height : 1
	return points.map(([x, y]) => [round(next.x + (x - bounds.x) * scaleX), round(next.y + (y - bounds.y) * scaleY)])
}

function setBounds(object: ImageMapObject, next: ImageMapArea): void {
	const bounds = objectArea(object)
	if (!bounds) return
	if (object.type === 'rect')
		Object.assign(object, { x: round(next.x), y: round(next.y), width: round(next.width), height: round(next.height) })
	if (object.type === 'ellipse') {
		Object.assign(object, {
			x: round(next.x + next.width / 2),
			y: round(next.y + next.height / 2),
			rx: round(next.width / 2),
			ry: round(next.height / 2),
		})
	}
	if (object.type === 'polygon') object.points = polygonBounds(object.points, bounds, next)
}

export function translateObject(object: ImageMapObject, delta: EditorPoint): void {
	const bounds = objectArea(object)
	if (!bounds || object.type === 'svg') return
	const dx = clamp(delta.x, -bounds.x, 1 - bounds.x - bounds.width)
	const dy = clamp(delta.y, -bounds.y, 1 - bounds.y - bounds.height)
	if (object.type === 'polygon') object.points = object.points.map(([x, y]) => [round(x + dx), round(y + dy)])
	else Object.assign(object, { x: round(object.x + dx), y: round(object.y + dy) })
}

function corners(bounds: ImageMapArea): EditorHandle[] {
	const { x, y, width, height } = bounds
	return [
		{ index: 0, x, y },
		{ index: 1, x: x + width, y },
		{ index: 2, x: x + width, y: y + height },
		{ index: 3, x, y: y + height },
	]
}

export function objectHandles(object: ImageMapObject): EditorHandle[] {
	if (object.type === 'polygon') return object.points.map(([x, y], index) => ({ index, x, y }))
	const bounds = object.type === 'rect' || object.type === 'ellipse' ? objectArea(object) : undefined
	return bounds ? corners(bounds) : []
}

export function dragHandle(object: ImageMapObject, origin: ImageMapObject, handle: { index: number; point: EditorPoint }): void {
	const point = clampPoint(handle.point)
	if (object.type === 'polygon') {
		object.points = object.points.map((vertex, index) => (index === handle.index ? [point.x, point.y] : vertex))
		return
	}
	const bounds = objectArea(origin)
	if (!bounds) return
	const opposite = corners(bounds)[(handle.index + 2) % 4] as EditorHandle
	setBounds(object, boundsFromCorners(opposite, point))
}

export function createShape(tool: 'rect' | 'ellipse', area: ImageMapArea): Partial<ImageMapObject> {
	if (tool === 'rect') return { type: 'rect', x: round(area.x), y: round(area.y), width: round(area.width), height: round(area.height) }
	return {
		type: 'ellipse',
		x: round(area.x + area.width / 2),
		y: round(area.y + area.height / 2),
		rx: round(area.width / 2),
		ry: round(area.height / 2),
	}
}
