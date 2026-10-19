import { findRoadmapEntity } from './roadmapFind'
import { findRoadmapCycle } from './roadmapCycles'
import { collectRoadmapIds } from '../data/roadmapTemplates'
import type { RoadmapChange } from '../../../types/roadmapEdit.types'
import type { RoadmapData, RoadmapStage } from '../../../types/roadmapData.types'
import { isRejection, rejectCycle, rejectDuplicate, rejectInvalid, rejectUnknown } from './roadmapReject'
import type { RoadmapBuilt, RoadmapInsertTarget, RoadmapTopicInsert } from '../../../types/internal/roadmapEdit.internal.types'

function clamp(index: number | undefined, length: number): number {
	return Math.max(0, Math.min(index ?? length, length))
}

function same(left: unknown, right: unknown): boolean {
	return JSON.stringify(left) === JSON.stringify(right)
}

export function buildAddStage(data: RoadmapData, stage: RoadmapStage, index?: number): RoadmapBuilt {
	if (collectRoadmapIds(data).has(stage.id)) return rejectDuplicate(stage.id)
	return [{ type: 'add', entity: 'stage', value: stage, index: clamp(index, data.stages.length) }]
}

export function buildAddTopic(data: RoadmapData, insert: RoadmapTopicInsert): RoadmapBuilt {
	const { stage: stageId, topic, index } = insert
	const stage = data.stages.find(item => item.id === stageId)
	if (!stage) return rejectUnknown(stageId)
	if (collectRoadmapIds(data).has(topic.id)) return rejectDuplicate(topic.id)
	return [{ type: 'add', entity: 'topic', stage: stageId, value: topic, index: clamp(index, stage.topics.length) }]
}

export function buildMove(data: RoadmapData, id: string, to: { stage?: string; index: number }): RoadmapBuilt {
	const found = findRoadmapEntity(data, id)
	if (!found) return rejectUnknown(id)
	if (!found.topic) {
		const target = clamp(to.index, data.stages.length - 1)
		return target === found.stageIndex ? [] : [{ type: 'move', entity: 'stage', id, from: found.stageIndex, to: target }]
	}
	const targetStage = data.stages.find(stage => stage.id === (to.stage ?? found.stage.id))
	if (!targetStage) return rejectUnknown(to.stage ?? '')
	const limit = targetStage === found.stage ? targetStage.topics.length - 1 : targetStage.topics.length
	const index = clamp(to.index, limit)
	if (targetStage === found.stage && index === found.topicIndex) return []
	return [
		{
			type: 'move',
			entity: 'topic',
			id,
			from: { stage: found.stage.id, index: found.topicIndex },
			to: { stage: targetStage.id, index },
		},
	]
}

function requireTargets(patch: Record<string, unknown>, current: readonly string[]): string[] {
	const next = Array.isArray(patch.requires) ? (patch.requires as string[]) : []
	return next.filter(target => !current.includes(target))
}

function cycleOf(data: RoadmapData, change: { id: string; patch: Record<string, unknown>; current: readonly string[] }) {
	const { id, patch, current } = change
	for (const target of requireTargets(patch, current)) {
		const cycle = findRoadmapCycle(data, id, target)
		if (cycle) return cycle
	}
	return null
}

export function buildUpdate(data: RoadmapData, id: string, input: Record<string, unknown>): RoadmapBuilt {
	const found = findRoadmapEntity(data, id)
	if (!found) return rejectUnknown(id)
	const entity = (found.topic ?? found.stage) as unknown as Record<string, unknown>
	const patch = Object.fromEntries(Object.entries(input).filter(([key, value]) => key !== 'id' && !same(value, entity[key])))
	if (Object.keys(patch).length === 0) return []
	const cycle = cycleOf(data, { id, patch, current: (entity.requires as string[] | undefined) ?? [] })
	if (cycle) return rejectCycle(data, cycle)
	const previous = Object.fromEntries(Object.keys(patch).map(key => [key, entity[key]]))
	return [{ type: 'update', entity: found.topic ? 'topic' : 'stage', id, patch, previous }]
}

