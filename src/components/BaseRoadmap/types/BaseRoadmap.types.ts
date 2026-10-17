import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type {
	RoadmapData,
	RoadmapMaterial,
	RoadmapProgress,
	RoadmapProgressStatus,
	RoadmapProgressStorage,
	RoadmapStage,
	RoadmapStageStatus,
	RoadmapTopic,
	RoadmapTopicStatus,
} from './roadmapData.types'

/** Раскладки: path — хребет с темами-ветками, snake — дорога рядами, list — этапы аккордеоном, horizontal — лента слева направо */
export const ROADMAP_LAYOUTS = ['path', 'snake', 'list', 'horizontal'] as const
export type RoadmapLayout = (typeof ROADMAP_LAYOUTS)[number]

/** Фильтр тем */
export const ROADMAP_FILTERS = ['all', 'required', 'optional'] as const
export type RoadmapFilter = (typeof ROADMAP_FILTERS)[number]

/** Варианты оформления — как у BaseFlowMap */
export const ROADMAP_VARIANTS = ['default', 'outline', 'ghost'] as const
export type RoadmapVariant = (typeof ROADMAP_VARIANTS)[number]

/** Части для `ui` и `customClass` */
export const ROADMAP_PARTS = [
	'root',
	'header',
	'summary',
	'filter',
	'layout',
	'spine',
	'stage',
	'stage-header',
	'topic',
	'details',
	'materials',
	'status',
] as const
export type BaseRoadmapPart = (typeof ROADMAP_PARTS)[number]

/** Отменяемые хуки: false — отменить; Promise ждётся */
export interface RoadmapHooks {
	/** Перед сменой статуса темы (отметка, подтема, метод, хранилище) */
	beforeStatusChange: (context: RoadmapStatusChange) => boolean | void | Promise<boolean | void>
}

/**
 * Пропсы компонента BaseRoadmap
 */
export interface BaseRoadmapProps extends BaseComponentProps<RoadmapVariant, BaseRoadmapPart>, Partial<RoadmapHooks> {
	/** Данные роадмапа */
	data: RoadmapData
	/** Прогресс (`v-model:progress`) */
	progress?: RoadmapProgress
	/** Хранилище прогресса; null — не хранить */
	storage?: RoadmapProgressStorage | null
	/** Раскладка; по умолчанию path */
	layout?: RoadmapLayout
	/** Раскладка, когда контейнер уже `narrowWidth`; по умолчанию list; null — не менять */
	narrowLayout?: RoadmapLayout | null
	/** Ширина контейнера, px, ниже которой — `narrowLayout`; по умолчанию 560 */
	narrowWidth?: number
	/** Раскрытые этапы (`v-model:expanded`); по умолчанию — текущий */
	expanded?: string[]
	/** Выбранная тема — панель темы (`v-model:selected`) */
	selected?: string | null
	/** Фильтр (`v-model:filter`) */
	filter?: RoadmapFilter
	/** Шапка «N из M тем · % · осталось ≈ ч · Продолжить» */
	hasSummary?: boolean
	/** Переключатель фильтра */
	hasFilter?: boolean
	/** Переключатель раскладки */
	hasLayoutSwitch?: boolean
	/** Панель темы: side — справа, sheet — BaseDrawer снизу, auto — side, если контейнер шире 900 px */
	detailsPosition?: 'side' | 'sheet' | 'auto'
	/** Подпись области; без неё — `data.title` */
	ariaLabel?: string
	/** Загрузка — скелетон */
	isLoading?: boolean
	/** Отключён: без отметок */
	isDisabled?: boolean
	/** Классы частей */
	ui?: UiProp<BaseRoadmapPart>
}

/**
 * События компонента BaseRoadmap
 */
export interface BaseRoadmapEmits {
	(event: 'update:progress', value: RoadmapProgress): void
	(event: 'update:expanded', value: string[]): void
	(event: 'update:selected', value: string | null): void
	(event: 'update:filter', value: RoadmapFilter): void
	(event: 'select', value: RoadmapTopic | null): void
	(event: 'status-change', value: RoadmapStatusChange): void
	(event: 'topic-complete', value: { topic: RoadmapTopic; progress: RoadmapProgress }): void
	(event: 'stage-complete', value: { stage: RoadmapStage; progress: RoadmapProgress }): void
	(event: 'progress-load' | 'progress-save', value: RoadmapProgress): void
	(event: 'progress-error', value: unknown): void
}

/** Смена статуса темы */
export interface RoadmapStatusChange {
	topic: RoadmapTopic
	from: RoadmapTopicStatus
	to: RoadmapTopicStatus
	/** Откуда: user — отметка, subtopic — подтема, api — метод, storage — хранилище */
	source: 'user' | 'subtopic' | 'api' | 'storage'
}

/** Состояние темы для слотов и `getTopicState` */
export interface RoadmapTopicState {
	status: RoadmapTopicStatus
	/** Отмечено подтем */
	done: number
	/** Всего подтем */
	total: number
	/** 0..1 */
	fraction: number
	/** Невыполненные требования */
	missing: string[]
}

/**
 * Слоты компонента BaseRoadmap
 */
export interface BaseRoadmapSlots {
	/** Содержимое карточки темы */
	topic?: (props: { topic: RoadmapTopic; state: RoadmapTopicState }) => unknown
	/** Низ панели темы */
	'topic-details'?: (props: { topic: RoadmapTopic; state: RoadmapTopicState }) => unknown
	/** Заголовок этапа */
	'stage-header'?: (props: { stage: RoadmapStage; status: RoadmapStageStatus }) => unknown
	/** Своя ссылка материала, например RouterLink приложения */
	material?: (props: { material: RoadmapMaterial }) => unknown
	/** Конец шапки сводки */
	'summary-end'?: () => unknown
	/** Нет этапов */
	empty?: () => unknown
}

/** Методы ref */
export interface BaseRoadmapExpose {
	setTopicStatus: (id: string, status: RoadmapProgressStatus | null) => Promise<boolean>
	toggleSubtopic: (topicId: string, subtopicId: string, isDone?: boolean) => Promise<boolean>
	expandStage: (id: string, isOpen?: boolean) => void
	expandAll: () => void
	collapseAll: () => void
	selectTopic: (id: string | null) => void
	continueLearning: () => void
	getTopicState: (id: string) => RoadmapTopicState | null
	resetProgress: () => void
}
