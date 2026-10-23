import { flowServices } from '../../../model/notations/services'
import type { FlowNotation } from '../../../types/api/flowNotation.types'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode } from '../../../types/data/flowData.types'

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

export const zoomNotation: FlowNotation = {
	...flowServices,
	id: 'zoomy',
	semanticZoom: [
		{ minZoom: 0.5, depth: 0, label: () => 'Контекст' },
		{ minZoom: 1, depth: 1, label: () => 'Контейнеры' },
	],
	semanticZoomLabel: () => 'Компоненты',
}

export const plainZoomNotation: FlowNotation = {
	...flowServices,
	id: 'zoomy-plain',
	semanticZoom: [{ minZoom: 0.5, depth: 0 }],
}

export function tree(extra: Partial<FlowMapData> = {}): FlowMapData {
	return map({
		notation: 'zoomy',
		title: 'Система',
		groups: [group('g1', { label: 'Шлюз' }), group('g2', { label: 'Платежи', parent: 'g1' })],
		nodes: [
			node('a', { label: 'Alpha', group: 'g1' }),
			node('b', { label: 'Beta', group: 'g1' }),
			node('c', { label: 'Gamma', group: 'g2' }),
			node('d', { label: 'Delta' }),
		],
		edges: [
			edge('e1', ['a', 'b'], { label: 'один' }),
			edge('e2', ['a', 'c'], { label: 'два' }),
			edge('e3', ['b', 'd'], { label: 'три', sourcePort: 'x' }),
			edge('e4', ['c', 'd']),
			edge('e5', ['a', 'd']),
		],
		...extra,
	})
}
