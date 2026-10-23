import { buildFlowGraph } from '../../model/data/flowGraph'
import type { FlowEdge, FlowMapData, FlowNode, FlowPort } from '../../types/data/flowData.types'
import type { FlowGraph, FlowLayoutInput, FlowLayoutNode } from '../../types/api/flowLayout.types'

export function node(id: string, kind: string, extra: string | Partial<FlowNode> = {}): FlowNode {
	return { id, kind, label: id, ...(typeof extra === 'string' ? { label: extra } : extra) }
}

export function edge(id: string, ends: string, extra: Partial<FlowEdge> = {}): FlowEdge {
	const [source = '', target = ''] = ends.split('>')
	return { id, source, target, ...extra }
}

export function mapData(nodes: FlowNode[], edges: FlowEdge[], notation?: string): FlowMapData {
	return { version: 1, notation, nodes, edges }
}

export function graphOf(nodes: FlowNode[], edges: FlowEdge[]): FlowGraph {
	return buildFlowGraph(mapData(nodes, edges))
}

export function fn(id: string, code?: string, extra: Partial<FlowNode> = {}): FlowNode {
	return node(id, 'function', { ...extra, props: { ...(code === undefined ? {} : { code }), ...extra.props } })
}

export function boundary(id: string, icom?: string, extra: Partial<FlowNode> = {}): FlowNode {
	return node(id, 'boundary', { ...extra, props: { ...(icom === undefined ? {} : { icom }), ...extra.props } })
}

export function port(id: string, role: string): FlowPort {
	return { id, role }
}

export function idef0Diagram(): { nodes: FlowNode[]; edges: FlowEdge[] } {
	return {
		nodes: [
			boundary('i1', 'input'),
			boundary('c1', 'control'),
			boundary('m1', 'mechanism'),
			boundary('o1', 'output'),
			fn('a1', 'A1'),
			fn('a2', 'A2'),
			fn('a3', 'A3'),
		],
		edges: [
			edge('e-i1', 'i1>a1', { targetPort: 'input' }),
			edge('e-c1', 'c1>a1', { targetPort: 'control' }),
			edge('e-m1', 'm1>a2', { targetPort: 'mechanism' }),
			edge('e-12', 'a1>a2', { sourcePort: 'output', targetPort: 'input', label: 'Заявка' }),
			edge('e-c2', 'a1>a3', { sourcePort: 'output', targetPort: 'control' }),
			edge('e-23', 'a2>a3', { sourcePort: 'output', targetPort: 'input' }),
			edge('e-o1', 'a3>o1', { sourcePort: 'output' }),
		],
	}
}

export function layoutNode(id: string, kind: string, extra: number | Partial<FlowLayoutNode> = 0): FlowLayoutNode {
	const isBoundary = kind === 'boundary'
	const size = isBoundary ? { width: 150, height: 28 } : { width: 170, height: 96 }
	return { id, kind, order: 0, size, ...(typeof extra === 'number' ? { order: extra } : extra) }
}

export function layoutInput(
	nodes: FlowLayoutNode[],
	edges: FlowLayoutInput['edges'] = [],
	settings: Partial<FlowLayoutInput['settings']> = {},
): FlowLayoutInput {
	return {
		nodes,
		edges,
		groups: [],
		settings: { direction: 'LR', nodeGap: 40, rankGap: 80, gridSize: 8, ...settings },
	}
}
