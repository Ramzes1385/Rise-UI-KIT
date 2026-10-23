import type { FlowGraph } from '../../types/api/flowLayout.types'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode } from '../../types/data/flowData.types'

function indexById<T extends { id: string }>(items: readonly T[]): Map<string, T> {
	return new Map(items.map(item => [item.id, item]))
}

function bucket(edges: readonly FlowEdge[], key: 'source' | 'target'): Map<string, FlowEdge[]> {
	const result = new Map<string, FlowEdge[]>()
	for (const edge of edges) {
		const list = result.get(edge[key])
		if (list) list.push(edge)
		else result.set(edge[key], [edge])
	}
	return result
}

function ancestryOf(node: FlowNode | undefined, groups: ReadonlyMap<string, FlowGroup>): FlowGroup[] {
	const chain: FlowGroup[] = []
	const seen = new Set<string>()
	let current = node?.group === undefined ? undefined : groups.get(node.group)
	while (current && !seen.has(current.id)) {
		seen.add(current.id)
		chain.push(current)
		current = current.parent === undefined ? undefined : groups.get(current.parent)
	}
	return chain
}

function shortestPath(outgoing: (id: string) => readonly FlowEdge[], from: string, to: string): string[] {
	if (from === to) return []
	const via = new Map<string, FlowEdge>()
	const queue = [from]
	const seen = new Set([from])
	for (let head = 0; head < queue.length; head += 1) {
		for (const edge of outgoing(queue[head])) {
			if (seen.has(edge.target)) continue
			seen.add(edge.target)
			via.set(edge.target, edge)
			if (edge.target === to) return unwind(via, from, to)
			queue.push(edge.target)
		}
	}
	return []
}

function unwind(via: ReadonlyMap<string, FlowEdge>, from: string, to: string): string[] {
	const path: string[] = []
	let cursor = to
	while (cursor !== from) {
		const edge = via.get(cursor) as FlowEdge
		path.push(edge.id)
		cursor = edge.source
	}
	return path.reverse()
}

export function buildFlowGraph(data: FlowMapData): FlowGraph {
	const nodes = indexById(data.nodes)
	const groups = indexById(data.groups ?? [])
	const outgoingMap = bucket(data.edges, 'source')
	const incomingMap = bucket(data.edges, 'target')
	const none: readonly FlowEdge[] = []
	const outgoing = (id: string): readonly FlowEdge[] => outgoingMap.get(id) ?? none
	return {
		nodes,
		edges: indexById(data.edges),
		groups,
		outgoing,
		incoming: id => incomingMap.get(id) ?? none,
		ancestry: id => ancestryOf(nodes.get(id), groups),
		path: (from, to) => shortestPath(outgoing, from, to),
	}
}
