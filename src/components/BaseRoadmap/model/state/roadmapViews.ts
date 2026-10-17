import type { RoadmapStage, RoadmapTopic } from '../../types/roadmapData.types'
import type { RoadmapFilter, RoadmapTopicState } from '../../types/BaseRoadmap.types'
import type { RoadmapStageView, RoadmapTopicView, RoadmapViewInput } from '../../types/internal/roadmapInternal.types'

const FALLBACK_STATE: RoadmapTopicState = { status: 'available', done: 0, total: 0, fraction: 0, missing: [] }

function isHidden(topic: RoadmapTopic, filter: RoadmapFilter): boolean {
	if (filter === 'required') return topic.kind === 'optional'
	return filter === 'optional' && topic.kind !== 'optional'
}

function buildTopicViews(stage: RoadmapStage, input: RoadmapViewInput): RoadmapTopicView[] {
	const seen = new Set<string>()
	return stage.topics.map(topic => {
		const isAlternative = topic.choice !== undefined && seen.has(topic.choice)
		if (topic.choice !== undefined) seen.add(topic.choice)
		return {
			topic,
			state: input.statuses.topics.get(topic.id) ?? FALLBACK_STATE,
			isSelected: topic.id === input.selectedId,
			isFiltered: isHidden(topic, input.filter),
			isAlternative,
		}
	})
}

export function buildStageViews(input: RoadmapViewInput): RoadmapStageView[] {
	return input.data.stages.map((stage, index) => {
		const topics = buildTopicViews(stage, input)
		return {
			stage,
			index,
			status: input.statuses.stages.get(stage.id) ?? 'available',
			done: topics.filter(view => view.state.status === 'done').length,
			total: topics.length,
			hours: topics.reduce((sum, view) => sum + (view.topic.hours ?? 0), 0),
			isExpanded: input.expanded.includes(stage.id),
			topics,
			headingId: `${input.idPrefix}-stage-${index}-heading`,
			panelId: `${input.idPrefix}-stage-${index}-panel`,
		}
	})
}
