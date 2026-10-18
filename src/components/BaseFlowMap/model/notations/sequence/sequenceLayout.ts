import { HEADER_TOP } from './sequencePaths'
import { isLifeline, sequenceKindOf, textProp } from './sequenceRules'
import type { FlowPoint, FlowRect } from '../../../types/data/flowData.types'
import type { SequenceRows } from '../../../types/notations/architecture/sequence.types'
import type {
	FlowLayoutAlgorithm,
	FlowLayoutEdge,
	FlowLayoutInput,
	FlowLayoutNode,
	FlowLayoutResult,
} from '../../../types/api/flowLayout.types'

const FIRST_ROW = 72
const ROW = 64
const TAIL = 44
const LOOP_WIDTH = 40
const LOOP_HALF = 12
const HEADER_CENTER = 11
const FRAGMENT_SIDE = 28
const FRAGMENT_TOP = 30
const FRAGMENT_BOTTOM = 26
const NEST_PAD = 10
const MIN_PITCH = 150
const MIN_HEIGHT = 40

const rowY = (index: number): number => FIRST_ROW + index * ROW

function columnsOf(input: FlowLayoutInput, lifelines: readonly FlowLayoutNode[]): Map<string, number> {
	const widest = Math.max(MIN_PITCH, ...lifelines.map(node => node.size.width))
	const pitch = widest + input.settings.nodeGap
	return new Map(lifelines.map((node, index) => [node.id, node.fixed?.x ?? index * pitch]))
}

function rowsOf(edges: readonly FlowLayoutEdge[]): SequenceRows {
	return new Map(edges.map((edge, index) => [edge.id, index]))
}

function lifelineRect(node: FlowLayoutNode, x: number, context: { rows: SequenceRows; lastRow: number }): FlowRect {
	const created = context.rows.get(textProp(node, 'createdBy') ?? '')
	const destroyed = context.rows.get(textProp(node, 'destroyedBy') ?? '')
	const top = created === undefined ? 0 : rowY(created) - HEADER_CENTER
	const bottom = destroyed === undefined ? rowY(context.lastRow) + TAIL : rowY(destroyed) + LOOP_HALF
	return { x, y: top, width: node.size.width, height: Math.max(bottom - top, MIN_HEIGHT) }
}

function selfLoop(x: number, y: number): FlowPoint[] {
	return [
		{ x, y: y - LOOP_HALF },
		{ x: x + LOOP_WIDTH, y: y - LOOP_HALF },
		{ x: x + LOOP_WIDTH, y: y + LOOP_HALF },
		{ x, y: y + LOOP_HALF },
	]
}

function endpoint(rect: FlowRect, from: number, isHeader: boolean): number {
	if (!isHeader) return rect.x + rect.width / 2
	return from < rect.x + rect.width / 2 ? rect.x : rect.x + rect.width
}

function messageRoute(
	edge: FlowLayoutEdge,
	y: number,
	context: { rects: Record<string, FlowRect>; created: ReadonlySet<string> },
): FlowPoint[] {
	const source = context.rects[edge.source]
	const target = context.rects[edge.target]
	if (!source || !target) return []
	const sourceX = source.x + source.width / 2
	if (edge.source === edge.target) return selfLoop(sourceX, y)
	const isHeader = context.created.has(edge.target) && Math.abs(target.y + HEADER_CENTER - y) < 1
	return [
		{ x: sourceX, y },
		{ x: endpoint(target, sourceX, isHeader), y },
	]
}

function createdTargets(input: FlowLayoutInput, lifelines: readonly FlowLayoutNode[], rows: SequenceRows): Set<string> {
	const ids = new Set<string>()
	for (const node of lifelines) {
		const edge = textProp(node, 'createdBy')
		if (edge !== undefined && rows.has(edge)) ids.add(node.id)
	}
	return ids
}

function spanOf(node: FlowLayoutNode, rows: SequenceRows, count: number): [number, number] {
	const first = rows.get(textProp(node, 'from') ?? '') ?? 0
	const last = rows.get(textProp(node, 'to') ?? '') ?? Math.max(0, count - 1)
	return [Math.min(first, last), Math.max(first, last)]
}

