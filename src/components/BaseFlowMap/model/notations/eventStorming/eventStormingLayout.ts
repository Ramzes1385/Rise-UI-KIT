import { stormingKindOf } from './eventStormingRules'
import { applyFixed, snapToGrid } from '../../layout/placement'
import type { FlowRect } from '../../../types/data/flowData.types'
import type {
	FlowLayoutAlgorithm,
	FlowLayoutEdge,
	FlowLayoutGroup,
	FlowLayoutInput,
	FlowLayoutNode,
	FlowLayoutResult,
} from '../../../types/api/flowLayout.types'

export const TIMELINE_LANES = [
	'actor',
	'command',
	'aggregate',
	'external-system',
	'policy',
	'domain-event',
	'read-model',
	'hotspot',
	'opportunity',
]

const GAP_X = 36
const GAP_Y = 20
const LANE_GAP = 28
const CONTEXT_PAD = 20
const ORIGIN = { x: 0, y: 0 }

function backEdges(nodes: readonly FlowLayoutNode[], edges: readonly FlowLayoutEdge[]): Set<string> {
	const out = new Map<string, FlowLayoutEdge[]>()
	for (const edge of edges) out.set(edge.source, [...(out.get(edge.source) ?? []), edge])
	const state = new Map<string, 'gray' | 'black'>()
	const back = new Set<string>()
	const visit = (id: string): void => {
		state.set(id, 'gray')
		for (const edge of out.get(id) ?? []) {
			if (state.get(edge.target) === 'gray') back.add(edge.id)
			else if (!state.has(edge.target)) visit(edge.target)
		}
		state.set(id, 'black')
	}
	for (const node of nodes) if (!state.has(node.id)) visit(node.id)
	return back
}

function ranksOf(nodes: readonly FlowLayoutNode[], edges: readonly FlowLayoutEdge[]): Map<string, number> {
	const ids = new Set(nodes.map(node => node.id))
	const back = backEdges(nodes, edges)
	const forward = edges.filter(edge => !back.has(edge.id) && edge.source !== edge.target && ids.has(edge.source) && ids.has(edge.target))
	const ranks = new Map(nodes.map(node => [node.id, 0]))
	for (let round = 0; round < nodes.length; round += 1) {
		let isChanged = false
		for (const edge of forward) {
			const wanted = (ranks.get(edge.source) ?? 0) + 1
			if (wanted > (ranks.get(edge.target) ?? 0)) {
				ranks.set(edge.target, wanted)
				isChanged = true
			}
		}
		if (!isChanged) break
	}
	return ranks
}

function laneIndex(node: FlowLayoutNode): number {
	const index = TIMELINE_LANES.indexOf(stormingKindOf(node))
	return index < 0 ? TIMELINE_LANES.length : index
}

function columnX(nodes: readonly FlowLayoutNode[], ranks: Map<string, number>): number[] {
	const count = Math.max(0, ...ranks.values()) + 1
	const widths = Array.from({ length: count }, () => 0)
	for (const node of nodes) widths[ranks.get(node.id) ?? 0] = Math.max(widths[ranks.get(node.id) ?? 0], node.size.width)
	const xs: number[] = []
	let cursor = ORIGIN.x
	for (const width of widths) {
		xs.push(cursor)
		cursor += width + GAP_X
	}
	return xs.map((x, index) => x + widths[index] / 2)
}

function slotsOf(nodes: readonly FlowLayoutNode[], ranks: Map<string, number>): Map<string, number> {
	const used = new Map<string, number>()
	const slots = new Map<string, number>()
	for (const node of nodes) {
		const key = `${laneIndex(node)}:${ranks.get(node.id)}`
		slots.set(node.id, used.get(key) ?? 0)
		used.set(key, (used.get(key) ?? 0) + 1)
	}
	return slots
}

function laneTops(nodes: readonly FlowLayoutNode[], slots: Map<string, number>): Map<number, number> {
	const heights = new Map<number, number>()
	for (const node of nodes) {
		const lane = laneIndex(node)
		const need = ((slots.get(node.id) ?? 0) + 1) * (node.size.height + GAP_Y)
		heights.set(lane, Math.max(heights.get(lane) ?? 0, need))
	}
	const tops = new Map<number, number>()
	let cursor = ORIGIN.y
	for (const lane of [...heights.keys()].sort((a, b) => a - b)) {
		tops.set(lane, cursor)
		cursor += (heights.get(lane) ?? 0) + LANE_GAP
	}
	return tops
}

function placeNodes(nodes: readonly FlowLayoutNode[], edges: readonly FlowLayoutEdge[]): Record<string, FlowRect> {
	const ranks = ranksOf(nodes, edges)
	const centers = columnX(nodes, ranks)
	const slots = slotsOf(nodes, ranks)
	const tops = laneTops(nodes, slots)
	const rects: Record<string, FlowRect> = {}
	for (const node of nodes) {
		const center = centers[ranks.get(node.id) ?? 0]
		const y = (tops.get(laneIndex(node)) ?? 0) + (slots.get(node.id) ?? 0) * (node.size.height + GAP_Y)
		rects[node.id] = { x: center - node.size.width / 2, y, ...node.size }
	}
	return rects
}

function union(rects: readonly FlowRect[]): FlowRect {
	const left = Math.min(...rects.map(rect => rect.x))
	const top = Math.min(...rects.map(rect => rect.y))
	const right = Math.max(...rects.map(rect => rect.x + rect.width))
	const bottom = Math.max(...rects.map(rect => rect.y + rect.height))
	return { x: left, y: top, width: right - left, height: bottom - top }
}

function depthOf(group: FlowLayoutGroup, byId: ReadonlyMap<string, FlowLayoutGroup>): number {
	let depth = 0
	let parent = group.parent
	while (parent !== undefined && depth < 16) {
		depth += 1
		parent = byId.get(parent)?.parent
	}
	return depth
}

function placeGroups(input: FlowLayoutInput, nodes: Record<string, FlowRect>): Record<string, FlowRect> {
	const byId = new Map(input.groups.map(group => [group.id, group]))
	const rects: Record<string, FlowRect> = {}
	const deepFirst = [...input.groups].sort((a, b) => depthOf(b, byId) - depthOf(a, byId))
	for (const group of deepFirst) {
		const own = input.nodes.filter(node => node.group === group.id).map(node => nodes[node.id])
		const children = input.groups.filter(child => child.parent === group.id && rects[child.id]).map(child => rects[child.id])
		const members = [...own, ...children]
		if (!members.length) continue
		const box = union(members)
		rects[group.id] = {
			x: box.x - CONTEXT_PAD,
			y: box.y - CONTEXT_PAD - group.header.height,
			width: box.width + CONTEXT_PAD * 2,
			height: box.height + CONTEXT_PAD * 2 + group.header.height,
		}
	}
	return rects
}

function runTimeline(input: FlowLayoutInput): FlowLayoutResult {
	const nodes = placeNodes(input.nodes, input.edges)
	const groups = placeGroups(input, nodes)
	const placed = snapToGrid(input, applyFixed(input, { nodes, groups, bounds: { x: 0, y: 0, width: 0, height: 0 } }))
	const all = [...Object.values(placed.nodes), ...Object.values(placed.groups)]
	return { ...placed, bounds: all.length ? union(all) : { x: 0, y: 0, width: 0, height: 0 } }
}

export const timelineLayout: FlowLayoutAlgorithm = { id: 'timeline', run: runTimeline }
