import type { RoadmapActionsContext } from '../../types/internal/roadmapView.types'
import type { RoadmapProgressStatus, RoadmapTopicStatus } from '../../types/roadmapData.types'

export function useRoadmapActions({ model, live, details }: RoadmapActionsContext) {
	function announce(id: string, kind: RoadmapTopicStatus | 'reset'): void {
		const title = model.index.value.topics.get(id)?.topic.title
		if (title !== undefined) live.announce(kind, title, model.summary.value)
	}

	async function setStatus(id: string, status: RoadmapProgressStatus | null): Promise<boolean> {
		const isChanged = await model.setTopicStatus(id, status, 'user')
		if (isChanged) announce(id, status === null ? 'reset' : (model.getTopicState(id)?.status ?? 'reset'))
		return isChanged
	}

	async function toggleSubtopic(topicId: string, subtopicId: string, isDone: boolean): Promise<boolean> {
		const isChanged = await model.toggleSubtopic(topicId, subtopicId, isDone)
		if (isChanged) announce(topicId, model.getTopicState(topicId)?.status ?? 'reset')
		return isChanged
	}

	async function toggleTopic(id: string): Promise<void> {
		const status = model.getTopicState(id)?.status
		if (status === 'locked' || status === undefined) {
			details.open(id)
			return
		}
		await setStatus(id, status === 'done' ? null : 'done')
	}

	return { setStatus, toggleSubtopic, toggleTopic }
}