function coveredColumns(span: [number, number], edges: readonly FlowLayoutEdge[], rects: Record<string, FlowRect>): FlowRect[] {
	const ids = edges.slice(span[0], span[1] + 1).flatMap(edge => [edge.source, edge.target])
	const covered = ids.flatMap(id => rects[id] ?? [])
	return covered.length ? covered : Object.values(rects)
}

function fragmentRect(
	node: FlowLayoutNode,
	input: FlowLayoutInput,
	context: { rows: SequenceRows; rects: Record<string, FlowRect> },
): FlowRect {
	const span = spanOf(node, context.rows, input.edges.length)
	const columns = coveredColumns(span, input.edges, context.rects)
	const left = Math.min(...columns.map(rect => rect.x)) - FRAGMENT_SIDE
	const right = Math.max(...columns.map(rect => rect.x + rect.width)) + FRAGMENT_SIDE
	const top = rowY(span[0]) - FRAGMENT_TOP
	return { x: left, y: top, width: right - left, height: rowY(span[1]) + FRAGMENT_BOTTOM - top }
}

function inflate(rect: FlowRect, pad: number): FlowRect {
	return { x: rect.x - pad, y: rect.y - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
}

function union(first: FlowRect, second: FlowRect): FlowRect {
	const x = Math.min(first.x, second.x)
	const y = Math.min(first.y, second.y)
	const right = Math.max(first.x + first.width, second.x + second.width)
	const bottom = Math.max(first.y + first.height, second.y + second.height)
	return { x, y, width: right - x, height: bottom - y }
}

function isNestedIn(inner: [number, number], outer: [number, number]): boolean {
	const isInside = outer[0] <= inner[0] && outer[1] >= inner[1]
	return isInside && outer[1] - outer[0] > inner[1] - inner[0]
}

function wrapNested(rects: Record<string, FlowRect>, spans: ReadonlyMap<string, [number, number]>): void {
	const ids = [...spans.keys()].sort((a, b) => spanLength(spans.get(a)) - spanLength(spans.get(b)))
	ids.forEach((innerId, index) => {
		for (const outerId of ids.slice(index + 1)) {
			if (isNestedIn(spans.get(innerId) as [number, number], spans.get(outerId) as [number, number])) {
				rects[outerId] = union(rects[outerId], inflate(rects[innerId], NEST_PAD))
			}
		}
	})
}

function spanLength(span: [number, number] | undefined): number {
	return span ? span[1] - span[0] : 0
}

function boundsOf(rects: readonly FlowRect[], routes: readonly FlowPoint[][]): FlowRect {
	const xs = [...rects.flatMap(rect => [rect.x, rect.x + rect.width]), ...routes.flatMap(points => points.map(point => point.x))]
	const ys = [
		...rects.flatMap(rect => [rect.y + HEADER_TOP, rect.y + rect.height]),
		...routes.flatMap(points => points.map(point => point.y)),
	]
	if (!xs.length) return { x: 0, y: 0, width: 0, height: 0 }
	const x = Math.min(...xs)
	const y = Math.min(...ys)
	return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

function runSequence(input: FlowLayoutInput): FlowLayoutResult {
	const lifelines = input.nodes.filter(isLifeline)
	const fragments = input.nodes.filter(node => sequenceKindOf(node) === 'fragment')
	const columns = columnsOf(input, lifelines)
	const rows = rowsOf(input.edges)
	const lastRow = Math.max(0, input.edges.length - 1)
	const rects: Record<string, FlowRect> = {}
	for (const node of lifelines) rects[node.id] = lifelineRect(node, columns.get(node.id) ?? 0, { rows, lastRow })
	const created = createdTargets(input, lifelines, rows)
	const edges: Record<string, FlowPoint[]> = {}
	for (const edge of input.edges) edges[edge.id] = messageRoute(edge, rowY(rows.get(edge.id) ?? 0), { rects, created })
	for (const node of fragments) rects[node.id] = fragmentRect(node, input, { rows, rects })
	wrapNested(rects, new Map(fragments.map(node => [node.id, spanOf(node, rows, input.edges.length)])))
	const nodes = Object.fromEntries(Object.entries(rects))
	return { nodes, groups: {}, edges, bounds: boundsOf(Object.values(nodes), Object.values(edges)) }
}

export const sequenceLayout: FlowLayoutAlgorithm = { id: 'sequence', run: runSequence }
