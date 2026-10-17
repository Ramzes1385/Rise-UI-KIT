import { boundaryRoleOf, codeOrder, idef0KindOf } from './idef0Rules'
import type { FlowPoint, FlowRect } from '../../../types/data/flowData.types'
import type { Idef0LayoutBoundary, Idef0LayoutRects } from '../../../types/notations/process/idef.types'
import type {
	FlowLayoutAlgorithm,
	FlowLayoutEdge,
	FlowLayoutInput,
	FlowLayoutNode,
	FlowLayoutResult,
} from '../../../types/api/flowLayout.types'

const ORIGIN: FlowPoint = { x: 180, y: 70 }
const EDGE_PAD = 8
const BOUNDARY_GAP = 48
const BOUNDARY_SEPARATION = 12
const LOOP_OFFSET = 30
const LOOP_STEP = 12
const LOOP_SHOULDER = 24
const MIN_GAP_X = 40
const MIN_GAP_Y = 34

const centerX = (rect: FlowRect): number => rect.x + rect.width / 2
const centerY = (rect: FlowRect): number => rect.y + rect.height / 2
const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0)
const mean = (values: number[]): number => (values.length ? sum(values) / values.length : 0)

function isBoundary(node: FlowLayoutNode): boolean {
	return idef0KindOf(node) === 'boundary'
}

function byCode(a: FlowLayoutNode, b: FlowLayoutNode): number {
	const code = (node: FlowLayoutNode): number => codeOrder(typeof node.props?.code === 'string' ? node.props.code : '')
	return code(a) - code(b) || a.order - b.order
}

function placeFunctions(functions: FlowLayoutNode[], input: FlowLayoutInput): Idef0LayoutRects {
	const { nodeGap, rankGap } = input.settings
	const gapX = Math.max(MIN_GAP_X, rankGap)
	const gapY = Math.max(MIN_GAP_Y, nodeGap)
	const rects: Idef0LayoutRects = {}
	let cursor = ORIGIN
	for (const node of functions) {
		const origin = node.fixed ?? cursor
		rects[node.id] = { ...origin, ...node.size }
		cursor = { x: origin.x + node.size.width + gapX, y: origin.y + node.size.height + gapY }
	}
	return rects
}

function describeBoundary(node: FlowLayoutNode, edges: FlowLayoutEdge[], rects: Idef0LayoutRects): Idef0LayoutBoundary {
	const role = boundaryRoleOf(node)
	const isSink = role === 'output'
	const linked = edges.filter(edge => (isSink ? edge.target : edge.source) === node.id)
	const anchors = linked.map(edge => (isSink ? edge.source : edge.target)).filter(id => rects[id])
	return { node, role, anchors }
}

function spread(entries: { id: string; center: number; size: number }[]): Record<string, number> {
	const sorted = [...entries].sort((a, b) => a.center - b.center)
	const result: Record<string, number> = {}
	let edge = -Infinity
	for (const entry of sorted) {
		const start = Math.max(entry.center - entry.size / 2, edge)
		result[entry.id] = start
		edge = start + entry.size + BOUNDARY_SEPARATION
	}
	return result
}

function alongAxis(boundary: Idef0LayoutBoundary, rects: Idef0LayoutRects, isVertical: boolean): number {
	const anchors = boundary.anchors.map(id => rects[id]!)
	const values = anchors.map(rect => (isVertical ? centerY(rect) : centerX(rect)))
	if (values.length) return mean(values)
	return isVertical ? ORIGIN.y : ORIGIN.x
}

function contentBounds(rects: Idef0LayoutRects): { left: number; top: number; right: number; bottom: number } {
	const all = Object.values(rects)
	return {
		left: Math.min(...all.map(rect => rect.x)),
		top: Math.min(...all.map(rect => rect.y)),
		right: Math.max(...all.map(rect => rect.x + rect.width)),
		bottom: Math.max(...all.map(rect => rect.y + rect.height)),
	}
}

function placeRole(
	boundaries: Idef0LayoutBoundary[],
	rects: Idef0LayoutRects,
	content: ReturnType<typeof contentBounds>,
): Idef0LayoutRects {
	const role = boundaries[0]!.role
	const isVertical = role === 'input' || role === 'output'
	const starts = spread(
		boundaries.map(boundary => ({
			id: boundary.node.id,
			center: alongAxis(boundary, rects, isVertical),
			size: isVertical ? boundary.node.size.height : boundary.node.size.width,
		})),
	)
	const fixedAxis = {
		input: EDGE_PAD,
		control: EDGE_PAD,
		output: content.right + BOUNDARY_GAP,
		mechanism: content.bottom + BOUNDARY_GAP,
	}[role]
	const placed: Idef0LayoutRects = {}
	for (const { node } of boundaries) {
		const start = starts[node.id]!
		placed[node.id] = { ...(node.fixed ?? (isVertical ? { x: fixedAxis, y: start } : { x: start, y: fixedAxis })), ...node.size }
	}
	return placed
}

