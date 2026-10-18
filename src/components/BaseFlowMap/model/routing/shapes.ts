import type { FlowShape } from '../../types/api/flowNotation.types'
import type { FlowLayoutEdge } from '../../types/api/flowLayout.types'
import type { FlowPoint, FlowRect } from '../../types/data/flowData.types'
import type { ConcreteSide, Ray } from '../../types/internal/core/flowRouteInternal.types'

const SKEW = 0.2
const HEX = 0.25

export function centerOf(rect: FlowRect): FlowPoint {
	return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

function anchorOn(rect: FlowRect, side: ConcreteSide): FlowPoint {
	const center = centerOf(rect)
	if (side === 'top') return { x: center.x, y: rect.y }
	if (side === 'bottom') return { x: center.x, y: rect.y + rect.height }
	return side === 'left' ? { x: rect.x, y: center.y } : { x: rect.x + rect.width, y: center.y }
}

function polygonOf(shape: FlowShape, rect: FlowRect): FlowPoint[] | null {
	const { x, y, width: w, height: h } = rect
	if (shape === 'diamond') {
		return [
			{ x: x + w / 2, y },
			{ x: x + w, y: y + h / 2 },
			{ x: x + w / 2, y: y + h },
			{ x, y: y + h / 2 },
		]
	}
	if (shape === 'hexagon') {
		const cut = w * HEX
		return [
			{ x: x + cut, y },
			{ x: x + w - cut, y },
			{ x: x + w, y: y + h / 2 },
			{ x: x + w - cut, y: y + h },
			{ x: x + cut, y: y + h },
			{ x, y: y + h / 2 },
		]
	}
	if (shape !== 'parallelogram') return null
	const skew = w * SKEW
	return [
		{ x: x + skew, y },
		{ x: x + w, y },
		{ x: x + w - skew, y: y + h },
		{ x, y: y + h },
	]
}

function rayToSegment({ origin, dir }: Ray, from: FlowPoint, to: FlowPoint): number | null {
	const edge = { x: to.x - from.x, y: to.y - from.y }
	const denom = dir.x * edge.y - dir.y * edge.x
	if (Math.abs(denom) < 1e-9) return null
	const dx = from.x - origin.x
	const dy = from.y - origin.y
	const along = (dx * edge.y - dy * edge.x) / denom
	const across = (dx * dir.y - dy * dir.x) / denom
	return along >= 0 && across >= 0 && across <= 1 ? along : null
}

function clipPolygon(polygon: FlowPoint[], origin: FlowPoint, dir: FlowPoint): FlowPoint {
	let best = Infinity
	polygon.forEach((from, index) => {
		const hit = rayToSegment({ origin, dir }, from, polygon[(index + 1) % polygon.length])
		if (hit !== null && hit < best) best = hit
	})
	return best === Infinity ? origin : { x: origin.x + dir.x * best, y: origin.y + dir.y * best }
}

function clipRect(rect: FlowRect, origin: FlowPoint, dir: FlowPoint): FlowPoint {
	const scaleX = dir.x === 0 ? Infinity : rect.width / 2 / Math.abs(dir.x)
	const scaleY = dir.y === 0 ? Infinity : rect.height / 2 / Math.abs(dir.y)
	const scale = Math.min(scaleX, scaleY)
	return { x: origin.x + dir.x * scale, y: origin.y + dir.y * scale }
}

function clipEllipse(rect: FlowRect, origin: FlowPoint, dir: FlowPoint): FlowPoint {
	const [rx, ry] = [rect.width / 2, rect.height / 2]
	const scale = 1 / Math.hypot(dir.x / rx, dir.y / ry)
	return { x: origin.x + dir.x * scale, y: origin.y + dir.y * scale }
}

export function clipToShape(shape: FlowShape, rect: FlowRect, toward: FlowPoint): FlowPoint {
	const origin = centerOf(rect)
	const length = Math.hypot(toward.x - origin.x, toward.y - origin.y)
	if (length < 1e-6) return origin
	const dir = { x: (toward.x - origin.x) / length, y: (toward.y - origin.y) / length }
	if (shape === 'ellipse' || shape === 'circle' || shape === 'pill') return clipEllipse(rect, origin, dir)
	const polygon = polygonOf(shape, rect)
	return polygon ? clipPolygon(polygon, origin, dir) : clipRect(rect, origin, dir)
}

export const NORMALS: Record<ConcreteSide, FlowPoint> = {
	top: { x: 0, y: -1 },
	bottom: { x: 0, y: 1 },
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 },
}

function inferSide(from: FlowRect, to: FlowRect): ConcreteSide {
	const [a, b] = [centerOf(from), centerOf(to)]
	const [dx, dy] = [b.x - a.x, b.y - a.y]
	const isVertical = Math.abs(dy) * from.width >= Math.abs(dx) * from.height
	if (isVertical) return dy >= 0 ? 'bottom' : 'top'
	return dx >= 0 ? 'right' : 'left'
}

export function resolveSides(edge: FlowLayoutEdge, source: FlowRect, target: FlowRect): { out: ConcreteSide; into: ConcreteSide } {
	const out = edge.sourceSide && edge.sourceSide !== 'auto' ? edge.sourceSide : inferSide(source, target)
	const into = edge.targetSide && edge.targetSide !== 'auto' ? edge.targetSide : inferSide(target, source)
	return { out, into }
}

export function endpoints(edge: FlowLayoutEdge, source: FlowRect, target: FlowRect) {
	const { out, into } = resolveSides(edge, source, target)
	return { out, into, start: anchorOn(source, out), end: anchorOn(target, into) }
}
