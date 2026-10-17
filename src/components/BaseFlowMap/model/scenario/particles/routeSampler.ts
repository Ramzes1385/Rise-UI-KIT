import type { FlowPoint, FlowRect } from '../../../types/data/flowData.types'
import { FLOW_ROUTE_STEP } from '../../../types/internal/flowParticles.types'
import type { FlowRouteTable } from '../../../types/internal/flowParticles.types'

const cache = new WeakMap<readonly FlowPoint[], FlowRouteTable | null>()

function measure(points: readonly FlowPoint[]): number[] {
	const sums = [0]
	for (let index = 1; index < points.length; index += 1) {
		const previous = points[index - 1]!
		const current = points[index]!
		sums.push(sums[index - 1]! + Math.hypot(current.x - previous.x, current.y - previous.y))
	}
	return sums
}

function boundsOf(points: readonly FlowPoint[]): FlowRect {
	const xs = points.map(point => point.x)
	const ys = points.map(point => point.y)
	const x = Math.min(...xs)
	const y = Math.min(...ys)
	return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

function fillTable(points: readonly FlowPoint[], sums: number[], table: Pick<FlowRouteTable, 'length' | 'segments' | 'xs' | 'ys'>): void {
	let part = 1
	for (let index = 0; index <= table.segments; index += 1) {
		const distance = (index / table.segments) * table.length
		while (part < points.length - 1 && sums[part]! < distance) {
			part += 1
		}
		const from = points[part - 1]!
		const to = points[part]!
		const span = sums[part]! - sums[part - 1]!
		const ratio = span > 0 ? (distance - sums[part - 1]!) / span : 0
		table.xs[index] = from.x + (to.x - from.x) * ratio
		table.ys[index] = from.y + (to.y - from.y) * ratio
	}
}

export function sampleRoute(points: readonly FlowPoint[], step: number = FLOW_ROUTE_STEP): FlowRouteTable | null {
	const sums = measure(points)
	const length = sums[sums.length - 1] ?? 0
	if (points.length < 2 || length <= 0) {
		return null
	}
	const segments = Math.max(1, Math.ceil(length / step))
	const table = { length, segments, xs: new Float32Array(segments + 1), ys: new Float32Array(segments + 1) }
	fillTable(points, sums, table)
	return { ...table, bounds: boundsOf(points) }
}

export function cachedRouteTable(points: readonly FlowPoint[]): FlowRouteTable | null {
	if (!cache.has(points)) {
		cache.set(points, sampleRoute(points))
	}
	return cache.get(points) ?? null
}

export function readRoute(table: FlowRouteTable, distance: number, out: FlowPoint): void {
	const clamped = Math.min(Math.max(distance, 0), table.length)
	const position = (clamped / table.length) * table.segments
	const index = Math.min(Math.floor(position), table.segments - 1)
	const ratio = position - index
	const x0 = table.xs[index]!
	const y0 = table.ys[index]!
	out.x = x0 + (table.xs[index + 1]! - x0) * ratio
	out.y = y0 + (table.ys[index + 1]! - y0) * ratio
}

export function isRouteInView(table: FlowRouteTable, view: FlowRect): boolean {
	const { bounds } = table
	return (
		bounds.x <= view.x + view.width &&
		bounds.x + bounds.width >= view.x &&
		bounds.y <= view.y + view.height &&
		bounds.y + bounds.height >= view.y
	)
}