function placeBoundaries(boundaries: Idef0LayoutBoundary[], rects: Idef0LayoutRects): Idef0LayoutRects {
	if (!boundaries.length) return {}
	const content = contentBounds(rects)
	const result: Idef0LayoutRects = {}
	for (const role of ['input', 'control', 'output', 'mechanism'] as const) {
		const group = boundaries.filter(boundary => boundary.role === role)
		if (group.length) Object.assign(result, placeRole(group, rects, content))
	}
	return result
}

function loopRoute(edge: FlowLayoutEdge, rects: Idef0LayoutRects, lanes: { above: number; below: number }): FlowPoint[] {
	const source = rects[edge.source]!
	const target = rects[edge.target]!
	const start = { x: source.x + source.width, y: centerY(source) }
	const shoulder = start.x + LOOP_SHOULDER
	if (!edge.targetSide || edge.targetSide === 'top') {
		const end = { x: centerX(target), y: target.y }
		return [start, { x: shoulder, y: start.y }, { x: shoulder, y: lanes.above }, { x: end.x, y: lanes.above }, end]
	}
	const isBottom = edge.targetSide === 'bottom'
	const end = isBottom ? { x: centerX(target), y: target.y + target.height } : { x: target.x, y: centerY(target) }
	const turn = isBottom ? end.x : target.x - LOOP_SHOULDER
	return [
		start,
		{ x: shoulder, y: start.y },
		{ x: shoulder, y: lanes.below },
		{ x: turn, y: lanes.below },
		...(isBottom ? [] : [{ x: turn, y: end.y }]),
		end,
	]
}

function isFeedback(edge: FlowLayoutEdge, order: Map<string, number>): boolean {
	const from = order.get(edge.source)
	const to = order.get(edge.target)
	return from !== undefined && to !== undefined && to <= from
}

function feedbackRoutes(edges: FlowLayoutEdge[], functions: FlowLayoutNode[], rects: Idef0LayoutRects): Record<string, FlowPoint[]> {
	const order = new Map(functions.map((node, index) => [node.id, index]))
	const content = contentBounds(Object.fromEntries(functions.map(node => [node.id, rects[node.id]!])))
	const routes: Record<string, FlowPoint[]> = {}
	let above = 0
	let below = 0
	for (const edge of edges.filter(candidate => isFeedback(candidate, order))) {
		const isAbove = !edge.targetSide || edge.targetSide === 'top'
		const lanes = { above: content.top - LOOP_OFFSET - above * LOOP_STEP, below: content.bottom + LOOP_OFFSET + below * LOOP_STEP }
		routes[edge.id] = loopRoute(edge, rects, lanes)
		if (isAbove) above += 1
		else below += 1
	}
	return routes
}

function boundsOf(rects: Idef0LayoutRects, routes: Record<string, FlowPoint[]>): FlowRect {
	const xs = [
		...Object.values(rects).flatMap(rect => [rect.x, rect.x + rect.width]),
		...Object.values(routes).flatMap(points => points.map(point => point.x)),
	]
	const ys = [
		...Object.values(rects).flatMap(rect => [rect.y, rect.y + rect.height]),
		...Object.values(routes).flatMap(points => points.map(point => point.y)),
	]
	const x = Math.min(...xs)
	const y = Math.min(...ys)
	return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

function runIdef0Staircase(input: FlowLayoutInput): FlowLayoutResult {
	const ordered = [...input.nodes].sort(byCode)
	const functions = ordered.filter(node => !isBoundary(node))
	const rects = placeFunctions(functions, input)
	const boundaries = ordered.filter(isBoundary).map(node => describeBoundary(node, input.edges, rects))
	Object.assign(rects, placeBoundaries(boundaries, rects))
	const edges = functions.length ? feedbackRoutes(input.edges, functions, rects) : {}
	return {
		nodes: rects,
		groups: {},
		edges,
		bounds: Object.keys(rects).length ? boundsOf(rects, edges) : { x: 0, y: 0, width: 0, height: 0 },
	}
}

export const idef0Staircase: FlowLayoutAlgorithm = { id: 'idef0-staircase', run: runIdef0Staircase }
