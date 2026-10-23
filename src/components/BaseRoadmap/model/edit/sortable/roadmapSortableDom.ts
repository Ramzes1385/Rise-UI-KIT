import { findRoadmapEntity } from '../changes/roadmapFind'
import { stagePlace, topicPlace } from '../data/roadmapPlaces'
import type { RoadmapData } from '../../../types/roadmapData.types'
import type { SortablePoint } from '@composables/interaction/useSortable'
import type { RoadmapTopicPlace } from '../../../types/internal/roadmapEdit.internal.types'

function elementAt(point: SortablePoint, selector: string): HTMLElement | null {
	for (const element of document.elementsFromPoint(point.x, point.y)) {
		const hit = element.closest<HTMLElement>(selector)
		if (hit) return hit
	}
	return null
}

export function stageUnder(data: RoadmapData, point: SortablePoint): number | null {
	const hit = elementAt(point, '[data-roadmap-stage]')
	return hit ? stagePlace(data, hit.dataset.roadmapStage as string) : null
}

export function topicUnder(data: RoadmapData, point: SortablePoint, id: string): RoadmapTopicPlace | null {
	const targetId = elementAt(point, '[data-roadmap-topic]')?.dataset.roadmapTopic
	if (targetId !== undefined) return targetId === id ? null : topicPlace(data, targetId)
	const stage = elementAt(point, '[data-roadmap-stage]')?.dataset.roadmapStage
	const found = stage === undefined ? null : findRoadmapEntity(data, stage)
	if (!found) return null
	const isOwn = topicPlace(data, id)?.stage === found.stage.id
	return { stage: found.stage.id, index: found.stage.topics.length - (isOwn ? 1 : 0) }
}
