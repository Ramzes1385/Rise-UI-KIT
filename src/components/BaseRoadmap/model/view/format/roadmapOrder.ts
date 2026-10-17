import type { RoadmapStageView, RoadmapTopicView } from '../../../types/internal/roadmapInternal.types'

const SKIPPED_ON_NEXT = ['done', 'locked', 'skipped']

export function flattenTopics(stages: RoadmapStageView[]): { view: RoadmapTopicView; stage: RoadmapStageView }[] {
	return stages.flatMap(stage => stage.topics.map(view => ({ view, stage })))
}

export function nextTopicId(stages: RoadmapStageView[], currentId: string): string | null {
	const flat = flattenTopics(stages)
	const start = flat.findIndex(item => item.view.topic.id === currentId)
	if (start === -1) return null
	for (let step = 1; step < flat.length; step += 1) {
		const { view } = flat[(start + step) % flat.length]
		if (!SKIPPED_ON_NEXT.includes(view.state.status)) return view.topic.id
	}
	return null
}
