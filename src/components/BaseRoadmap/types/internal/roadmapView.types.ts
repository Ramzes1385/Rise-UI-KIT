import type { ComputedRef, Ref } from 'vue'
import type { UiClassFn } from '@composables/base/useUi'
import type { RoadmapProgress } from '../roadmapData.types'
import type { RoadmapIndex } from './roadmapInternal.types'
import type { useRoadmapModel } from '../../model/useRoadmapModel'
import type { useRoadmapLive } from '../../model/view/useRoadmapLive'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { useRoadmapDetails } from '../../model/view/useRoadmapDetails'
import type { RoadmapStageView, RoadmapTopicView } from './roadmapInternal.types'
import type { BaseRoadmapPart, BaseRoadmapProps, RoadmapTopicState } from '../BaseRoadmap.types'
import type {
	RoadmapMaterial,
	RoadmapProgressStatus,
	RoadmapStage,
	RoadmapStageStatus,
	RoadmapTopic,
	RoadmapTopicStatus,
} from '../roadmapData.types'

/** Где открывается панель темы: колонка справа или нижний лист */
export type RoadmapDetailsMode = 'side' | 'sheet'

/** Ширина контейнера, px, выше которой `detailsPosition: 'auto'` ставит панель справа */
export const ROADMAP_SIDE_MIN_WIDTH = 900

/** Сводка для шапки: «14 из 26 тем · 54 % · осталось ≈ 96 ч · Продолжить: Pinia» */
export interface RoadmapSummaryView {
	done: number
	total: number
	/** 0..100 */
	percent: number
	hoursLeft: number
	/** Тема для «Продолжить» */
	continueId: string | null
	continueTitle: string | null
}

/** Требование темы или этапа для панели и подсказок: название и состояние */
export interface RoadmapRequirementView {
	id: string
	title: string
	/** Для точки статуса: `done`, `in-progress` или любой другой — серая */
	status: RoadmapTopicStatus
	/** Требование — этап, а не тема */
	isStage: boolean
}

/** Пропсы значка статуса темы */
export interface RoadmapStatusIconProps {
	status: RoadmapTopicStatus
	/** Доля подтем 0..1 для полукольца */
	fraction?: number
}

/** Пропсы карточки темы (`parts/RoadmapTopicChip.vue`) */
export interface RoadmapTopicChipProps {
	view: RoadmapTopicView
	ui: UiClassFn<BaseRoadmapPart>
	/** Названия невыполненных требований — для текста скринридера закрытой темы */
	missing?: string[]
	/** Ждёт `beforeStatusChange` — `aria-busy`, значок не отзывается */
	isBusy?: boolean
}

export interface RoadmapTopicChipEmits {
	(event: 'select' | 'toggle', id: string): void
}

export interface RoadmapTopicChipSlots {
	/** Содержимое карточки вместо названия, метки «или» и времени */
	default?: (props: { topic: RoadmapTopic; state: RoadmapTopicState }) => unknown
}

/** Пропсы заголовка этапа (`parts/RoadmapStageHeader.vue`) */
export interface RoadmapStageHeaderProps {
	view: RoadmapStageView
	ui: UiClassFn<BaseRoadmapPart>
	/** Название того, что откроет закрытый этап — «Откроется после «…»» */
	unlockTitle?: string
	/** Без шеврона и раскрытия: закрытый этап в списке */
	isStatic?: boolean
}

export interface RoadmapStageHeaderEmits {
	(event: 'toggle', id: string): void
}

export interface RoadmapStageHeaderSlots {
	/** Содержимое кнопки этапа вместо значка, названия и сводки */
	default?: (props: { stage: RoadmapStage; status: RoadmapStageStatus }) => unknown
}

/** Слоты раскладок: оболочка прокидывает свои `topic` и `stage-header` */
export interface RoadmapLayoutSlots {
	/** Содержимое карточки темы */
	topic?: (props: { topic: RoadmapTopic; state: RoadmapTopicState }) => unknown
	/** Содержимое кнопки этапа */
	'stage-header'?: (props: { stage: RoadmapStage; status: RoadmapStageStatus }) => unknown
}

