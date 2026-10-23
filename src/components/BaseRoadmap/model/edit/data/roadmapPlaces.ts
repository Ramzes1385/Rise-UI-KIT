import { findRoadmapEntity } from '../changes/roadmapFind'
import type { RoadmapData } from '../../../types/roadmapData.types'
import type { RoadmapChange } from '../../../types/roadmapEdit.types'
import type { RoadmapTopicPlace } from '../../../types/internal/roadmapEdit.internal.types'

const BACKWARD = new Set(['ArrowUp', 'ArrowLeft'])
const FORWARD = new Set(['ArrowDown', 'ArrowRight'])

export function stagePlace(data: RoadmapData, id: string): number | null {
	const index = data.stages.findIndex(stage => stage.id === id)
	return index < 0 ? null : index
}

export function topicPlace(data: RoadmapData, id: string): RoadmapTopicPlace | null {
	const found = findRoadmapEntity(data, id)
	return found?.topic ? { stage: found.stage.id, index: found.topicIndex } : null
}

export function stepStage(data: RoadmapData, id: string, key: string): number | null {
	const current = stagePlace(data, id)
	if (current === null) return null
	const last = data.stages.length - 1
	let next = current
	if (BACKWARD.has(key)) next = current - 1
	else if (FORWARD.has(key)) next = current + 1
	else if (key === 'Home') next = 0
	else if (key === 'End') next = last
	return next < 0 || next > last || next === current ? null : next
}

function crossing(data: RoadmapData, current: RoadmapTopicPlace, delta: -1 | 1): RoadmapTopicPlace | null {
	const stageIndex = data.stages.findIndex(stage => stage.id === current.stage)
	const neighbour = data.stages[stageIndex + delta]
	if (!neighbour) return null
	return { stage: neighbour.id, index: delta < 0 ? neighbour.topics.length : 0 }
}

function stepDelta(key: string): -1 | 0 | 1 {
	if (BACKWARD.has(key)) return -1
	return FORWARD.has(key) ? 1 : 0
}

function edgeTopic(current: RoadmapTopicPlace, count: number, key: string): RoadmapTopicPlace | null {
	const index = key === 'Home' ? 0 : count - 1
	return current.index === index ? null : { stage: current.stage, index }
}

export function stepTopic(data: RoadmapData, id: string, key: string): RoadmapTopicPlace | null {
	const current = topicPlace(data, id)
	if (current === null) return null
	const count = data.stages.find(stage => stage.id === current.stage)!.topics.length
	if (key === 'Home' || key === 'End') return edgeTopic(current, count, key)
	const delta = stepDelta(key)
	if (delta === 0) return null
	const next = current.index + delta
	return next >= 0 && next < count ? { stage: current.stage, index: next } : crossing(data, current, delta)
}

export function previewMove(data: RoadmapData, id: string, place: number | RoadmapTopicPlace): RoadmapChange | null {
	if (typeof place === 'number') {
		const from = stagePlace(data, id)
		return from === null || from === place ? null : { type: 'move', entity: 'stage', id, from, to: place }
	}
	const from = topicPlace(data, id)
	if (from === null || (from.stage === place.stage && from.index === place.index)) return null
	return { type: 'move', entity: 'topic', id, from, to: place }
}
