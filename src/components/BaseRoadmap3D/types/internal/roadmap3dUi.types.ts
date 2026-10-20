import type { UiClassFn } from '@composables/base/useUi'
import type { Roadmap3DStageItem } from './roadmap3dInternal.types'
import type { BaseRoadmapPart } from '@components/BaseRoadmap/types/BaseRoadmap.types'
import type { RoadmapRequirementView } from '@components/BaseRoadmap/types/internal/roadmapView.types'
import type { RoadmapStageView, RoadmapTopicView } from '@components/BaseRoadmap/types/internal/roadmapInternal.types'

export interface RoadmapToolbarProps {
	className: string
	isMax: boolean
	isMin: boolean
}

export interface RoadmapStepItem {
	id: string
	n: number
	status: string
	isFocused: boolean
	label: string
}

export interface RoadmapStepperProps {
	className: string
	steps: RoadmapStepItem[]
	/** Кнопки «Назад / Далее» рядом с полосой: на узком контейнере */
	hasNav: boolean
	isFirst: boolean
	isLast: boolean
}

export interface RoadmapTourBarProps {
	className: string
	caption: string
	isFirst: boolean
	isLast: boolean
}

/** Этап в панели: данные раскладки, снимок и места в пути */
export interface RoadmapPanelStage {
	view: RoadmapStageView
	item: Roadmap3DStageItem
	n: number
	total: number
	hours: string
	hasPrev: boolean
	hasNext: boolean
	/** Название этапа или темы, после которых этап откроется; пусто, если не закрыт */
	unlock: string
}

/** Выбранная тема в панели */
export interface RoadmapPanelTopic {
	view: RoadmapTopicView
	stage: RoadmapStageView
	doneSubtopics: string[]
	requirements: RoadmapRequirementView[]
	hasNext: boolean
	isBusy: boolean
}

export interface RoadmapStagePanelProps {
	className: string
	stage: RoadmapPanelStage
	topic: RoadmapPanelTopic | null
	panelUi: UiClassFn<BaseRoadmapPart>
	isEditing: boolean
	isCompact: boolean
	isDisabled: boolean
}

export interface RoadmapStageEditProps {
	className: string
	title: string
	hasPrev: boolean
	hasNext: boolean
	models: Array<{ value: string; label: string }>
	currentModel: string
	isCustomModel: boolean
	customUrl: string
	isDisabled: boolean
}

export interface RoadmapStageEditEmit {
	(event: 'rename', title: string): void
	(event: 'model' | 'url', value: string): void
}
