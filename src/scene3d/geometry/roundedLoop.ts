import { Vector3 } from 'three'
import type { LoopRect, RoundedLoopOptions } from '../types/internal/scene3dGeometry.types'

const SEGMENTS = 10
const QUARTER = Math.PI / 2

/**
 * Замкнутый скруглённый прямоугольник на высоте `y`: углы по часовой стрелке сверху,
 * последняя точка повторяет первую (так ленту замыкает `createRibbonGeometry`). Радиус не больше половины меньшей стороны
 */
export function roundedLoop(rect: LoopRect, options: RoundedLoopOptions): Vector3[] {
	const { x0, z0, x1, z1 } = rect
	const segments = options.segments ?? SEGMENTS
	const r = Math.max(0, Math.min(options.radius, Math.abs(x1 - x0) / 2, Math.abs(z1 - z0) / 2))
	const corners = [
		[x1 - r, z0 + r, -QUARTER],
		[x1 - r, z1 - r, 0],
		[x0 + r, z1 - r, QUARTER],
		[x0 + r, z0 + r, Math.PI],
	]
	const points = corners.flatMap(([cx, cz, start]) =>
		Array.from({ length: segments + 1 }, (_, step) => {
			const angle = start + (step / segments) * QUARTER
			return new Vector3(cx + Math.cos(angle) * r, options.y, cz + Math.sin(angle) * r)
		}),
	)
	return [...points, points[0].clone()]
}
