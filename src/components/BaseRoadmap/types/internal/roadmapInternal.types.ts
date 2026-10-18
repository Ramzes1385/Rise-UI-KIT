import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { UiClassFn } from '@composables/base/useUi'
import type {
	RoadmapData,
	RoadmapProgress,
	RoadmapProgressStatus,
	RoadmapStage,
	RoadmapStageStatus,
	RoadmapTopic,
} from '../roadmapData.types'
import type {
	BaseRoadmapEmits,
	BaseRoadmapPart,
	BaseRoadmapProps,
	RoadmapFilter,
	RoadmapStatusChange,
	RoadmapTopicState,
} from '../BaseRoadmap.types'

/** Тема для раскладки: данные и вычисленное */
export interface RoadmapTopicView {
	topic: RoadmapTopic
	state: RoadmapTopicState
	isSelected: boolean
	/** Скрыта фильтром — показывается приглушённой */
	isFiltered: boolean
	/** Не первая в группе `choice`: бейдж «Альтернатива», перед ней «или» */
	isAlternative: boolean
	/** Хук `beforeStatusChange` ещё ждёт Promise — у строки `aria-busy` */
	isBusy: boolean
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

/** Тема в индексе данных: сама тема и её этап */
interface RoadmapTopicEntry {
	topic: RoadmapTopic
	stage: RoadmapStage
	/** Номер этапа с 0 */
	stageIndex: number
}

/** Индекс данных по id: первое вхождение id выигрывает (повторы — предупреждение проверки) */
export interface RoadmapIndex {
	stages: Map<string, RoadmapStage>
	topics: Map<string, RoadmapTopicEntry>
}

/** Эффективные требования: id этапа или темы → id, которые должны быть пройдены (без неизвестных и замыкающих цикл) */
export type RoadmapRequirements = Map<string, string[]>

/** Ключи предупреждений о данных — ключи раздела словаря `UI_ROADMAP` */
type RoadmapIssueCode = 'CYCLE' | 'DUPLICATE_ID' | 'NEGATIVE_HOURS' | 'UNKNOWN_KIND' | 'UNKNOWN_REQUIRE'

/** Найденная проблема данных */
export interface RoadmapIssue {
	code: RoadmapIssueCode
	params: Record<string, number | string>
}

/** Итог проверки данных */
export interface RoadmapValidation {
	requires: RoadmapRequirements
	issues: RoadmapIssue[]
}

/** Вычисленные статусы */
export interface RoadmapStatuses {
	topics: Map<string, RoadmapTopicState>
	stages: Map<string, RoadmapStageStatus>
	/** Id текущего этапа; null — нет (всё пройдено или пусто) */
	currentStageId: string | null
}

/** Сводка роадмапа */
export interface RoadmapSummary {
	/** Изучено тем (статус done) */
	done: number
	/** Всего тем */
	total: number
	/** 0..100, округлено */
	percent: number
	/** «осталось ≈ N ч», округлено до целых */
	hoursLeft: number
	/** Id темы для «Продолжить»; null — кнопки нет */
	continueTopicId: string | null
}

/** Изменения статусов после смены прогресса */
export interface RoadmapCompletions {
	/** Темы, ставшие done */
	topics: string[]
	/** Этапы, ставшие done */
	stages: string[]
}

/** Результат слияния прогресса из хранилища с текущим */
export interface RoadmapMergeResult {
	progress: RoadmapProgress
	/** Темы, у которых победило хранилище */
	fromStored: string[]
	/** Темы, у которых победил текущий прогресс (хранилищу нужна запись) */
	fromLocal: string[]
}

/** Что нужно `useRoadmapProgress` от модели */
export interface UseRoadmapProgressOptions {
	props: BaseRoadmapProps
	emit: BaseRoadmapEmits
	data: Ref<RoadmapData>
	index: ComputedRef<RoadmapIndex>
	requires: ComputedRef<RoadmapRequirements>
}

/** Вход вычисления статусов; `index` по умолчанию строится из `data` */
export interface RoadmapStatusInput {
	data: RoadmapData
	progress: RoadmapProgress
	requires: RoadmapRequirements
	index?: RoadmapIndex
}

/** Рабочее состояние вычисления статусов: кеши и защита от повторного входа */
export interface RoadmapStatusContext {
	index: RoadmapIndex
	requires: RoadmapRequirements
	progress: RoadmapProgress
	topics: Map<string, RoadmapTopicState>
	stageDone: Map<string, boolean>
	visiting: Set<string>
}

/** Ребро графа требований; `key` — id рёбер, которые можно отбросить (явные `requires`), у неявных `null` */
export interface RoadmapGraphEdge {
	to: string
	key: string | null
}

/** Рабочее состояние поиска циклов */
export interface RoadmapCycleState {
	edges: Map<string, RoadmapGraphEdge[]>
	marks: Map<string, 1 | 2>
	dropped: Set<string>
	issues: RoadmapIssue[]
	nodes: string[]
	path: RoadmapGraphEdge[]
}

/** Накопитель сводки */
export interface RoadmapSummaryTotals {
	done: number
	total: number
	hours: number
	inProgressId: string | null
	availableId: string | null
}

/** Что нужно сводке от статусов и индекса */
export interface RoadmapSummaryContext {
	statuses: RoadmapStatuses
	index: RoadmapIndex
}

/** Группа `choice` в этапе: пройдена ли и сколько часов осталось у самой короткой темы */
interface RoadmapChoiceGroup {
	isPassed: boolean
	least: number | null
}

/** Тема этапа при подсчёте сводки */
export interface RoadmapSummaryItem {
	topic: RoadmapTopic
	stage: RoadmapStage
	groups: Map<string, RoadmapChoiceGroup>
	/** Доступные обязательные темы этапа по порядку: «Продолжить» берёт первую, чья группа ещё не пройдена */
	candidates: { id: string; choice: string | undefined }[]
}

/** Источник смены статуса */
export type RoadmapChangeSource = RoadmapStatusChange['source']

/** Одна смена статуса темы */
export interface RoadmapChangeRequest {
	topicId: string
	source: RoadmapChangeSource
}

/** Общее состояние прогресса для функций `useRoadmapProgress` */
export interface RoadmapProgressContext extends UseRoadmapProgressOptions {
	progress: ShallowRef<RoadmapProgress>
	statuses: ComputedRef<RoadmapStatuses>
	busy: ShallowRef<ReadonlySet<string>>
}

/** Что нужно хранилищу от прогресса */
export interface UseRoadmapStorageOptions {
	props: BaseRoadmapProps
	emit: BaseRoadmapEmits
	key: ComputedRef<string>
	progress: ShallowRef<RoadmapProgress>
	/** Слить прогресс из хранилища; `true` — хранилищу нужна запись (у текущего прогресса есть более новые темы) */
	merge: (stored: RoadmapProgress) => Promise<boolean>
}

/** Данные для построения `RoadmapStageView[]` */
export interface RoadmapViewInput {
	data: RoadmapData
	statuses: RoadmapStatuses
	busy: ReadonlySet<string>
	expanded: string[]
	filter: RoadmapFilter
	selectedId: string | null
	idPrefix: string
}

/** Что нужно выбору темы и фильтру */
export interface UseRoadmapSelectionOptions {
	props: BaseRoadmapProps
	emit: BaseRoadmapEmits
	index: ComputedRef<RoadmapIndex>
}

/** Что нужно раскрытию этапов */
export interface UseRoadmapExpandedOptions extends UseRoadmapSelectionOptions {
	/** Текущий этап: раскрыт, пока `expanded` не задан */
	currentStageId: ComputedRef<string | null>
}

/** Правка статуса темы в прогрессе */
export interface RoadmapStatusPatch {
	topicId: string
	/** `null` — сбросить тему (статус и подтемы) */
	status: RoadmapProgressStatus | null
	/** Время изменения, ISO */
	now: string
}

/** Правка подтемы в прогрессе */
export interface RoadmapSubtopicPatch {
	subtopicId: string
	isDone: boolean
	now: string
}
