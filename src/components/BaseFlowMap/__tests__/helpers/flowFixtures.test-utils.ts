import { buildFlowGraph } from '../../model/data/flowGraph'
import type { FlowGraph } from '../../types/api/flowLayout.types'
import type { FlowScenarioAction } from '../../types/data/flowScenario.types'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode } from '../../types/data/flowData.types'

export function node(id: string, kind = 'service', extra: Partial<FlowNode> = {}): FlowNode {
	return { id, kind, label: id.toUpperCase(), ...extra }
}

export function edge(id: string, source: string, ...rest: [target: string, extra?: Partial<FlowEdge>]): FlowEdge {
	return { id, source, target: rest[0], ...rest[1] }
}

export function graphOf(nodes: FlowNode[], edges: FlowEdge[]): FlowGraph {
	return buildFlowGraph({ version: 1, nodes, edges })
}

export function act(id: string, extra: Partial<FlowScenarioAction> = {}): FlowScenarioAction {
	return { id, ...extra }
}

export function mapOf(parts: { nodes: FlowNode[]; edges?: FlowEdge[]; groups?: FlowGroup[] }): FlowMapData {
	return { version: 1, nodes: parts.nodes, edges: parts.edges ?? [], groups: parts.groups }
}

export function group(id: string, kind: string, extra: Partial<FlowGroup> = {}): FlowGroup {
	return { id, kind, label: id.toUpperCase(), ...extra }
}
