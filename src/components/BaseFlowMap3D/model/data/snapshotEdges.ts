import type { RibbonPoint } from '@/scene3d/types/internal/scene3dGeometry.types'
import type { FlowEdge } from '@components/BaseFlowMap/types/data/flowData.types'
import type { FlowPoint } from '@components/BaseFlowMap/types/data/flowData.types'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'
import type {
	FlowMap3DEdgeEnd as EdgeEnd,
	FlowMap3DPlanPoint,
	FlowMap3DSlabRect as SlabRect,
} from '../../types/internal/flowMap3dBuild.types'
import type {
	FlowMap3DEdgeItem,
	FlowMap3DGroupItem,
	FlowMap3DLevels,
	FlowMap3DNodeItem,
	FlowMap3DPlan,
} from '../../types/internal/flowMap3dInternal.types'

const EDGE_LIFT = 0.03
const CORNER = 0.35
const CORNER_STEPS = 3
const ARC_SAMPLES = 24
const TUBE_LIFT = 0.14
const DEFAULT_ARC_HEIGHT = 1.5
const MAX_ROUNDED_POINTS = 8
const END_GAP = 0.12
const SLAB_EPS = 0.05
const STEP_LENGTH = 0.05
const MAX_SLAB_DEPTH = 16

function toPlan(point: FlowPoint, plan: FlowMap3DPlan): FlowMap3DPlanPoint {
	return { x: point.x / plan.unit - plan.origin.x, z: point.y / plan.unit - plan.origin.z }
}

function towards(from: FlowMap3DPlanPoint, to: FlowMap3DPlanPoint, distance: number): FlowMap3DPlanPoint {
	const length = Math.hypot(to.x - from.x, to.z - from.z)
	if (length === 0) return from
	const ratio = Math.min(distance, length / 2) / length
	return { x: from.x + (to.x - from.x) * ratio, z: from.z + (to.z - from.z) * ratio }
}

function corner(before: FlowMap3DPlanPoint, at: FlowMap3DPlanPoint, after: FlowMap3DPlanPoint): FlowMap3DPlanPoint[] {
	const [a, b] = [towards(at, before, CORNER), towards(at, after, CORNER)]
	return Array.from({ length: CORNER_STEPS + 1 }, (_, step) => {
		const t = step / CORNER_STEPS
		const u = 1 - t
		return { x: u * u * a.x + 2 * u * t * at.x + t * t * b.x, z: u * u * a.z + 2 * u * t * at.z + t * t * b.z }
	})
}

function roundPlan(points: readonly FlowMap3DPlanPoint[]): FlowMap3DPlanPoint[] {
	if (points.length < 3 || points.length > MAX_ROUNDED_POINTS) return [...points]
	const inner = points.slice(1, -1).flatMap((at, index) => corner(points[index], at, points[index + 2]))
	return [points[0], ...inner, points[points.length - 1]]
}

function trimEnd(points: FlowMap3DPlanPoint[], center: FlowMap3DPlanPoint, reach: number): FlowMap3DPlanPoint[] {
	const end = points[0]
	const length = Math.hypot(end.x - center.x, end.z - center.z)
	if (length <= reach || length === 0) return points
	const ratio = reach / length
	return [{ x: center.x + (end.x - center.x) * ratio, z: center.z + (end.z - center.z) * ratio }, ...points]
}

function trimmed(
	points: FlowMap3DPlanPoint[],
	ends: { source: FlowMap3DNodeItem; target: FlowMap3DNodeItem },
	reach: number,
): FlowMap3DPlanPoint[] {
	const center = (item: FlowMap3DNodeItem): FlowMap3DPlanPoint => ({ x: item.x, z: item.z - item.shift })
	const start = trimEnd(points, center(ends.source), reach)
	return trimEnd([...start].reverse(), center(ends.target), reach).reverse()
}

function placed(point: FlowMap3DPlanPoint, end: EdgeEnd, lift: number): RibbonPoint {
	return { x: point.x, y: end.y + lift, z: point.z + end.z }
}

function arcOf(points: readonly FlowMap3DPlanPoint[], height: number, ends: { from: EdgeEnd; to: EdgeEnd }): RibbonPoint[] {
	const [from, to] = [placed(points[0], ends.from, 0), placed(points[points.length - 1], ends.to, 0)]
	return Array.from({ length: ARC_SAMPLES + 1 }, (_, step) => {
		const t = step / ARC_SAMPLES
		const y = from.y + (to.y - from.y) * t + EDGE_LIFT + 4 * height * t * (1 - t)
		return { x: from.x + (to.x - from.x) * t, z: from.z + (to.z - from.z) * t, y }
	})
}

function insideSlab(point: FlowMap3DPlanPoint, slab: SlabRect): boolean {
	return point.x >= slab.x0 - SLAB_EPS && point.x <= slab.x1 + SLAB_EPS && point.z >= slab.z0 - SLAB_EPS && point.z <= slab.z1 + SLAB_EPS
}

function axisRatio(from: number, delta: number, range: readonly [number, number]): number {
	if (delta === 0) return Infinity
	return (range[delta > 0 ? 1 : 0] - from) / delta
}

function exitRatio(a: FlowMap3DPlanPoint, b: FlowMap3DPlanPoint, slab: SlabRect): number {
	const [dx, dz] = [b.x - a.x, b.z - a.z]
	return Math.min(1, Math.max(0, Math.min(axisRatio(a.x, dx, [slab.x0, slab.x1]), axisRatio(a.z, dz, [slab.z0, slab.z1]))))
}

