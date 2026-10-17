import type { FlowMapData } from '../../types/data/flowData.types'
import type { FlowChange, FlowEntity } from '../../types/data/flowReview.types'
import type { FlowCollection, FlowItem } from '../../types/internal/core/flowCore.types'

const COLLECTIONS: Record<FlowEntity, FlowCollection> = { node: 'nodes', edge: 'edges', group: 'groups', scenario: 'scenarios' }

function listOf(data: FlowMapData, entity: FlowEntity): readonly FlowItem[] {
	return (data[COLLECTIONS[entity]] ?? []) as readonly FlowItem[]
}

function withList(data: FlowMapData, entity: FlowEntity, list: FlowItem[]): FlowMapData {
	return { ...data, [COLLECTIONS[entity]]: list }
}

function mergeFields<T extends object>(target: T, patch: Record<string, unknown>): T {
	const result = { ...target } as Record<string, unknown>
	for (const [key, value] of Object.entries(patch)) {
		if (value === undefined) delete result[key]
		else result[key] = value
	}
	return result as T
}

function insertAt(list: readonly FlowItem[], value: FlowItem, index: number | undefined): FlowItem[] {
	const next = [...list]
	const at = index === undefined || index < 0 || index > next.length ? next.length : index
	next.splice(at, 0, value)
	return next
}

function applyOne(data: FlowMapData, change: FlowChange): FlowMapData {
	if (change.type === 'root') return mergeFields(data, change.patch)
	const list = listOf(data, change.entity)
	if (change.type === 'add') return withList(data, change.entity, insertAt(list, change.value, change.index))
	if (change.type === 'remove') {
		return withList(
			data,
			change.entity,
			list.filter(item => item.id !== change.id),
		)
	}
	const index = list.findIndex(item => item.id === change.id)
	if (index < 0) return data
	const next = [...list]
	next[index] = mergeFields(list[index], change.patch)
	return withList(data, change.entity, next)
}

export function applyFlowChanges(data: FlowMapData, changes: readonly FlowChange[]): FlowMapData {
	return changes.reduce(applyOne, data)
}

function invertOne(change: FlowChange): FlowChange {
	if (change.type === 'add') {
		return { type: 'remove', entity: change.entity, id: change.value.id, value: change.value, index: change.index ?? -1 }
	}
	if (change.type === 'remove') return { type: 'add', entity: change.entity, value: change.value, index: change.index }
	if (change.type === 'update') return { ...change, patch: change.previous, previous: change.patch }
	return { type: 'root', patch: change.previous, previous: change.patch }
}

export function invertFlowChanges(changes: readonly FlowChange[]): FlowChange[] {
	return [...changes].reverse().map(invertOne)
}
