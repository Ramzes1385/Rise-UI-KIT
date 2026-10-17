import type { UiClassFn } from '@composables/base/useUi'
import type { BaseRoadmapPart, RoadmapTopicState } from '../BaseRoadmap.types'
import type { RoadmapStage, RoadmapStageStatus, RoadmapTopic } from '../roadmapData.types'

/** Тема для раскладки: данные и вычисленное */
export interface RoadmapTopicView {
	topic: RoadmapTopic
	state: RoadmapTopicState
	isSelected: boolean
	/** Скрыта фильтром — показывается приглушённой */
	isFiltered: boolean
	/** Не первая в группе `choice`: бейдж «Альтернатива», перед ней «или» */
	isAlternative: boolean
}

/** Этап для раскладки */
export interface RoadmapStageView {
	stage: RoadmapStage
	/** Номер с 0 */
	index: number
	status: RoadmapStageStatus
	/** Изучено тем / всего / часов */
	done: number
	total: number
	hours: number
	isExpanded: boolean
	topics: RoadmapTopicView[]
	/** Id заголовка и панели тем — для aria-controls (панель есть в DOM только раскрытой) */
	headingId: string
	panelId: string
}

/** Пропсы компонентов раскладок `ui/layouts/*` */
export interface RoadmapLayoutProps {
	stages: RoadmapStageView[]
	/** Доля пройденного пути 0..1 — сплошной участок хребта */
	progress: number
	goal?: string
	ui: UiClassFn<BaseRoadmapPart>
}

/** События раскладок */
export interface RoadmapLayoutEmits {
	(event: 'toggle-stage' | 'select-topic' | 'toggle-topic', id: string): void
}