function lerpPlan(a: FlowMap3DPlanPoint, b: FlowMap3DPlanPoint, t: number): FlowMap3DPlanPoint {
	return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t }
}

function cutOf(points: readonly FlowMap3DPlanPoint[], slab: SlabRect | undefined): { index: number; ratio: number } {
	const last = points.length - 1
	if (slab) {
		for (let index = 1; index <= last; index += 1) {
			if (!insideSlab(points[index], slab)) return { index, ratio: exitRatio(points[index - 1], points[index], slab) }
		}
		return { index: last, ratio: 0.5 }
	}
	const lengths = points.map((point, index) =>
		index === 0 ? 0 : Math.hypot(point.x - points[index - 1].x, point.z - points[index - 1].z),
	)
	const half = lengths.reduce((sum, value) => sum + value, 0) / 2
	let walked = 0
	for (let index = 1; index <= last; index += 1) {
		if (walked + lengths[index] >= half) return { index, ratio: lengths[index] === 0 ? 0 : (half - walked) / lengths[index] }
		walked += lengths[index]
	}
	return { index: last, ratio: 0.5 }
}

function stepped(
	points: readonly FlowMap3DPlanPoint[],
	ends: { from: EdgeEnd; to: EdgeEnd; slab?: SlabRect },
	lift: number,
): RibbonPoint[] {
	const { from, to } = ends
	if (from.tier === to.tier) return points.map(point => placed(point, from, lift))
	const { index, ratio } = cutOf(points, ends.slab)
	const [a, b] = [points[index - 1], points[index]]
	const span = Math.hypot(b.x - a.x, b.z - a.z) || 1
	const after = Math.min(ratio + STEP_LENGTH / span, ratio + (1 - ratio) / 2)
	return [
		...points.slice(0, index).map(point => placed(point, from, lift)),
		placed(lerpPlan(a, b, ratio), from, lift),
		placed(lerpPlan(a, b, after), to, lift),
		...points.slice(index).map(point => placed(point, to, lift)),
	]
}

function longestSegment(points: readonly RibbonPoint[]): { x: number; y: number; z: number; angle: number } | null {
	let best: { x: number; y: number; z: number; angle: number; length: number } | null = null
	for (let index = 1; index < points.length; index += 1) {
		const [a, b] = [points[index - 1], points[index]]
		const length = Math.hypot(b.x - a.x, b.z - a.z)
		if (length > (best?.length ?? 0))
			best = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2, angle: Math.atan2(-(b.z - a.z), b.x - a.x), length }
	}
	return best && { x: best.x, y: best.y, z: best.z, angle: best.angle }
}

function pointsOf(edge: FlowEdge, plan: FlowMap3DPlanPoint[], ends: { from: EdgeEnd; to: EdgeEnd; slab?: SlabRect }): RibbonPoint[] {
	const shape = edge.model3d?.shape ?? 'ribbon'
	if (shape === 'arc') return arcOf(plan, edge.model3d?.height ?? DEFAULT_ARC_HEIGHT, ends)
	return stepped(plan, ends, shape === 'tube' ? TUBE_LIFT : EDGE_LIFT)
}

function endOf(item: FlowMap3DNodeItem, levels: FlowMap3DLevels): EdgeEnd {
	const spot = levels.nodes.get(item.id)
	return { tier: spot?.tier ?? 0, y: item.base, z: item.shift }
}

function slabOf(item: FlowMap3DNodeItem, groups: ReadonlyMap<string, FlowMap3DGroupItem>): SlabRect | undefined {
	let current = item.group ? groups.get(item.group) : undefined
	for (let depth = 0; current?.group.parent && depth < MAX_SLAB_DEPTH; depth += 1) current = groups.get(current.group.parent) ?? current
	if (!current) return undefined
	const { x0, x1, z0, z1 } = current.rect
	return { x0, x1, z0: z0 - current.shift, z1: z1 - current.shift }
}

export function buildEdgeItems(
	model: FlowModelInternal,
	parts: {
		nodes: ReadonlyMap<string, FlowMap3DNodeItem>
		groups: ReadonlyMap<string, FlowMap3DGroupItem>
		levels: FlowMap3DLevels
		plan: FlowMap3DPlan
		reach: number
	},
): FlowMap3DEdgeItem[] {
	const routes = model.routes.value
	return model.shown.value.edges.flatMap(edge => {
		const route = routes[edge.id]
		const [source, target] = [parts.nodes.get(edge.source), parts.nodes.get(edge.target)]
		if (!route || route.points.length < 2 || !source || !target) return []
		const ends = { source, target }
		const kind = model.edgeKind(edge)
		const rounded = roundPlan(route.points.map(point => toPlan(point, parts.plan)))
		const plan = trimmed(rounded, ends, parts.reach + END_GAP)
		const points = pointsOf(edge, plan, {
			from: endOf(ends.source, parts.levels),
			to: endOf(ends.target, parts.levels),
			slab: slabOf(ends.source, parts.groups),
		})
		return [
			{
				id: edge.id,
				edge,
				kind,
				shape: edge.model3d?.shape ?? 'ribbon',
				height: edge.model3d?.height ?? DEFAULT_ARC_HEIGHT,
				points,
				stroke: kind.stroke,
				color: kind.color,
				hasParticles: kind.stroke !== 'dotted',
				label: edge.label,
				labelSpot: edge.label ? longestSegment(points) : null,
			},
		]
	})
}
