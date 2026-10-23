import { collectFlowIds } from '../../data/flowIds'
import type { FlowEditClip } from '../../../types/internal/edit/flowEdit.types'
import type { FlowMapData, FlowPoint } from '../../../types/data/flowData.types'
import type { FlowPasted } from '../../../types/internal/edit/flowEditApi.types'

export const PASTE_OFFSET = 24

export function buildClip(data: FlowMapData, ids: readonly string[], rects: Record<string, FlowPoint>): FlowEditClip {
	const chosen = new Set(ids)
	const groups = (data.groups ?? []).filter(group => chosen.has(group.id))
	const groupIds = new Set(groups.map(group => group.id))
	const nodes = data.nodes
		.filter(node => chosen.has(node.id) || (node.group !== undefined && groupIds.has(node.group)))
		.map(node => ({ ...node, position: node.position ?? rects[node.id] }))
	const nodeIds = new Set(nodes.map(node => node.id))
	const edges = data.edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target))
	return { riseFlow: 1, nodes, edges, groups }
}

export function parseClip(text: string): FlowEditClip | null {
	try {
		const value = JSON.parse(text) as Partial<FlowEditClip> | null
		if (!value || value.riseFlow !== 1 || !Array.isArray(value.nodes)) return null
		return { riseFlow: 1, nodes: value.nodes, edges: value.edges ?? [], groups: value.groups ?? [] }
	} catch {
		return null
	}
}

function freshId(prefix: string, taken: Set<string>): string {
	let index = taken.size + 1
	while (taken.has(`${prefix}-${index}`)) index += 1
	const id = `${prefix}-${index}`
	taken.add(id)
	return id
}

export function pasteClip(data: FlowMapData, clip: FlowEditClip, offset: FlowPoint): FlowPasted {
	const taken = collectFlowIds(data)
	const ids = new Map<string, string>()
	const renamed = (prefix: string, id: string): string => {
		const next = freshId(prefix, taken)
		ids.set(id, next)
		return next
	}
	const groups = clip.groups.map(group => ({ ...group, id: renamed('g', group.id) }))
	const nodes = clip.nodes.map(node => ({ ...node, id: renamed('n', node.id) }))
	for (const group of groups) group.parent = group.parent === undefined ? undefined : ids.get(group.parent)
	for (const node of nodes) {
		node.group = node.group === undefined ? undefined : ids.get(node.group)
		node.position = node.position ? { x: node.position.x + offset.x, y: node.position.y + offset.y } : undefined
		node.isPinned = node.position ? true : node.isPinned
	}
	const edges = clip.edges.flatMap(edge => {
		const source = ids.get(edge.source)
		const target = ids.get(edge.target)
		return source && target ? [{ ...edge, id: renamed('e', edge.id), source, target, points: undefined }] : []
	})
	return { nodes, edges, groups }
}
