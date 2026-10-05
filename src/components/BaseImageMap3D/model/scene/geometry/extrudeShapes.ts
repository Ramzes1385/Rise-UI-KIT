import type { Shape } from 'three'
import { ExtrudeGeometry } from 'three'

const MIN_DEPTH = 0.5
const CURVE_SEGMENTS = 24

export function extrudeShapes(shapes: Shape[], height: number): ExtrudeGeometry | null {
	if (!shapes.length) return null
	const depth = Math.max(height, MIN_DEPTH)
	const geometry = new ExtrudeGeometry(shapes, { depth, bevelEnabled: false, curveSegments: CURVE_SEGMENTS })
	geometry.rotateX(Math.PI / 2)
	geometry.translate(0, depth, 0)
	return geometry
}