function removedIds(data: RoadmapData, ids: readonly string[]): Set<string> {
	const removed = new Set<string>()
	for (const id of ids) {
		const found = findRoadmapEntity(data, id)
		if (!found) continue
		removed.add(id)
		if (!found.topic) found.stage.topics.forEach(topic => removed.add(topic.id))
	}
	return removed
}

function cleanups(data: RoadmapData, removed: Set<string>): RoadmapChange[] {
	const changes: RoadmapChange[] = []
	const clean = (entity: 'stage' | 'topic', id: string, requires: string[] | undefined): void => {
		if (removed.has(id) || !requires?.some(target => removed.has(target))) return
		const left = requires.filter(target => !removed.has(target))
		changes.push({ type: 'update', entity, id, patch: { requires: left.length ? left : undefined }, previous: { requires } })
	}
	for (const stage of data.stages) {
		clean('stage', stage.id, stage.requires)
		stage.topics.forEach(topic => clean('topic', topic.id, topic.requires))
	}
	return changes
}

function removals(data: RoadmapData, ids: readonly string[]): RoadmapChange[] {
	const removed = removedIds(data, ids)
	const topics: RoadmapChange[] = []
	const stages: RoadmapChange[] = []
	data.stages.forEach((stage, index) => {
		if (!removed.has(stage.id)) {
			stage.topics.forEach((topic, position) => {
				if (removed.has(topic.id))
					topics.unshift({ type: 'remove', entity: 'topic', id: topic.id, stage: stage.id, value: topic, index: position })
			})
		} else if (ids.includes(stage.id)) stages.unshift({ type: 'remove', entity: 'stage', id: stage.id, value: stage, index })
	})
	return [...topics, ...stages]
}

export function buildRemove(data: RoadmapData, ids: readonly string[]): RoadmapBuilt {
	const unknown = ids.find(id => !findRoadmapEntity(data, id))
	if (unknown !== undefined) return rejectUnknown(unknown)
	const removed = removedIds(data, ids)
	return [...removals(data, ids), ...cleanups(data, removed)]
}

export function buildRequirement(data: RoadmapData, input: { id: string; target: string; isAdd: boolean }): RoadmapBuilt {
	const { id, target, isAdd } = input
	const found = findRoadmapEntity(data, id)
	if (!found) return rejectUnknown(id)
	if (!findRoadmapEntity(data, target)) return rejectUnknown(target)
	const current = (found.topic ?? found.stage).requires ?? []
	if (isAdd === current.includes(target)) return []
	const next = isAdd ? [...current, target] : current.filter(item => item !== target)
	return buildUpdate(data, id, { requires: next.length ? next : undefined })
}

export function buildReplace(data: RoadmapData, next: RoadmapData): RoadmapBuilt {
	if (!Array.isArray(next.stages) || typeof next.title !== 'string') return rejectInvalid()
	const keys = new Set([...Object.keys(data), ...Object.keys(next)])
	keys.delete('stages')
	const patch: Record<string, unknown> = {}
	const previous: Record<string, unknown> = {}
	for (const key of keys) {
		patch[key] = next[key as keyof RoadmapData]
		previous[key] = data[key as keyof RoadmapData]
	}
	const removing = data.stages
		.map((stage, index): RoadmapChange => ({ type: 'remove', entity: 'stage', id: stage.id, value: stage, index }))
		.reverse()
	const adding = next.stages.map((stage, index): RoadmapChange => ({ type: 'add', entity: 'stage', value: stage, index }))
	return [...removing, { type: 'root', patch, previous } as RoadmapChange, ...adding]
}

export function pickTarget(data: RoadmapData, to: RoadmapInsertTarget | undefined): string | null {
	return to?.stage ?? data.stages[data.stages.length - 1]?.id ?? null
}

export { isRejection }
