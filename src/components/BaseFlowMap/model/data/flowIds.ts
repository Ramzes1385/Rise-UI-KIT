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
