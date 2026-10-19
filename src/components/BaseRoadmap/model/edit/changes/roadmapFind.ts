import type { RoadmapData } from '../../../types/roadmapData.types'
import type { RoadmapFound } from '../../../types/internal/roadmapEdit.internal.types'

export function findRoadmapEntity(data: RoadmapData, id: string): RoadmapFound | null {
	for (const [stageIndex, stage] of data.stages.entries()) {
		if (stage.id === id) return { stage, stageIndex, topicIndex: -1 }
		const topicIndex = stage.topics.findIndex(topic => topic.id === id)
		if (topicIndex >= 0) return { stage, stageIndex, topic: stage.topics[topicIndex], topicIndex }
	}
	return null
}

export function roadmapTitle(data: RoadmapData, id: string): string {
	const found = findRoadmapEntity(data, id)
	return found?.topic?.title ?? found?.stage.title ?? id
}