/** Пропсы списка материалов (`parts/RoadmapMaterials.vue`) */
export interface RoadmapMaterialsProps {
	materials: RoadmapMaterial[]
	ui: UiClassFn<BaseRoadmapPart>
}

export interface RoadmapMaterialsSlots {
	/** Своя ссылка материала, например RouterLink приложения */
	material?: (props: { material: RoadmapMaterial }) => unknown
}

/** Пропсы сводки (`parts/RoadmapSummary.vue`) */
export interface RoadmapSummaryProps {
	summary: RoadmapSummaryView
	ui: UiClassFn<BaseRoadmapPart>
	/** Узкий контейнер: крупный процент, «Продолжить» уходит в закреплённую кнопку */
	isNarrow?: boolean
}

export interface RoadmapSummaryEmits {
	(event: 'continue'): void
}

export interface RoadmapSummarySlots {
	/** Конец шапки сводки */
	'summary-end'?: () => unknown
}

/** Строка легенды: статус со значком и подпись */
export interface RoadmapLegendItem {
	key: string
	status: RoadmapTopicStatus
	fraction: number
	label: string
}

/** Пропсы легенды обозначений (`parts/RoadmapLegend.vue`) */
export interface RoadmapLegendProps {
	ui: UiClassFn<BaseRoadmapPart>
}

/** Пропсы панели темы (`parts/RoadmapTopicPanel.vue`) */
export interface RoadmapTopicPanelProps {
	view: RoadmapTopicView
	/** Этап, в котором лежит тема */
	stage: RoadmapStageView
	/** Id отмеченных подтем из прогресса */
	doneSubtopics: string[]
	requirements: RoadmapRequirementView[]
	ui: UiClassFn<BaseRoadmapPart>
	/** Нижний лист: заголовок и «Закрыть» рисует BaseDrawer */
	isSheet?: boolean
	/** Без отметок: подтемы и кнопки отключены */
	isDisabled?: boolean
	/** Ждёт `beforeStatusChange` */
	isBusy?: boolean
	/** Есть следующая тема — кнопка «Следующая тема» */
	hasNext?: boolean
}

export interface RoadmapTopicPanelEmits {
	(event: 'toggle-subtopic', topicId: string, subtopicId: string, isDone: boolean): void
	(event: 'set-status', topicId: string, status: RoadmapProgressStatus | null): void
	(event: 'select', id: string): void
	(event: 'next'): void
}

export interface RoadmapTopicPanelSlots {
	/** Низ панели темы */
	'topic-details'?: (props: { topic: RoadmapTopic; state: RoadmapTopicState }) => unknown
	/** Своя ссылка материала */
	material?: (props: { material: RoadmapMaterial }) => unknown
}

/** Модель роадмапа без отрисовки — то, что возвращает `useRoadmapModel` */
export type RoadmapModel = ReturnType<typeof useRoadmapModel>

/** Что нужно действиям оболочки от модели, живого региона и панели */
export interface RoadmapActionsContext {
	model: RoadmapModel
	live: ReturnType<typeof useRoadmapLive>
	details: ReturnType<typeof useRoadmapDetails>
}

/** Пропсы BaseRoadmap после `withDefaults`: поля с умолчанием не `undefined` */
export type RoadmapProps = PropsWithDefaults<
	BaseRoadmapProps,
	'sizeScale' | 'layout' | 'narrowLayout' | 'narrowWidth' | 'filter' | 'hasSummary' | 'hasFilter' | 'hasLayoutSwitch' | 'detailsPosition'
>

/** Что нужно `useRoadmapNarrow` */
export interface UseRoadmapNarrowOptions {
	rootRef: Ref<HTMLElement | null>
	narrowWidth: () => number
	detailsPosition: () => 'side' | 'sheet' | 'auto'
}

/** Что нужно `useRoadmapDetails` */
export interface UseRoadmapDetailsOptions {
	rootRef: Ref<HTMLElement | null>
	mode: ComputedRef<RoadmapDetailsMode>
	stageViews: ComputedRef<RoadmapStageView[]>
	selectedId: Ref<string | null>
	progress: Ref<RoadmapProgress>
	index: ComputedRef<RoadmapIndex>
	selectTopic: (id: string | null) => void
	expandStage: (id: string, isOpen?: boolean) => void
}
