import { ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { useRoadmapModel } from './useRoadmapModel'
import { buildRoadmapExpose } from './roadmapExpose'
import { useRoadmapView } from './view/useRoadmapView'
import { useRoadmapModes } from './edit/run/useRoadmapModes'
import { useRoadmapReviewView } from './review/useRoadmapReviewView'
import type { RoadmapProps } from '../types/internal/roadmapView.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseRoadmapEmits, BaseRoadmapPart } from '../types/BaseRoadmap.types'

export function useBaseRoadmap(props: RoadmapProps, emit: BaseRoadmapEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const model = useRoadmapModel(props, emit)
	const { selectTopic, continueLearning, expandStage } = model
	const view = useRoadmapView(props, model, rootRef)

	return {
		...useStandardBaseComponent('base-roadmap', props, ['root']),
		ui: useUi<BaseRoadmapPart>(props, 'base-roadmap'),
		rootRef,
		...view,
		...useRoadmapReviewView(model, view.selected, selectTopic),
		data: model.data,
		currentMode: model.currentMode,
		isEditing: model.isEditing,
		setMode: model.setMode,
		edit: model.editor.controller,
		...useRoadmapModes(props, emit, model),
		busyTopics: model.busyTopics,
		stageViews: model.stageViews,
		pathProgress: model.pathProgress,
		filter: model.filter,
		toggleStage: expandStage,
		continueLearning,
		expose: buildRoadmapExpose(model),
	}
}
