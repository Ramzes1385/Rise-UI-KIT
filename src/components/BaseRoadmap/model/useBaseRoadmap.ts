import { ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { useRoadmapModel } from './useRoadmapModel'
import { useRoadmapView } from './view/useRoadmapView'
import type { RoadmapProps } from '../types/internal/roadmapView.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseRoadmapEmits, BaseRoadmapPart } from '../types/BaseRoadmap.types'

export function useBaseRoadmap(props: RoadmapProps, emit: BaseRoadmapEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const model = useRoadmapModel(props, emit)
	const {
		setTopicStatus,
		toggleSubtopic,
		expandStage,
		expandAll,
		collapseAll,
		selectTopic,
		continueLearning,
		getTopicState,
		resetProgress,
	} = model

	return {
		...useStandardBaseComponent('base-roadmap', props, ['root']),
		ui: useUi<BaseRoadmapPart>(props, 'base-roadmap'),
		rootRef,
		...useRoadmapView(props, model, rootRef),
		data: model.data,
		busyTopics: model.busyTopics,
		stageViews: model.stageViews,
		pathProgress: model.pathProgress,
		filter: model.filter,
		toggleStage: expandStage,
		continueLearning,
		expose: {
			setTopicStatus,
			toggleSubtopic,
			expandStage,
			expandAll,
			collapseAll,
			selectTopic,
			continueLearning,
			getTopicState,
			resetProgress,
		},
	}
}
