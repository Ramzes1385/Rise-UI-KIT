import { validateRoadmap } from '../../../model/progress/roadmapValidate'
import { buildRoadmapIndex, computeRoadmapStatuses } from '../../../model/progress/roadmapStatus'
import type { RoadmapData, RoadmapProgress, RoadmapStage, RoadmapTopic } from '../../../types/roadmapData.types'

export function topic(id: string, extra: Partial<RoadmapTopic> = {}): RoadmapTopic {
	return { id, title: `Тема ${id}`, ...extra }
}

export function stage(id: string, topics: RoadmapTopic[], extra: Partial<RoadmapStage> = {}): RoadmapStage {
	return { id, title: `Этап ${id}`, topics, ...extra }
}

export function roadmap(stages: RoadmapStage[], extra: Partial<RoadmapData> = {}): RoadmapData {
	return { version: 1, title: 'Путь', stages, ...extra }
}

export function progressOf(topics: RoadmapProgress['topics'] = {}): RoadmapProgress {
	return { version: 1, topics }
}

export function statusesOf(data: RoadmapData, progress: RoadmapProgress = progressOf()) {
	const index = buildRoadmapIndex(data)
	const { requires } = validateRoadmap(data, index)
	return computeRoadmapStatuses({ data, progress, requires, index })
}
