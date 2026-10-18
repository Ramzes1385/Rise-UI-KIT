import type { FlowEdge, FlowMapData, FlowNode } from '@components/BaseFlowMap'

const KINDS = ['service', 'service', 'database', 'queue', 'cache'] as const

export function buildGeneratedMap(count: number, columns = 12): FlowMapData {
	const nodes: FlowNode[] = Array.from({ length: count }, (_, index) => ({
		id: `n${index}`,
		kind: KINDS[index % KINDS.length],
		label: `Сервис ${index + 1}`,
		subtitle: `узел ${index + 1}`,
		status: index % 17 === 0 ? 'warning' : 'ok',
	}))
	const edges: FlowEdge[] = nodes.flatMap((node, index) => {
		const targets = [index + columns, index % columns < columns - 1 ? index + columns + 1 : -1]
		return targets
			.filter(target => target > 0 && target < count)
			.map(target => ({ id: `e${index}-${target}`, source: node.id, target: `n${target}` }))
	})
	return {
		version: 1,
		notation: 'services',
		title: `Большая карта: ${count} узлов`,
		nodes,
		edges,
		layout: { algorithm: 'layered', direction: 'TB', routing: 'straight' },
	}
}
