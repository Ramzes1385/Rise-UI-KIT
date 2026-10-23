import type { FlowMapData } from '../../types/data/flowData.types'
import type { FlowChange, FlowEntity } from '../../types/data/flowReview.types'
import type { FlowKeyed as Keyed } from '../../types/internal/core/flowCore.types'

const LISTS = [
	['node', 'nodes'],
	['edge', 'edges'],
	['group', 'groups'],
	['scenario', 'scenarios'],
] as const

const LIST_KEYS = new Set<string>(LISTS.map(([, key]) => key))

function isFlowEqual(left: unknown, right: unknown): boolean {
	if (left === right) return true
	if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) return false
	if (Array.isArray(left) !== Array.isArray(right)) return false
	const keys = new Set([...Object.keys(left), ...Object.keys(right)])
	const first = left as Record<string, unknown>
	const second = right as Record<string, unknown>
	for (const key of keys) {
		if (!isFlowEqual(first[key], second[key])) return false
	}
	return true
}

function changedFields(base: Keyed, target: Keyed): { patch: Record<string, unknown>; previous: Record<string, unknown> } {
	const patch: Record<string, unknown> = {}
	const previous: Record<string, unknown> = {}
	for (const key of new Set([...Object.keys(base), ...Object.keys(target)])) {
		if (key === 'id' || isFlowEqual(base[key], target[key])) continue
		patch[key] = target[key]
		previous[key] = base[key]
	}
	return { patch, previous }
}

function diffList(entity: FlowEntity, base: readonly Keyed[], target: readonly Keyed[]): FlowChange[] {
	const baseIds = new Map(base.map((item, index) => [item.id, index]))
	const targetIds = new Map(target.map((item, index) => [item.id, index]))
	const updates: FlowChange[] = []
	for (const item of target) {
		const index = baseIds.get(item.id)
		if (index === undefined) continue
		const { patch, previous } = changedFields(base[index], item)
		if (Object.keys(patch).length > 0) updates.push({ type: 'update', entity, id: item.id, patch, previous })
	}
	const removes = base
		.map((item, index) => ({ item, index }))
		.filter(({ item }) => !targetIds.has(item.id))
		.reverse()
		.map(({ item, index }): FlowChange => ({ type: 'remove', entity, id: item.id, value: item as never, index }))
	const adds = target
		.map((item, index) => ({ item, index }))
		.filter(({ item }) => !baseIds.has(item.id))
		.map(({ item, index }): FlowChange => ({ type: 'add', entity, value: item as never, index }))
	return [...updates, ...removes, ...adds]
}

function diffRoot(base: FlowMapData, target: FlowMapData): FlowChange[] {
	const patch: Record<string, unknown> = {}
	const previous: Record<string, unknown> = {}
	const first = base as unknown as Record<string, unknown>
	const second = target as unknown as Record<string, unknown>
	for (const key of new Set([...Object.keys(first), ...Object.keys(second)])) {
		if (LIST_KEYS.has(key) || isFlowEqual(first[key], second[key])) continue
		patch[key] = second[key]
		previous[key] = first[key]
	}
	return Object.keys(patch).length > 0 ? [{ type: 'root', patch, previous }] : []
}

export function diffFlowData(base: FlowMapData, target: FlowMapData): FlowChange[] {
	const lists = LISTS.flatMap(([entity, key]) =>
		diffList(entity, (base[key] ?? []) as unknown as Keyed[], (target[key] ?? []) as unknown as Keyed[]),
	)
	return [...diffRoot(base, target), ...lists]
}
