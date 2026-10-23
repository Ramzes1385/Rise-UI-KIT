import type { RoadmapStageView } from '../../../types/internal/roadmapInternal.types'
import type { RoadmapRequirementView } from '../../../types/internal/roadmapView.types'
import type { RoadmapStageStatus, RoadmapTopicStatus } from '../../../types/roadmapData.types'

const STAGE_TO_TOPIC_STATUS: Record<RoadmapStageStatus, RoadmapTopicStatus> = {
	done: 'done',
	current: 'in-progress',
	available: 'available',
	locked: 'locked',
}

const PASSED: RoadmapTopicStatus[] = ['done', 'skipped']

function findRequirement(id: string, stages: RoadmapStageView[]): RoadmapRequirementView | null {
	for (const view of stages) {
		if (view.stage.id === id) return { id, title: view.stage.title, status: STAGE_TO_TOPIC_STATUS[view.status], isStage: true }
		const topic = view.topics.find(item => item.topic.id === id)
		if (topic) return { id, title: topic.topic.title, status: topic.state.status, isStage: false }
	}
	return null
}

export function resolveRequirements(ids: string[] | undefined, stages: RoadmapStageView[]): RoadmapRequirementView[] {
	return (ids ?? []).map(id => findRequirement(id, stages)).filter((item): item is RoadmapRequirementView => item !== null)
}

export function titlesOf(ids: string[], stages: RoadmapStageView[]): string[] {
	return resolveRequirements(ids, stages).map(item => item.title)
}

export function firstUnmetTitle(ids: string[] | undefined, stages: RoadmapStageView[]): string | undefined {
	return resolveRequirements(ids, stages).find(item => !PASSED.includes(item.status))?.title
}
