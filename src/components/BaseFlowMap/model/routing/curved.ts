import { endpoints, NORMALS } from './shapes'
import type { FlowPoint, FlowRect } from '../../types/data/flowData.types'
import type { FlowLayoutEdge, FlowRouter } from '../../types/api/flowLayout.types'
import type { ConcreteSide } from '../../types/internal/core/flowRouteInternal.types'

const SAMPLES = 28
const MIN_REACH = 24
const MAX_REACH = 140
const ARCH_REACH = 40

function cubic(points: readonly [FlowPoint, FlowPoint, FlowPoint, FlowPoint], t: number): FlowPoint {
	const [p0, p1, p2, p3] = points
	const u = 1 - t
	const [a, b, c, d] = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
	return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y }
}

function reach(start: FlowPoint, end: FlowPoint): number {
	return Math.min(MAX_REACH, Math.max(MIN_REACH, Math.hypot(end.x - start.x, end.y - start.y) / 2))
}

function control(point: FlowPoint, side: ConcreteSide, distance: number): FlowPoint {
	return { x: point.x + NORMALS[side].x * distance, y: point.y + NORMALS[side].y * distance }
}

function spline(anchors: readonly FlowPoint[]): FlowPoint[] {
	const result: FlowPoint[] = []
	for (let index = 0; index < anchors.length - 1; index += 1) {
		const [p0, p1, p2, p3] = [
			anchors[Math.max(index - 1, 0)],
			anchors[index],
			anchors[index + 1],
			anchors[Math.min(index + 2, anchors.length - 1)],
		]
		const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
		const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
		for (let step = index === 0 ? 0 : 1; step <= SAMPLES / 2; step += 1) result.push(cubic([p1, c1, c2, p2], step / (SAMPLES / 2)))
	}
	return result
}

function isBlocked(start: FlowPoint, end: FlowPoint, obstacles: readonly FlowRect[]): boolean {
	return obstacles.some(rect =>
		Array.from({ length: 9 }, (_, step) => step / 8).some(t => {
			const x = start.x + (end.x - start.x) * t
			const y = start.y + (end.y - start.y) * t
			return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height
		}),
	)
}

function isArch(
	edge: FlowLayoutEdge,
	ends: { out: ConcreteSide; start: FlowPoint; end: FlowPoint },
	obstacles: readonly FlowRect[],
): boolean {
	if (edge.sourceSide || edge.targetSide) return false
	return (ends.out === 'left' || ends.out === 'right') && isBlocked(ends.start, ends.end, obstacles)
}

function route(
	edge: FlowLayoutEdge,
	context: { source: FlowRect; target: FlowRect; obstacles?: readonly FlowRect[]; points?: FlowPoint[] },
): FlowPoint[] {
	const base = endpoints(edge, context.source, context.target)
	if (context.points && context.points.length > 0) return spline([base.start, ...context.points, base.end])
	const isArched = isArch(edge, base, context.obstacles ?? [])
	const { out, into, start, end } = isArched
		? endpoints({ ...edge, sourceSide: 'bottom', targetSide: 'bottom' }, context.source, context.target)
		: base
	const distance = isArched ? ARCH_REACH : reach(start, end)
	const curve: [FlowPoint, FlowPoint, FlowPoint, FlowPoint] = [start, control(start, out, distance), control(end, into, distance), end]
	return Array.from({ length: SAMPLES + 1 }, (_, step) => cubic(curve, step / SAMPLES))
}

export const curvedRouter: FlowRouter = { id: 'curved', route }
