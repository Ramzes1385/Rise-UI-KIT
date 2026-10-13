import type { Shape, Vector2 } from 'three'
import { narrowestGap, ringEdges } from './narrowestGap'
import { BufferAttribute, BufferGeometry, ExtrudeGeometry } from 'three'
import type { SceneBody } from '../../../types/internal/imageMap3dInternal.types'

const MIN_HEIGHT = 0.5
const CURVE_SEGMENTS = 24
const BEVEL_SEGMENTS = 2
const BEVEL_HEIGHT_SHARE = 0.25
const BEVEL_WIDTH_SHARE = 0.5
const ATTRIBUTES = ['position', 'normal', 'uv'] as const

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

function shapeRings(shape: Shape, segments: number): Vector2[][] {
	const { shape: outline, holes } = shape.extractPoints(segments)
	return [outline, ...holes]
}

export function shapeHalfWidth(shape: Shape, segments = CURVE_SEGMENTS): number {
	const rings = shapeRings(shape, segments)
	const area = ringArea(rings[0]) - rings.slice(1).reduce((sum, ring) => sum + ringArea(ring), 0)
	const length = rings.reduce((sum, ring) => sum + ringLength(ring), 0)
	return length > 0 && area > 0 ? area / length : 0
}

export function shapeNarrowest(shape: Shape, cap: number, segments = CURVE_SEGMENTS): number {
	return narrowestGap(ringEdges(shapeRings(shape, segments)), cap)
}

export function bevelSizes(
	shape: Shape,
	height: number,
	body: Pick<SceneBody, 'bevel' | 'curveSegments'>,
): { thickness: number; size: number } {
	const segments = body.curveSegments ?? CURVE_SEGMENTS
	const width = Math.min(shapeHalfWidth(shape, segments), shapeNarrowest(shape, (2 * body.bevel) / BEVEL_WIDTH_SHARE, segments) / 2)
	return { thickness: Math.min(body.bevel, height * BEVEL_HEIGHT_SHARE), size: Math.min(body.bevel, width * BEVEL_WIDTH_SHARE) }
}

function extrudeShape(shape: Shape, body: SceneBody): BufferGeometry {
	const height = Math.max(body.height, MIN_HEIGHT)
	const { thickness, size } = bevelSizes(shape, height, body)
	const hasBevel = thickness > 0 && size > 0
	const edge = hasBevel ? thickness : 0
	const top = body.base + height
	const bottom = body.base > 0 ? body.base : -edge
	const geometry = new ExtrudeGeometry(shape, {
		depth: top - bottom - 2 * edge,
		curveSegments: body.curveSegments ?? CURVE_SEGMENTS,
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

function mergeGeometries(geometries: BufferGeometry[]): BufferGeometry {
	if (geometries.length === 1) return geometries[0]
	const merged = new BufferGeometry()
	ATTRIBUTES.forEach(name => {
		const sources = geometries.map(geometry => geometry.getAttribute(name))
		const array = new Float32Array(sources.reduce((sum, source) => sum + source.array.length, 0))
		sources.reduce((offset, source) => {
			array.set(source.array, offset)
			return offset + source.array.length
		}, 0)
		merged.setAttribute(name, new BufferAttribute(array, sources[0].itemSize))
	})
	geometries.forEach(geometry => geometry.dispose())
	return merged
}

export function extrudeShapes(shapes: Shape[], body: SceneBody): BufferGeometry | null {
	return shapes.length ? mergeGeometries(shapes.map(shape => extrudeShape(shape, body))) : null
}
