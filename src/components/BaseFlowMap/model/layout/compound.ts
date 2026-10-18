import { layoutFlat } from './layered/layered'
import { ancestorsOf, indexGroups } from './layered/groups'
import type { FlowRect } from '../../types/data/flowData.types'
import type { BoxLayout, BoxLevel } from '../../types/internal/core/flowLayoutInternal.types'
import type { FlowLayoutGroup, FlowLayoutInput, FlowLayoutNode, FlowLayoutResult } from '../../types/api/flowLayout.types'

const BOX_PAD = 16
const SUPER_PREFIX = 'box:'

function nearestBox(groupId: string | undefined, level: BoxLevel): string | undefined {
	return ancestorsOf(groupId, level.byId).find(group => group.layout === 'box')?.id
}

function nearestStrip(groupId: string | undefined, level: BoxLevel): string | undefined {
	return ancestorsOf(groupId, level.byId).find(group => group.layout !== 'box')?.id
}

function levelBoxes(level: BoxLevel): FlowLayoutGroup[] {
	return level.input.groups.filter(group => group.layout === 'box' && nearestBox(group.parent, level) === level.owner)
}

function boxAtLevel(node: FlowLayoutNode, level: BoxLevel): string | undefined {
	const chain = ancestorsOf(node.group, level.byId).filter(group => group.layout === 'box')
	return chain.find(group => nearestBox(group.parent, level) === level.owner)?.id
}

function measureBox(box: FlowLayoutGroup, level: BoxLevel): BoxLayout {
	const inner = layoutBoxLevel({ ...level, owner: box.id })
	const width = inner.bounds.width + BOX_PAD * 2 + box.header.width
	const height = inner.bounds.height + BOX_PAD * 2 + box.header.height
	return { box, inner, size: { width, height } }
}

function flatNodes(level: BoxLevel, boxes: readonly BoxLayout[]): FlowLayoutNode[] {
	const isRoot = level.owner === undefined
	const own = level.input.nodes
		.filter(node => nearestBox(node.group, level) === level.owner)
		.map(node => ({ ...node, group: isRoot ? nearestStrip(node.group, level) : undefined }))
	const supers = boxes.map(({ box, size }, order): FlowLayoutNode => {
		const group = isRoot ? nearestStrip(box.parent, level) : undefined
		return { id: SUPER_PREFIX + box.id, kind: 'box', size, group, order: level.input.nodes.length + order }
	})
	return [...own, ...supers]
}

function flatEdges(level: BoxLevel, ids: ReadonlySet<string>) {
	const owners = new Map(level.input.nodes.map(node => [node.id, boxAtLevel(node, level)]))
	const resolve = (id: string): string => {
		const box = owners.get(id)
		return box === undefined ? id : SUPER_PREFIX + box
	}
	return level.input.edges
		.map(edge => ({ ...edge, source: resolve(edge.source), target: resolve(edge.target) }))
		.filter(edge => edge.source !== edge.target && ids.has(edge.source) && ids.has(edge.target))
}

function translate(rect: FlowRect, dx: number, dy: number): FlowRect {
	return { ...rect, x: rect.x + dx, y: rect.y + dy }
}

function mergeInner(target: FlowLayoutResult, layout: BoxLayout, frame: FlowRect): void {
	const dx = frame.x + BOX_PAD + layout.box.header.width
	const dy = frame.y + BOX_PAD + layout.box.header.height
	for (const [id, rect] of Object.entries(layout.inner.nodes)) target.nodes[id] = translate(rect, dx, dy)
	for (const [id, rect] of Object.entries(layout.inner.groups)) target.groups[id] = translate(rect, dx, dy)
}

function expandBoxes(flat: FlowLayoutResult, boxes: readonly BoxLayout[]): FlowLayoutResult {
	const result: FlowLayoutResult = { nodes: { ...flat.nodes }, groups: { ...flat.groups }, bounds: flat.bounds }
	for (const layout of boxes) {
		const key = SUPER_PREFIX + layout.box.id
		const frame = result.nodes[key]
		delete result.nodes[key]
		result.groups[layout.box.id] = frame
		mergeInner(result, layout, frame)
	}
	return result
}

function layoutBoxLevel(level: BoxLevel): FlowLayoutResult {
	const boxes = levelBoxes(level).map(box => measureBox(box, level))
	const nodes = flatNodes(level, boxes)
	const ids = new Set(nodes.map(node => node.id))
	const isRoot = level.owner === undefined
	const groups = isRoot ? level.input.groups.filter(group => group.layout !== 'box') : []
	const flat = layoutFlat({ ...level.input, nodes, edges: flatEdges(level, ids), groups })
	return expandBoxes(flat, boxes)
}

export function layoutCompound(input: FlowLayoutInput): FlowLayoutResult {
	const hasBoxes = input.groups.some(group => group.layout === 'box')
	if (!hasBoxes) return layoutFlat(input)
	return layoutBoxLevel({ input, byId: indexGroups(input.groups), owner: undefined })
}
