import { computed } from 'vue'
import { formatHours } from '@components/BaseRoadmap/model/view/format/roadmapText'
import type { Roadmap3DStageItem } from '../../types/internal/roadmap3dInternal.types'
import type { Roadmap3DPanelOptions } from '../../types/internal/roadmap3dCompose.types'
import type { RoadmapModel } from '@components/BaseRoadmap/types/internal/roadmapView.types'
import type { RoadmapProgressStatus } from '@components/BaseRoadmap/types/roadmapData.types'
import { flattenTopics, nextTopicId } from '@components/BaseRoadmap/model/view/format/roadmapOrder'
import type { RoadmapStageView } from '@components/BaseRoadmap/types/internal/roadmapInternal.types'
import { firstUnmetTitle, resolveRequirements } from '@components/BaseRoadmap/model/view/format/roadmapRequirements'

function stageInfo(view: RoadmapStageView, item: Roadmap3DStageItem, context: { total: number; views: RoadmapStageView[] }) {
	return {
		view,
		item,
		n: item.index + 1,
		total: context.total,
		hours: item.hours > 0 ? formatHours(item.hours) : '',
		hasPrev: item.index > 0,
		hasNext: item.index < context.total - 1,
		unlock: view.status === 'locked' ? (firstUnmetTitle(view.stage.requires, context.views) ?? '') : '',
	}
}

function topicInfo(entry: NonNullable<ReturnType<typeof flattenTopics>[number]>, model: RoadmapModel) {
	const id = entry.view.topic.id
	return {
		view: entry.view,
		stage: entry.stage,
		doneSubtopics: model.progress.value.topics[id]?.subtopics ?? [],
		requirements: resolveRequirements(entry.view.topic.requires, model.stageViews.value),
		hasNext: nextTopicId(model.stageViews.value, id) !== null,
		isBusy: entry.view.isBusy,
	}
}

export function useRoadmap3DPanel(options: Roadmap3DPanelOptions) {
	const { model, snapshot, focus } = options
	const view = computed(() => model.stageViews.value.find(item => item.stage.id === focus.focused.value) ?? null)
	const item = computed(() => snapshot.value.stages.find(stage => stage.id === focus.focused.value) ?? null)
	const selected = computed(() => {
		const id = model.selectedId.value
		return id === null ? undefined : flattenTopics(model.stageViews.value).find(entry => entry.view.topic.id === id)
	})
	const stage = computed(() => {
		if (!view.value || !item.value) return null
		return stageInfo(view.value, item.value, { total: snapshot.value.stages.length, views: model.stageViews.value })
	})
	const topic = computed(() => {
		const entry = selected.value
		if (!entry || entry.stage.stage.id !== focus.focused.value) return null
		return topicInfo(entry, model)
	})

	function selectTopic(id: string | null): void {
		if (id === null) return model.selectTopic(null)
		const entry = flattenTopics(model.stageViews.value).find(row => row.view.topic.id === id)
		if (entry && entry.stage.stage.id !== focus.focused.value) focus.focusStage(entry.stage.stage.id)
		model.selectTopic(id)
	}

	return {
		stage,
		topic,
		selectTopic,
		setStatus: (id: string, status: RoadmapProgressStatus | null) => void model.setTopicStatus(id, status, 'user'),
		toggleSubtopic: (topicId: string, subtopicId: string, isDone: boolean) => void model.toggleSubtopic(topicId, subtopicId, isDone),
		openNextTopic: () => {
			const id = model.selectedId.value
			const next = id === null ? null : nextTopicId(model.stageViews.value, id)
			if (next) selectTopic(next)
		},
		closePanel: () => (model.selectedId.value !== null ? model.selectTopic(null) : focus.overview()),
	}
}
