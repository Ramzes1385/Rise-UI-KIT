import { ancestorsOf } from './groups'
import type { FlowLayoutResult } from '../../../types/api/flowLayout.types'
import type { FlowPoint, FlowRect } from '../../../types/data/flowData.types'
import type { StripContext, StripFrame, StripScope } from '../../../types/internal/core/flowLayoutInternal.types'

const PAD = 16

function snap(value: number, grid: number): number {
	return grid > 0 ? Math.round(value / grid) * grid : value
}

function union(rects: readonly FlowRect[]): FlowRect {
	if (rects.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
	const left = Math.min(...rects.map(rect => rect.x))
	const top = Math.min(...rects.map(rect => rect.y))
	const right = Math.max(...rects.map(rect => rect.x + rect.width))
	const bottom = Math.max(...rects.map(rect => rect.y + rect.height))
	return { x: left, y: top, width: right - left, height: bottom - top }
}

function bandRanges({ graph, index }: StripContext): [number, number][] {
	const count = Math.max(index.leaves.length, 1)
	const ranges: [number, number][] = []
	let edge = 0
	for (let band = 0; band < count; band += 1) {
		const members = graph.vertices.filter(vertex => vertex.band === band)
		const isFirst = ranges.length === 0
		const start = isFirst && members.length > 0 ? Math.min(...members.map(vertex => vertex.crossPos)) - PAD : edge
		const end = members.length > 0 ? Math.max(...members.map(vertex => vertex.crossPos + vertex.cross)) + PAD : start + PAD * 3
		ranges.push([start, end])
		edge = end
	}
	return ranges
}

function isReversed(context: StripContext): boolean {
	const { direction } = context.input.settings
	return direction === 'RL' || direction === 'BT'
}

function mainRange(context: StripContext, rows: [number, number]): [number, number] {
	const { spans, total } = context.placed
	const pad = Math.max(context.input.settings.rankGap / 2 - 6, 12)
	const start = spans[rows[0]].start - pad
	const end = spans[rows[1]].start + spans[rows[1]].size + pad
	return isReversed(context) ? [total - end, total - start] : [start, end]
}

function headerChain(context: StripContext, groupId: string): StripContext['index']['groups'] {
	return ancestorsOf(groupId, context.index.byId).filter(group => group.layout !== 'box')
}

function headerSum(chain: StripContext['index']['groups'], key: 'width' | 'height'): number {
	return chain.reduce((sum, group) => sum + group.header[key], 0)
}

function toRect(isOwnY: boolean, own: [number, number], full: [number, number]): FlowRect {
	const [x, y] = isOwnY ? [full, own] : [own, full]
	return { x: x[0], y: y[0], width: x[1] - x[0], height: y[1] - y[0] }
}

function frameOf(nodes: Record<string, FlowRect>): StripFrame {
	const box = union(Object.values(nodes))
	return { left: box.x - PAD, top: box.y - PAD, right: box.x + box.width + PAD, bottom: box.y + box.height + PAD }
}

function fullRange(scope: StripScope, groupId: string, isOwnY: boolean): [number, number] {
	const key = isOwnY ? 'width' : 'height'
	const strips = scope.index.groups.filter(group => group.layout !== 'box')
	const total = Math.max(0, ...strips.map(group => headerSum(headerChain(scope, group.id), key)))
	const offset = headerSum(headerChain(scope, groupId).slice(1), key)
	const { frame } = scope
	return isOwnY ? [frame.left - total + offset, frame.right] : [frame.top - total + offset, frame.bottom]
}

function subtreeBands(context: StripContext, groupId: string): number[] {
	return context.index.leaves
		.map((leaf, order) => ({ leaf, order }))
		.filter(({ leaf }) => ancestorsOf(leaf.id, context.index.byId).some(group => group.id === groupId))
		.map(({ order }) => order)
}

function bandStrip(scope: StripScope, groupId: string, isOwnY: boolean): FlowRect | null {
	const bands = subtreeBands(scope, groupId)
	if (bands.length === 0) return null
	const own: [number, number] = [
		Math.min(...bands.map(band => scope.ranges[band][0])),
		Math.max(...bands.map(band => scope.ranges[band][1])),
	]
	return toRect(isOwnY, own, fullRange(scope, groupId, isOwnY))
}

function stripFor(scope: StripScope, groupId: string): FlowRect | null {
	const group = scope.index.byId.get(groupId)
	if (!group || group.layout === 'box') return null
	const { direction } = scope.input.settings
	const isOwnY = (group.layout === 'band') === (direction === 'LR' || direction === 'RL')
	if (group.layout === 'band') return bandStrip(scope, groupId, isOwnY)
	const tier = scope.index.tiers.findIndex(item => item.id === groupId)
	const rows = scope.placed.rowsOf[tier] ?? [0, 0]
	return toRect(isOwnY, mainRange(scope, rows), fullRange(scope, groupId, isOwnY))
}

function shift(rect: FlowRect, delta: FlowPoint, grid: number): FlowRect {
	return { ...rect, x: snap(rect.x + delta.x, grid), y: snap(rect.y + delta.y, grid) }
}

function stripsOf(scope: StripScope): Record<string, FlowRect> {
	const groups: Record<string, FlowRect> = {}
	if (!scope.byLanes) return groups
	for (const group of scope.index.groups) {
		const rect = stripFor(scope, group.id)
		if (rect) groups[group.id] = rect
	}
	return groups
}

export function buildStrips(context: StripContext): FlowLayoutResult {
	const scope: StripScope = { ...context, frame: frameOf(context.nodes), ranges: bandRanges(context) }
	const groups = stripsOf(scope)
	const box = union([...Object.values(context.nodes), ...Object.values(groups)])
	const grid = context.input.settings.gridSize
	const delta = { x: -box.x, y: -box.y }
	const move = (record: Record<string, FlowRect>): Record<string, FlowRect> =>
		Object.fromEntries(Object.entries(record).map(([id, rect]) => [id, shift(rect, delta, grid)]))
	return { nodes: move(context.nodes), groups: move(groups), bounds: { x: 0, y: 0, width: box.width, height: box.height } }
}
