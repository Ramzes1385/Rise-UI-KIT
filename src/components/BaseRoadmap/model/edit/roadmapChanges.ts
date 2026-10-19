import type { RoadmapChange } from '../../types/roadmapEdit.types'
import type { RoadmapData, RoadmapStage, RoadmapTopic } from '../../types/roadmapData.types'

export function invertRoadmapChange(change: RoadmapChange): RoadmapChange {
	switch (change.type) {
		case 'add':
			return change.entity === 'stage'
				? { type: 'remove', entity: 'stage', id: change.value.id, value: change.value, index: change.index }
				: { type: 'remove', entity: 'topic', id: change.value.id, stage: change.stage, value: change.value, index: change.index }
		case 'remove':
			return change.entity === 'stage'
				? { type: 'add', entity: 'stage', value: change.value, index: change.index }
				: { type: 'add', entity: 'topic', stage: change.stage, value: change.value, index: change.index }
		case 'move':
			return { ...change, from: change.to, to: change.from } as RoadmapChange
		case 'update':
			return { ...change, patch: change.previous, previous: change.patch }
		default:
			return { ...change, patch: change.previous, previous: change.patch }
	}
}

export function invertRoadmapChanges(changes: readonly RoadmapChange[]): RoadmapChange[] {
	return changes.map(invertRoadmapChange).reverse()
}

function insertAt<T>(list: readonly T[], index: number, item: T): T[] {
	const at = Math.max(0, Math.min(index, list.length))
	return [...list.slice(0, at), item, ...list.slice(at)]
}

function removeAt<T>(list: readonly T[], index: number): T[] {
	return list.filter((_, position) => position !== index)
}

function patched<T extends object>(target: T, patch: Record<string, unknown>): T {
	const next: Record<string, unknown> = { ...target }
	for (const [key, value] of Object.entries(patch)) {
		if (value === undefined) delete next[key]
		else next[key] = value
	}
	return next as T
}

function mapStage(data: RoadmapData, id: string, update: (stage: RoadmapStage) => RoadmapStage): RoadmapData {
	return { ...data, stages: data.stages.map(stage => (stage.id === id ? update(stage) : stage)) }
}

function mapTopic(data: RoadmapData, id: string, update: (topic: RoadmapTopic) => RoadmapTopic): RoadmapData {
	return {
		...data,
		stages: data.stages.map(stage => ({ ...stage, topics: stage.topics.map(topic => (topic.id === id ? update(topic) : topic)) })),
	}
}

function moveTopic(data: RoadmapData, change: Extract<RoadmapChange, { type: 'move'; entity: 'topic' }>): RoadmapData {
	const entry = data.stages.find(stage => stage.id === change.from.stage)?.topics[change.from.index]
	if (!entry || entry.id !== change.id) return data
	const without = mapStage(data, change.from.stage, stage => ({ ...stage, topics: removeAt(stage.topics, change.from.index) }))
	return mapStage(without, change.to.stage, stage => ({ ...stage, topics: insertAt(stage.topics, change.to.index, entry) }))
}

type Of<T extends RoadmapChange['type']> = Extract<RoadmapChange, { type: T }>

function applyAdd(data: RoadmapData, change: Of<'add'>): RoadmapData {
	return change.entity === 'stage'
		? { ...data, stages: insertAt(data.stages, change.index, change.value) }
		: mapStage(data, change.stage, stage => ({ ...stage, topics: insertAt(stage.topics, change.index, change.value) }))
}

function applyRemove(data: RoadmapData, change: Of<'remove'>): RoadmapData {
	return change.entity === 'stage'
		? { ...data, stages: data.stages.filter(stage => stage.id !== change.id) }
		: mapStage(data, change.stage, stage => ({ ...stage, topics: stage.topics.filter(topic => topic.id !== change.id) }))
}

function applyMove(data: RoadmapData, change: Of<'move'>): RoadmapData {
	if (change.entity === 'topic') return moveTopic(data, change)
	return data.stages[change.from]?.id === change.id
		? { ...data, stages: insertAt(removeAt(data.stages, change.from), change.to, data.stages[change.from]) }
		: data
}

function applyUpdate(data: RoadmapData, change: Of<'update'>): RoadmapData {
	return change.entity === 'stage'
		? mapStage(data, change.id, stage => patched(stage, change.patch))
		: mapTopic(data, change.id, topic => patched(topic, change.patch))
}

function applyOne(data: RoadmapData, change: RoadmapChange): RoadmapData {
	if (change.type === 'add') return applyAdd(data, change)
	if (change.type === 'remove') return applyRemove(data, change)
	if (change.type === 'move') return applyMove(data, change)
	return change.type === 'update' ? applyUpdate(data, change) : patched(data, change.patch)
}

export function applyRoadmapChanges(data: RoadmapData, changes: readonly RoadmapChange[]): RoadmapData {
	return changes.reduce(applyOne, data)
}
