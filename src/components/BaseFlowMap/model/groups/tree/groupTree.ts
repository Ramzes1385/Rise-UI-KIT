import type { FlowGroup } from '../../../types/data/flowData.types'

const MAX_DEPTH = 32

export function indexGroups(groups: readonly FlowGroup[] | undefined): Map<string, FlowGroup> {
	return new Map((groups ?? []).map(group => [group.id, group]))
}

export function chainOf(id: string | undefined, byId: ReadonlyMap<string, FlowGroup>): FlowGroup[] {
	const chain: FlowGroup[] = []
	let current = id === undefined ? undefined : byId.get(id)
	while (current && chain.length < MAX_DEPTH && !chain.includes(current)) {
		chain.unshift(current)
		current = current.parent === undefined ? undefined : byId.get(current.parent)
	}
	return chain
}

export function depthOf(id: string, byId: ReadonlyMap<string, FlowGroup>): number {
	return Math.max(chainOf(id, byId).length - 1, 0)
}

export function blockGroup(
	groupId: string | undefined,
	byId: ReadonlyMap<string, FlowGroup>,
	collapsed: ReadonlySet<string>,
): FlowGroup | undefined {
	return chainOf(groupId, byId).find(group => collapsed.has(group.id))
}
