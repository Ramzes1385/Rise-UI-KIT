import { Shape } from 'three'
import { objectHeight } from '../sceneLayout'
import type { ImageMap3DObject } from '../../../types/imageMap3dData.types'
import type { SceneSettings, SceneShapePart } from '../../../types/internal/imageMap3dInternal.types'
import type { ImageMapArea, ImageMapLayer, ImageMapEllipse, ImageMapRect } from '@components/BaseImageMap/types/imageMapData.types'

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

function rectShape(box: ImageMapArea, radius: number): Shape {
	const { x, y, width, height } = box
	const r = Math.min(Math.max(radius, 0), width / 2, height / 2)
	const shape = new Shape()
	shape.moveTo(x + r, y)
	shape.lineTo(x + width - r, y)
	shape.quadraticCurveTo(x + width, y, x + width, y + r)
	shape.lineTo(x + width, y + height - r)
	shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
	shape.lineTo(x + r, y + height)
	shape.quadraticCurveTo(x, y + height, x, y + height - r)
	shape.lineTo(x, y + r)
	shape.quadraticCurveTo(x, y, x + r, y)
	return shape
}

function ellipseShape(center: [number, number], radius: [number, number]): Shape {
	const shape = new Shape()
	shape.absellipse(center[0], center[1], radius[0], radius[1], 0, Math.PI * 2, false, 0)
	return shape
}

function polygonShape(points: [number, number][], layer: ImageMapLayer): Shape | null {
	const isValid = points.length >= 3 && points.every(point => isFiniteNumber(point[0]) && isFiniteNumber(point[1]))
	if (!isValid) return null
	const shape = new Shape()
	points.forEach(([x, y], index) => {
		if (index === 0) shape.moveTo(x * layer.width, y * layer.height)
		else shape.lineTo(x * layer.width, y * layer.height)
	})
	shape.closePath()
	return shape
}

function areNumbers(...values: unknown[]): boolean {
	return values.every(isFiniteNumber)
}

function rectFromObject(object: ImageMapRect, layer: ImageMapLayer): Shape | null {
	if (!areNumbers(object.x, object.y, object.width, object.height) || object.width <= 0 || object.height <= 0) return null
	const box = {
		x: object.x * layer.width,
		y: object.y * layer.height,
		width: object.width * layer.width,
		height: object.height * layer.height,
	}
	return rectShape(box, (object.radius ?? 0) * layer.width)
}

function ellipseFromObject(object: ImageMapEllipse, layer: ImageMapLayer): Shape | null {
	if (!areNumbers(object.x, object.y, object.rx, object.ry) || object.rx <= 0 || object.ry <= 0) return null
	return ellipseShape([object.x * layer.width, object.y * layer.height], [object.rx * layer.width, object.ry * layer.height])
}

function createShape(object: ImageMap3DObject, layer: ImageMapLayer): Shape | null {
	if (object.type === 'rect') return rectFromObject(object, layer)
	if (object.type === 'ellipse') return ellipseFromObject(object, layer)
	if (object.type === 'polygon') return Array.isArray(object.points) ? polygonShape(object.points, layer) : null
	return null
}

export function objectShapes(object: ImageMap3DObject, layer: ImageMapLayer): Shape[] {
	const shape = createShape(object, layer)
	return shape ? [shape] : []
}

export function objectParts(object: ImageMap3DObject, layer: ImageMapLayer, settings: SceneSettings): SceneShapePart[] {
	return [{ shapes: objectShapes(object, layer), height: objectHeight(object, settings), base: 0 }]
}
