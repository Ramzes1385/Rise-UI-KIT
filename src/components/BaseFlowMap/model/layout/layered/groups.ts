import type { GroupIndex } from '../../../types/internal/core/flowLayoutInternal.types'
import type { FlowLayoutGroup, FlowLayoutNode } from '../../../types/api/flowLayout.types'

function sortGroups(groups: readonly FlowLayoutGroup[]): FlowLayoutGroup[] {
	return groups
		.map((group, index) => ({ group, index }))
		.sort((left, right) => left.group.order - right.group.order || left.index - right.index)
		.map(({ group }) => group)
}

function childrenOf(groups: readonly FlowLayoutGroup[], parent: string | undefined): FlowLayoutGroup[] {
	return sortGroups(groups.filter(group => group.parent === parent))
}

export function indexGroups(groups: readonly FlowLayoutGroup[]): Map<string, FlowLayoutGroup> {
	return new Map(groups.map(group => [group.id, group]))
}

export function ancestorsOf(id: string | undefined, byId: ReadonlyMap<string, FlowLayoutGroup>): FlowLayoutGroup[] {
	const chain: FlowLayoutGroup[] = []
	const seen = new Set<string>()
	let current = id === undefined ? undefined : byId.get(id)
	while (current && !seen.has(current.id)) {
		seen.add(current.id)
		chain.push(current)
		current = current.parent === undefined ? undefined : byId.get(current.parent)
	}
	return chain
}

function leavesOf(groups: readonly FlowLayoutGroup[], root: FlowLayoutGroup): FlowLayoutGroup[] {
	const children = childrenOf(groups, root.id).filter(group => group.layout === 'band')
	return children.length === 0 ? [root] : children.flatMap(child => leavesOf(groups, child))
}

function bandLeaves(groups: readonly FlowLayoutGroup[]): FlowLayoutGroup[] {
	const roots = childrenOf(groups, undefined).filter(group => group.layout === 'band')
	const byId = indexGroups(groups)
	const orphans = groups.filter(group => group.layout === 'band' && group.parent !== undefined && !byId.has(group.parent))
	return [...roots, ...sortGroups(orphans)].flatMap(root => leavesOf(groups, root))
}

function tierGroups(groups: readonly FlowLayoutGroup[]): FlowLayoutGroup[] {
	return sortGroups(groups.filter(group => group.layout === 'tier'))
}

export function createGroupIndex(groups: readonly FlowLayoutGroup[]): GroupIndex {
	return { groups, byId: indexGroups(groups), leaves: bandLeaves(groups), tiers: tierGroups(groups) }
}

export function nodeBand(node: FlowLayoutNode, index: GroupIndex): number {
	const owner = ancestorsOf(node.group, index.byId).find(group => group.layout === 'band')
	if (!owner) return 0
	const direct = index.leaves.findIndex(item => item.id === owner.id)
	if (direct >= 0) return direct
	const first = leavesOf(index.groups, owner)[0]
	return Math.max(
		0,
		index.leaves.findIndex(item => item.id === first.id),
	)
}

export function nodeTier(node: FlowLayoutNode, index: GroupIndex): number | undefined {
	const owner = ancestorsOf(node.group, index.byId).find(group => group.layout === 'tier')
	const tier = owner ? index.tiers.findIndex(item => item.id === owner.id) : -1
	return tier >= 0 ? tier : undefined
}
