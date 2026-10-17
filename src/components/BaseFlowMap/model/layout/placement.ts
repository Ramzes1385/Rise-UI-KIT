import type { FlowRect } from '../../types/data/flowData.types'
import type { FlowLayoutInput, FlowLayoutResult } from '../../types/api/flowLayout.types'

const PUSH_GAP = 16
const MAX_ROUNDS = 40

function snap(value: number, grid: number): number {
	return grid > 0 ? Math.round(value / grid) * grid : value
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
	if (rects.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
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

export function applyFixed(input: FlowLayoutInput, result: FlowLayoutResult): FlowLayoutResult {
	const fixed = input.nodes.filter(node => node.fixed)
	if (fixed.length === 0) return result
	const nodes = { ...result.nodes }
	for (const node of fixed) nodes[node.id] = { ...node.size, x: node.fixed?.x ?? 0, y: node.fixed?.y ?? 0 }
	clearFixed(input, nodes, new Set(fixed.map(node => node.id)))
	const next = { ...result, nodes }
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
