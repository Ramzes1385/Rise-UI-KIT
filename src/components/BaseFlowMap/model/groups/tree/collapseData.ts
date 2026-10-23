import { blockGroup, indexGroups } from './groupTree'
import type { FlowCollapseScope, FlowGroupTexts } from '../../../types/internal/flowGroups.types'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode } from '../../../types/data/flowData.types'

export const FLOW_COLLAPSED_KIND = 'collapsed-group'

function blockNode(group: FlowGroup, count: number, texts: FlowGroupTexts): FlowNode {
	const { position, size } = group
	const hasSize = size?.width !== undefined && size.height !== undefined
	return {
		...{ id: group.id, kind: FLOW_COLLAPSED_KIND, label: group.label, subtitle: texts.items(count), group: group.parent },
		props: { isCollapsedGroup: true, count, color: group.color ?? '', groupKind: group.kind, groupProps: group.props ?? {} },
		...(position ? { position } : undefined),
		...(hasSize ? { size: { width: size.width as number, height: size.height as number } } : undefined),
	}
}

function endOf(id: string, owners: ReadonlyMap<string, string>): string {
	return owners.get(id) ?? id
}

function mergedEdge(edges: readonly FlowEdge[], ends: { source: string; target: string }, texts: FlowGroupTexts): FlowEdge {
	const { sourcePort: _sourcePort, targetPort: _targetPort, ...first } = edges[0]
	const moved = { ...first, ...ends }
	if (edges.length === 1) return moved
	return { ...moved, id: `collapsed:${ends.source}>${ends.target}`, label: texts.links(edges.length) }
}

function collapseEdges(edges: readonly FlowEdge[], owners: ReadonlyMap<string, string>, texts: FlowGroupTexts): FlowEdge[] {
	const buckets = new Map<string, { ends: { source: string; target: string }; edges: FlowEdge[]; isMapped: boolean }>()
	for (const edge of edges) {
		const ends = { source: endOf(edge.source, owners), target: endOf(edge.target, owners) }
		const isMapped = ends.source !== edge.source || ends.target !== edge.target
		if (isMapped && ends.source === ends.target) continue
		const key = `${ends.source}\u0000${ends.target}`
		const bucket = buckets.get(key) ?? { ends, edges: [], isMapped: false }
		bucket.edges.push(edge)
		bucket.isMapped = bucket.isMapped || isMapped
		buckets.set(key, bucket)
	}
	return [...buckets.values()].flatMap(bucket => (bucket.isMapped ? [mergedEdge(bucket.edges, bucket.ends, texts)] : bucket.edges))
}

function ownersOf(data: FlowMapData, scope: FlowCollapseScope): { owners: Map<string, string>; counts: Map<string, number> } {
	const owners = new Map<string, string>()
	const counts = new Map<string, number>()
	for (const node of data.nodes) {
		const block = blockGroup(node.group, scope.byId, scope.collapsed)
		if (!block) continue
		owners.set(node.id, block.id)
		counts.set(block.id, (counts.get(block.id) ?? 0) + 1)
	}
	return { owners, counts }
}

export function collapseFlowData(data: FlowMapData, collapsed: ReadonlySet<string>, texts: FlowGroupTexts): FlowMapData {
	if (collapsed.size === 0) return data
	const scope = { byId: indexGroups(data.groups), collapsed }
	const { owners, counts } = ownersOf(data, scope)
	const blocks = (data.groups ?? []).filter(group => collapsed.has(group.id) && !blockGroup(group.parent, scope.byId, collapsed))
	const nodes = [
		...data.nodes.filter(node => !owners.has(node.id)),
		...blocks.map(group => blockNode(group, counts.get(group.id) ?? 0, texts)),
	]
	const groups = (data.groups ?? []).filter(group => !blockGroup(group.id, scope.byId, collapsed))
	const edges = collapseEdges(data.edges, owners, texts)
	return { ...data, nodes, edges, ...(data.groups ? { groups } : undefined) }
}
