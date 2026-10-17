import { findNodeKind } from '../notations/resolveKind'
import type { FlowNotation } from '../../types/api/flowNotation.types'
import type { FlowNormalizeContext } from '../../types/internal/core/flowCore.types'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode } from '../../types/data/flowData.types'

function normalizeNode(node: FlowNode, { notation, registry }: FlowNormalizeContext): FlowNode {
	if (node.isExternal !== undefined) return node
	const isExternal = findNodeKind(node.kind, notation, registry)?.isExternal
	return isExternal ? { ...node, isExternal } : node
}

function normalizeEdge(edge: FlowEdge, { notation }: FlowNormalizeContext): FlowEdge {
	return edge.kind === undefined ? { ...edge, kind: notation.defaultEdgeKind } : edge
}

function sortGroups(groups: readonly FlowGroup[]): FlowGroup[] {
	return groups
		.map((group, index) => ({ group, index }))
		.sort((left, right) => (left.group.order ?? left.index) - (right.group.order ?? right.index) || left.index - right.index)
		.map(({ group }) => group)
}

function mapStable<T>(list: readonly T[], map: (item: T) => T): readonly T[] {
	const next = list.map(map)
	return next.some((item, index) => item !== list[index]) ? next : list
}

export function normalizeFlowData(data: FlowMapData, notation: FlowNotation, registry: ReadonlyMap<string, FlowNotation>): FlowMapData {
	const context = { notation, registry }
	const nodes = mapStable(data.nodes, node => normalizeNode(node, context)) as FlowNode[]
	const edges = mapStable(data.edges, edge => normalizeEdge(edge, context)) as FlowEdge[]
	const groups = data.groups ? sortGroups(data.groups) : undefined
	const isSame = nodes === data.nodes && edges === data.edges && (!groups || groups.every((group, i) => group === data.groups?.[i]))
	return isSame ? data : { ...data, nodes, edges, ...(groups ? { groups } : {}) }
}
