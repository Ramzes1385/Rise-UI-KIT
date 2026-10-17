import type { FlowMapData } from '../../types/data/flowData.types'

export function collectFlowIds(data: FlowMapData): Set<string> {
	const ids = new Set<string>()
	for (const list of [data.nodes, data.edges, data.groups ?? [], data.scenarios ?? []]) {
		for (const item of list) ids.add(item.id)
	}
	return ids
}

export function createFlowId(prefix: string, taken: ReadonlySet<string>): string {
	let index = taken.size + 1
	while (taken.has(`${prefix}-${index}`)) index += 1
	return `${prefix}-${index}`
}

export function remapFlowIds(ids: readonly string[], taken: ReadonlySet<string>, prefix: string): Map<string, string> {
	const used = new Set(taken)
	const map = new Map<string, string>()
	for (const id of ids) {
		const next = used.has(id) ? createFlowId(prefix, used) : id
		used.add(next)
		map.set(id, next)
	}
	return map
}
