import type { ShapeGeometry } from '../../types/internal/imageMapInternal.types'
import type { ImageMapArea, ImageMapLayer, ImageMapObject } from '../../types/imageMapData.types'

export function shapeGeometry(object: ImageMapObject, layer: ImageMapLayer): ShapeGeometry | undefined {
	const { width, height } = layer
	if (object.type === 'rect') {
		const radius = (object.radius ?? 0) * width
		return {
			tag: 'rect',
			attributes: {
				x: object.x * width,
				y: object.y * height,
				width: object.width * width,
				height: object.height * height,
				rx: radius,
			},
		}
	}
	if (object.type === 'ellipse') {
		return {
			tag: 'ellipse',
			attributes: { cx: object.x * width, cy: object.y * height, rx: object.rx * width, ry: object.ry * height },
		}
	}
	if (object.type === 'polygon') {
		return { tag: 'polygon', attributes: { points: object.points.map(([x, y]) => `${x * width},${y * height}`).join(' ') } }
	}
	return undefined
}

function polygonArea(points: [number, number][]): ImageMapArea {
	const xs = points.map(point => point[0])
	const ys = points.map(point => point[1])
	const x = Math.min(...xs)
	const y = Math.min(...ys)
	return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

export function objectArea(object: ImageMapObject): ImageMapArea | undefined {
	if (object.type === 'point') return { x: object.x, y: object.y, width: 0, height: 0 }
	if (object.type === 'rect') return { x: object.x, y: object.y, width: object.width, height: object.height }
	if (object.type === 'ellipse') return { x: object.x - object.rx, y: object.y - object.ry, width: object.rx * 2, height: object.ry * 2 }
	if (object.type === 'polygon') return polygonArea(object.points)
	return undefined
}
