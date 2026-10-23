import type { FlowRect } from '../../types/data/flowData.types'
import type { FlowLayoutInput, FlowLayoutResult } from '../../types/api/flowLayout.types'

const PUSH_GAP = 16
const MAX_ROUNDS = 40

function snap(value: number, grid: number): number {
	return Math.round(value / grid) * grid
}

function overlaps(a: FlowRect, b: FlowRect): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function pushed(free: FlowRect, fixed: FlowRect, direction: string): FlowRect {
	if (direction === 'LR') return { ...free, x: fixed.x + fixed.width + PUSH_GAP }
	if (direction === 'RL') return { ...free, x: fixed.x - free.width - PUSH_GAP }
	if (direction === 'BT') return { ...free, y: fixed.y - free.height - PUSH_GAP }
	return { ...free, y: fixed.y + fixed.height + PUSH_GAP }
}

function boundsOf(result: Pick<FlowLayoutResult, 'nodes' | 'groups'>): FlowRect {
	const rects = [...Object.values(result.nodes), ...Object.values(result.groups)]
	const left = Math.min(...rects.map(rect => rect.x))
	const top = Math.min(...rects.map(rect => rect.y))
	const right = Math.max(...rects.map(rect => rect.x + rect.width))
	const bottom = Math.max(...rects.map(rect => rect.y + rect.height))
	return { x: left, y: top, width: right - left, height: bottom - top }
}

function clearFixed(input: FlowLayoutInput, nodes: Record<string, FlowRect>, fixedIds: ReadonlySet<string>): void {
	const free = input.nodes.filter(node => !fixedIds.has(node.id))
	for (let round = 0; round < MAX_ROUNDS; round += 1) {
		let isMoved = false
		for (const node of free) {
			const hit = [...fixedIds].find(id => overlaps(nodes[node.id], nodes[id]))
			if (hit === undefined) continue
			nodes[node.id] = pushed(nodes[node.id], nodes[hit], input.settings.direction)
			isMoved = true
		}
		if (!isMoved) return
	}
}

function enclose(rect: FlowRect, inner: FlowRect): FlowRect {
	const left = Math.min(rect.x, inner.x)
	const top = Math.min(rect.y, inner.y)
	return {
		x: left,
		y: top,
		width: Math.max(rect.x + rect.width, inner.x + inner.width) - left,
		height: Math.max(rect.y + rect.height, inner.y + inner.height) - top,
	}
}

function growGroups(input: FlowLayoutInput, result: FlowLayoutResult, nodes: Record<string, FlowRect>): Record<string, FlowRect> {
	const groups = { ...result.groups }
	const byId = new Map(input.groups.map(group => [group.id, group]))
	for (const node of input.nodes) {
		if (!node.fixed) continue
		for (let group = byId.get(node.group ?? ''); group; group = byId.get(group.parent ?? '')) {
			if (group.layout === 'box' && groups[group.id]) groups[group.id] = enclose(groups[group.id], nodes[node.id])
		}
	}
	return groups
}

export function applyFixed(input: FlowLayoutInput, result: FlowLayoutResult): FlowLayoutResult {
	const fixed = input.nodes.flatMap(node => (node.fixed ? [{ node, at: node.fixed }] : []))
	if (fixed.length === 0) return result
	const nodes = { ...result.nodes }
	for (const { node, at } of fixed) nodes[node.id] = { ...node.size, x: at.x, y: at.y }
	clearFixed(input, nodes, new Set(fixed.map(item => item.node.id)))
	const next = { ...result, nodes, groups: growGroups(input, result, nodes) }
	return { ...next, bounds: boundsOf(next) }
}

export function snapToGrid(input: FlowLayoutInput, result: FlowLayoutResult): FlowLayoutResult {
	const grid = input.settings.gridSize
	if (grid <= 0) return result
	const fixedIds = new Set(input.nodes.filter(node => node.fixed).map(node => node.id))
	const nodes = Object.fromEntries(
		Object.entries(result.nodes).map(([id, rect]) => [
			id,
			fixedIds.has(id) ? rect : { ...rect, x: snap(rect.x, grid), y: snap(rect.y, grid) },
		]),
	)
	return { ...result, nodes }
}
