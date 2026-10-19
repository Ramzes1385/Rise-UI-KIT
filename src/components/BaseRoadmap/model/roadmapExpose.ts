import type { BaseRoadmapExpose } from '../types/BaseRoadmap.types'
import type { RoadmapModel } from '../types/internal/roadmapView.types'

export function buildRoadmapExpose(model: RoadmapModel): BaseRoadmapExpose {
	return {
		setTopicStatus: model.setTopicStatus,
		toggleSubtopic: model.toggleSubtopic,
		expandStage: model.expandStage,
		expandAll: model.expandAll,
		collapseAll: model.collapseAll,
		selectTopic: model.selectTopic,
		continueLearning: model.continueLearning,
		getTopicState: model.getTopicState,
		resetProgress: model.resetProgress,
		on: model.hooks.on,
		...model.editor.methods,
		propose: model.reviewer.propose,
	}
}
