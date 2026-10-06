import { ExtrudeGeometry } from 'three'
import type { Shape, Vector2 } from 'three'
import type { SceneBody } from '../../../types/internal/imageMap3dInternal.types'

const MIN_HEIGHT = 0.5
const CURVE_SEGMENTS = 24
const BEVEL_SEGMENTS = 2
const BEVEL_HEIGHT_SHARE = 0.25
const BEVEL_WIDTH_SHARE = 0.5

function ringArea(points: Vector2[]): number {
	const doubled = points.reduce((sum, point, index) => {
		const next = points[(index + 1) % points.length]
		return sum + point.x * next.y - next.x * point.y
	}, 0)
	return Math.abs(doubled) / 2
}

function ringLength(points: Vector2[]): number {
	return points.reduce((sum, point, index) => sum + point.distanceTo(points[(index + 1) % points.length]), 0)
}

export function shapeHalfWidth(shape: Shape): number {
	const { shape: outline, holes } = shape.extractPoints(CURVE_SEGMENTS)
	const rings = [outline, ...holes]
	const area = ringArea(outline) - holes.reduce((sum, ring) => sum + ringArea(ring), 0)
	const length = rings.reduce((sum, ring) => sum + ringLength(ring), 0)
	return length > 0 && area > 0 ? area / length : 0
}

export function bevelSizes(shapes: Shape[], height: number, requested: number): { thickness: number; size: number } {
	const halfWidth = Math.min(...shapes.map(shapeHalfWidth))
	return { thickness: Math.min(requested, height * BEVEL_HEIGHT_SHARE), size: Math.min(requested, halfWidth * BEVEL_WIDTH_SHARE) }
}

export function extrudeShapes(shapes: Shape[], body: SceneBody): ExtrudeGeometry | null {
	if (!shapes.length) return null
	const height = Math.max(body.height, MIN_HEIGHT)
	const { thickness, size } = bevelSizes(shapes, height, body.bevel)
	const hasBevel = thickness > 0 && size > 0
	const edge = hasBevel ? thickness : 0
	const top = body.base + height
	const bottom = body.base > 0 ? body.base : -edge
	const geometry = new ExtrudeGeometry(shapes, {
		depth: top - bottom - 2 * edge,
		curveSegments: CURVE_SEGMENTS,
		bevelEnabled: hasBevel,
		bevelThickness: edge,
		bevelSize: hasBevel ? size : 0,
		bevelOffset: hasBevel ? -size : 0,
		bevelSegments: BEVEL_SEGMENTS,
	})
	geometry.rotateX(Math.PI / 2)
	geometry.translate(0, top - edge, 0)
	return geometry
}
