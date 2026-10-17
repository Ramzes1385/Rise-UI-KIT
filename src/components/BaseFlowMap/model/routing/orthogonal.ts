import { endpoints, NORMALS } from './shapes'
import type { FlowPoint } from '../../types/data/flowData.types'
import type { FlowLayoutEdge, FlowRouter } from '../../types/api/flowLayout.types'
import type { ConcreteSide, OrthogonalContext, RouteEnds } from '../../types/internal/core/flowRouteInternal.types'

const STUB = 16
const CHANNEL_STEP = 6
const DETOUR = 24

function isVertical(side: ConcreteSide): boolean {
	return side === 'top' || side === 'bottom'
}

function stubOf(point: FlowPoint, side: ConcreteSide): FlowPoint {
	return { x: point.x + NORMALS[side].x * STUB, y: point.y + NORMALS[side].y * STUB }
}

function simplify(points: FlowPoint[]): FlowPoint[] {
	const unique = points.filter((point, index) => index === 0 || point.x !== points[index - 1].x || point.y !== points[index - 1].y)
	return unique.filter((point, index) => {
		if (index === 0 || index === unique.length - 1) return true
		const [a, b] = [unique[index - 1], unique[index + 1]]
		return !((a.x === point.x && point.x === b.x) || (a.y === point.y && point.y === b.y))
	})
}

function isAhead(start: FlowPoint, end: FlowPoint, side: ConcreteSide): boolean {
	const normal = NORMALS[side]
	return (end.x - start.x) * normal.x + (end.y - start.y) * normal.y >= STUB * 2
}

function throughMiddle({ s1, t1 }: RouteEnds, vertical: boolean, offset: number): FlowPoint[] {
	if (vertical) {
		const y = (s1.y + t1.y) / 2 + offset
		return [
			{ x: s1.x, y },
			{ x: t1.x, y },
		]
	}
	const x = (s1.x + t1.x) / 2 + offset
	return [
		{ x, y: s1.y },
		{ x, y: t1.y },
	]
}

function aroundBoth({ s1, t1 }: RouteEnds, context: OrthogonalContext, vertical: boolean): FlowPoint[] {
	const { source, target } = context
	if (vertical) {
		const right = Math.max(source.x + source.width, target.x + target.width) + DETOUR
		const left = Math.min(source.x, target.x) - DETOUR
		const x = Math.abs(s1.x - right) + Math.abs(t1.x - right) <= Math.abs(s1.x - left) + Math.abs(t1.x - left) ? right : left
		return [
			{ x, y: s1.y },
			{ x, y: t1.y },
		]
	}
	const bottom = Math.max(source.y + source.height, target.y + target.height) + DETOUR
	const top = Math.min(source.y, target.y) - DETOUR
	const y = Math.abs(s1.y - bottom) + Math.abs(t1.y - bottom) <= Math.abs(s1.y - top) + Math.abs(t1.y - top) ? bottom : top
	return [
		{ x: s1.x, y },
		{ x: t1.x, y },
	]
}

function middleOf(sides: { out: ConcreteSide; into: ConcreteSide }, ends: RouteEnds, context: OrthogonalContext): FlowPoint[] {
	const { out, into } = sides
	const { s1, t1 } = ends
	const offset = (context.channel ?? 0) * CHANNEL_STEP
	if (isVertical(out) === isVertical(into)) {
		const isOpposite = NORMALS[out].x + NORMALS[into].x === 0 && NORMALS[out].y + NORMALS[into].y === 0
		return isOpposite && isAhead(s1, t1, out)
			? throughMiddle(ends, isVertical(out), offset)
			: aroundBoth(ends, context, isVertical(out))
	}
	return [isVertical(out) ? { x: s1.x, y: t1.y } : { x: t1.x, y: s1.y }]
}

function route(edge: FlowLayoutEdge, context: OrthogonalContext): FlowPoint[] {
	const { out, into, start, end } = endpoints(edge, context.source, context.target)
	if (context.points && context.points.length > 0) return simplify([start, ...context.points, end])
	const [s1, t1] = [stubOf(start, out), stubOf(end, into)]
	return simplify([start, s1, ...middleOf({ out, into }, { s1, t1 }, context), t1, end])
}

export const orthogonalRouter: FlowRouter = { id: 'orthogonal', route }
