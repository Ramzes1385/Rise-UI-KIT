import type { UiClassFn } from '@composables/base/useUi'
import type { BaseRoadmapPart } from '../BaseRoadmap.types'
import type { RoadmapStage, RoadmapTopic } from '../roadmapData.types'
import type { RoadmapEditController } from './roadmapEdit.internal.types'
import type { useRoadmapEditor } from '../../model/edit/editor/useRoadmapEditor'
import type { useRoadmapSortable } from '../../model/edit/sortable/useRoadmapSortable'

/** Пропсы поверхности «Правки» (`ui/edit/RoadmapEditor.vue`) */
export interface RoadmapEditorProps {
	edit: RoadmapEditController
	ui: UiClassFn<BaseRoadmapPart>
	/** Правка выключена: поля и кнопки недоступны */
	isDisabled?: boolean
	/** Когда приложение сохранило черновик */
	draftSavedAt?: Date | string | number | null
}

export interface RoadmapEditorEmits {
	(event: 'publish'): void
}

/** Пропсы этапа в «Правке» (`ui/edit/RoadmapEditStage.vue`) */
export interface RoadmapEditStageProps {
	stage: RoadmapStage
	index: number
}

/** Пропсы темы в «Правке» (`ui/edit/RoadmapEditTopic.vue`) */
export interface RoadmapEditTopicProps {
	topic: RoadmapTopic
	stage: RoadmapStage
}

/** Что компоненты «Правки» получают от поверхности через provide */
export interface RoadmapEditorContext {
	edit: RoadmapEditController
	editor: ReturnType<typeof useRoadmapEditor>
	sort: ReturnType<typeof useRoadmapSortable>
	ui: UiClassFn<BaseRoadmapPart>
	isDisabled: () => boolean
	publish: () => void
}

/** Методы панели свойств, доступные снаружи */
export interface RoadmapInspectorExpose {
	focusTitle: () => void
}
