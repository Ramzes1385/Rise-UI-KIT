import { isAside, epcKindOf } from './epcRules'
import { layoutCompound } from '../../layout/compound'
import { applyFixed, snapToGrid } from '../../layout/placement'
import type { FlowRect, FlowSize } from '../../../types/data/flowData.types'
import type { EpcAsidePads, EpcAsideSides } from '../../../types/notations/process/epc.types'
import type {
	FlowLayoutAlgorithm,
	FlowLayoutEdge,
	FlowLayoutInput,
	FlowLayoutNode,
	FlowLayoutResult,
} from '../../../types/api/flowLayout.types'

const ASIDE_GAP = 28
const STACK_GAP = 8
const ORPHAN_GAP = 32

function widest(nodes: readonly FlowLayoutNode[]): number {
	return nodes.length ? Math.max(...nodes.map(node => node.size.width)) + ASIDE_GAP : 0
}

function stackHeight(nodes: readonly FlowLayoutNode[]): number {
	return nodes.reduce((total, node) => total + node.size.height, 0) + Math.max(0, nodes.length - 1) * STACK_GAP
}

function otherEnd(edge: FlowLayoutEdge, id: string): string | undefined {
	if (edge.source === id) return edge.target
	return edge.target === id ? edge.source : undefined
}

function ownerOf(node: FlowLayoutNode, input: FlowLayoutInput, asideIds: ReadonlySet<string>): string | undefined {
	const ends = input.edges.map(edge => otherEnd(edge, node.id))
	return ends.find(other => other !== undefined && !asideIds.has(other))
}

function collectSides(input: FlowLayoutInput): { sides: Map<string, EpcAsideSides>; orphans: FlowLayoutNode[] } {
	const aside = input.nodes.filter(isAside)
	const asideIds = new Set(aside.map(node => node.id))
	const sides = new Map<string, EpcAsideSides>()
	const orphans: FlowLayoutNode[] = []
	for (const node of aside) {
		const owner = ownerOf(node, input, asideIds)
		if (owner === undefined) {
			orphans.push(node)
			continue
		}
		const entry = sides.get(owner) ?? { left: [], right: [] }
		entry[epcKindOf(node) === 'org-unit' ? 'left' : 'right'].push(node)
		sides.set(owner, entry)
	}
	return { sides, orphans }
}

function padsOf(sides: Map<string, EpcAsideSides>): Map<string, EpcAsidePads> {
	return new Map(
		[...sides].map(([id, entry]) => {
			const pad = Math.max(widest(entry.left), widest(entry.right))
			return [id, { left: pad, right: pad, height: Math.max(stackHeight(entry.left), stackHeight(entry.right)) }]
		}),
	)
}

function padded(node: FlowLayoutNode, pads: Map<string, EpcAsidePads>): FlowLayoutNode {
	const pad = pads.get(node.id)
	if (!pad) return node
	const size: FlowSize = { width: node.size.width + pad.left + pad.right, height: Math.max(node.size.height, pad.height) }
	return { ...node, size }
}

function placeStack(nodes: readonly FlowLayoutNode[], column: number, center: number): Record<string, FlowRect> {
	const rects: Record<string, FlowRect> = {}
	let y = center - stackHeight(nodes) / 2
	for (const node of nodes) {
		rects[node.id] = { x: column - node.size.width, y, ...node.size }
		y += node.size.height + STACK_GAP
	}
	return rects
}

function settle(
	node: FlowLayoutNode,
	rect: FlowRect,
	context: { sides: Map<string, EpcAsideSides>; pads: Map<string, EpcAsidePads> },
): Record<string, FlowRect> {
	const pad = context.pads.get(node.id)
	const entry = context.sides.get(node.id)
	if (!pad || !entry) return { [node.id]: rect }
	const own: FlowRect = { x: rect.x + pad.left, y: rect.y + (rect.height - node.size.height) / 2, ...node.size }
	const center = own.y + own.height / 2
	const right = placeStack(entry.right, 0, center)
	const shifted = Object.fromEntries(Object.entries(right).map(([id, box]) => [id, { ...box, x: own.x + own.width + ASIDE_GAP }]))
	return { [node.id]: own, ...placeStack(entry.left, own.x - ASIDE_GAP, center), ...shifted }
}

function boundsOf(rects: readonly FlowRect[]): FlowRect {
	if (!rects.length) return { x: 0, y: 0, width: 0, height: 0 }
	const left = Math.min(...rects.map(rect => rect.x))
	const top = Math.min(...rects.map(rect => rect.y))
	const right = Math.max(...rects.map(rect => rect.x + rect.width))
	const bottom = Math.max(...rects.map(rect => rect.y + rect.height))
	return { x: left, y: top, width: right - left, height: bottom - top }
}

function placeOrphans(orphans: readonly FlowLayoutNode[], below: FlowRect): Record<string, FlowRect> {
	const rects: Record<string, FlowRect> = {}
	let x = below.x
	for (const node of orphans) {
		rects[node.id] = { x, y: below.y + below.height + ORPHAN_GAP, ...node.size }
		x += node.size.width + ASIDE_GAP
	}
	return rects
}

function runEpc(input: FlowLayoutInput): FlowLayoutResult {
	const { sides, orphans } = collectSides(input)
	const pads = padsOf(sides)
	const asideIds = new Set(input.nodes.filter(isAside).map(node => node.id))
	const main = input.nodes.filter(node => !asideIds.has(node.id))
	const edges = input.edges.filter(edge => !asideIds.has(edge.source) && !asideIds.has(edge.target))
	const flow = layoutCompound({
		...input,
		nodes: main.map(node => padded(node, pads)),
		edges,
		settings: { ...input.settings, direction: 'TB' },
	})
	const nodes: Record<string, FlowRect> = {}
	for (const node of main) Object.assign(nodes, settle(node, flow.nodes[node.id], { sides, pads }))
	Object.assign(nodes, placeOrphans(orphans, boundsOf(Object.values(nodes))))
	const result = { nodes, groups: flow.groups, bounds: boundsOf([...Object.values(nodes), ...Object.values(flow.groups)]) }
	const placed = snapToGrid(input, applyFixed(input, result))
	return { ...placed, bounds: boundsOf([...Object.values(placed.nodes), ...Object.values(placed.groups)]) }
}

export const epcLayout: FlowLayoutAlgorithm = { id: 'epc', run: runEpc }
