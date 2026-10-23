import { stormingKindOf } from './eventStormingRules'
import { applyFixed, snapToGrid } from '../../layout/placement'
import type { FlowRect } from '../../../types/data/flowData.types'
import type { TimelineBlock } from '../../../types/notations/architecture/eventStorming.types'
import type {
	FlowLayoutAlgorithm,
	FlowLayoutEdge,
	FlowLayoutGroup,
	FlowLayoutInput,
	FlowLayoutNode,
	FlowLayoutResult,
} from '../../../types/api/flowLayout.types'

const TIMELINE_LANES = [
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
const RANKS_PER_COLUMN = 2
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
			const wanted = (ranks.get(edge.source) as number) + 1
			if (wanted > (ranks.get(edge.target) as number)) {
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

function rootOf(group: string | undefined, byId: ReadonlyMap<string, FlowLayoutGroup>): string | undefined {
	let current = group
	for (let depth = 0; current !== undefined && depth < 16; depth += 1) {
		const parent = byId.get(current)?.parent
		if (parent === undefined) return current
		current = parent
	}
	return current
}

function stepOf(node: FlowLayoutNode, ranks: Map<string, number>): number {
	return Math.floor((ranks.get(node.id) as number) / RANKS_PER_COLUMN)
}

function blocksOf(input: FlowLayoutInput, ranks: Map<string, number>): TimelineBlock[] {
	const byId = new Map(input.groups.map(group => [group.id, group]))
	const blocks = new Map<string, TimelineBlock>()
	input.nodes.forEach((node, index) => {
		const step = stepOf(node, ranks)
		const root = rootOf(node.group, byId)
		const key = root === undefined ? `step:${step}` : `group:${root}`
		const block = blocks.get(key) ?? { isGroup: root !== undefined, first: index, steps: new Set<number>(), nodes: [] }
		block.steps.add(step)
		block.nodes.push(node)
		blocks.set(key, block)
	})
	const start = (block: TimelineBlock): number => Math.min(...block.steps)
	return [...blocks.values()].sort((a, b) => start(a) - start(b) || a.first - b.first)
}

function columnXs(widths: readonly number[], gaps: readonly number[]): number[] {
	const xs: number[] = []
	let cursor = ORIGIN.x
	widths.forEach((width, column) => {
		cursor += gaps[column]
		xs.push(cursor + width / 2)
		cursor += width + GAP_X
	})
	return xs
}

function columnsOf(input: FlowLayoutInput, ranks: Map<string, number>): { index: Map<string, number>; xs: number[] } {
	const index = new Map<string, number>()
	const gaps: number[] = []
	const widths: number[] = []
	for (const block of blocksOf(input, ranks)) {
		const base = widths.length
		const local = new Map([...block.steps].sort((a, b) => a - b).map((step, order) => [step, base + order]))
		for (let order = 0; order < local.size; order += 1) {
			gaps.push(order === 0 && block.isGroup ? CONTEXT_PAD * 2 : 0)
			widths.push(0)
		}
		for (const node of block.nodes) {
			const column = local.get(stepOf(node, ranks)) as number
			index.set(node.id, column)
			widths[column] = Math.max(widths[column], node.size.width)
		}
	}
	return { index, xs: columnXs(widths, gaps) }
}

function slotsOf(nodes: readonly FlowLayoutNode[], columns: Map<string, number>): Map<string, number> {
	const used = new Map<string, number>()
	const slots = new Map<string, number>()
	for (const node of nodes) {
		const key = `${laneIndex(node)}:${columns.get(node.id)}`
		const slot = used.get(key) ?? 0
		slots.set(node.id, slot)
		used.set(key, slot + 1)
	}
	return slots
}

function laneTops(nodes: readonly FlowLayoutNode[], slots: Map<string, number>): Map<number, number> {
	const heights = new Map<number, number>()
	for (const node of nodes) {
		const lane = laneIndex(node)
		const need = ((slots.get(node.id) as number) + 1) * (node.size.height + GAP_Y)
		heights.set(lane, Math.max(heights.get(lane) ?? 0, need))
	}
	const tops = new Map<number, number>()
	let cursor = ORIGIN.y
	for (const lane of [...heights.keys()].sort((a, b) => a - b)) {
		tops.set(lane, cursor)
		cursor += (heights.get(lane) as number) + LANE_GAP
	}
	return tops
}

function placeNodes(input: FlowLayoutInput): Record<string, FlowRect> {
	const ranks = ranksOf(input.nodes, input.edges)
	const columns = columnsOf(input, ranks)
	const slots = slotsOf(input.nodes, columns.index)
	const tops = laneTops(input.nodes, slots)
	const rects: Record<string, FlowRect> = {}
	for (const node of input.nodes) {
		const center = columns.xs[columns.index.get(node.id) as number]
		const y = (tops.get(laneIndex(node)) as number) + (slots.get(node.id) as number) * (node.size.height + GAP_Y)
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
	const nodes = placeNodes(input)
	const groups = placeGroups(input, nodes)
	const placed = snapToGrid(input, applyFixed(input, { nodes, groups, bounds: { x: 0, y: 0, width: 0, height: 0 } }))
	const all = [...Object.values(placed.nodes), ...Object.values(placed.groups)]
	return { ...placed, bounds: all.length ? union(all) : { x: 0, y: 0, width: 0, height: 0 } }
}

export const timelineLayout: FlowLayoutAlgorithm = { id: 'timeline', run: runTimeline }
