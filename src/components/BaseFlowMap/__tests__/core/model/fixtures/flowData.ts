import type { FlowEdge, FlowGroup, FlowMapData, FlowNode } from '../../../../types/data/flowData.types'

export function node(id: string, extra: Partial<FlowNode> = {}): FlowNode {
	return { id, kind: 'service', label: id, ...extra }
}

export function edge(id: string, ends: [string, string], extra: Partial<FlowEdge> = {}): FlowEdge {
	return { id, source: ends[0], target: ends[1], ...extra }
}

export function group(id: string, extra: Partial<FlowGroup> = {}): FlowGroup {
	return { id, kind: 'zone', label: id, ...extra }
}

export function map(extra: Partial<FlowMapData> = {}): FlowMapData {
	return { version: 1, nodes: [], edges: [], ...extra }
}
