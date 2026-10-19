import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { UI_ROADMAP_EDIT } from '@/locales/messages'
import type { RoadmapReviewState } from './roadmapReview.types'
import type { RoadmapChange, RoadmapTemplate } from '../roadmapEdit.types'
import type { RoadmapData, RoadmapStage, RoadmapTopic } from '../roadmapData.types'
import type { CommandHistory, HookRunner } from '@composables/editor/useCommandHistory/types/useCommandHistory.types'
import type { BaseRoadmapEmits, BaseRoadmapExpose, BaseRoadmapProps, RoadmapHooks, RoadmapMode } from '../BaseRoadmap.types'

/** Причина отказа правки */
type RoadmapRejectCode = 'cycle' | 'disabled' | 'duplicate' | 'hook' | 'invalid' | 'stale' | 'unknown'

/** Отказ: текст для плашки `role="status"` и код */
export interface RoadmapRejection {
	code: RoadmapRejectCode
	text: string
}

/** Команда правки: имя для хуков, подпись шага истории и построение изменений из текущих данных */
export interface RoadmapCommand {
	name: string
	label: string
	/** Склейка подряд идущих шагов (набор названия) */
	mergeKey?: string
	build: (data: RoadmapData) => RoadmapChange[] | RoadmapRejection
}

/** Результат построения: изменения или отказ */
export type RoadmapBuilt = RoadmapChange[] | RoadmapRejection

/** Куда вставить этап, тему или шаблон */
export interface RoadmapInsertTarget {
	stage?: string
	index?: number
}

/** Что нужно правке от модели */
export interface RoadmapEditContext {
	props: BaseRoadmapProps
	emit: BaseRoadmapEmits
	data: ShallowRef<RoadmapData>
	hooks: RoadmapHookBoard
}

/** Выполнить команду правки */
export type RoadmapRunner = (command: RoadmapCommand) => Promise<boolean>

/** Методы правки, которые выполняются как команды */
type RoadmapEditMethods = Omit<RoadmapEditExpose, 'undo' | 'redo' | 'transact'>

/** Реактивное состояние «Правки» */
export interface RoadmapEditState {
	rejection: ShallowRef<RoadmapRejection | null>
	liveText: ShallowRef<string>
	draft: ShallowRef<RoadmapData | null>
	history: CommandHistory<RoadmapChange>
}

/** Загрузчик «Правки»: код правки приходит отдельным чанком при первом обращении */
type RoadmapEditExpose = Pick<
	BaseRoadmapExpose,
	| 'addStage'
	| 'addTopic'
	| 'move'
	| 'update'
	| 'remove'
	| 'addRequirement'
	| 'removeRequirement'
	| 'insertTemplate'
	| 'transact'
	| 'undo'
	| 'redo'
	| 'importJson'
>

/** Контроллер «Правки» */
export interface RoadmapEditController extends RoadmapEditExpose, RoadmapEditState {
	/** Данные для показа: черновик перестановки или данные */
	viewData: ComputedRef<RoadmapData>
	announce: (text: string) => void
	dismissRejection: () => void
	/** Выполнить команду (с хуками и историей) */
	run: (command: RoadmapCommand) => Promise<boolean>
	/** Применить набор изменений одним шагом истории с подписью (принятое предложение «Правок») */
	applyChanges: (changes: RoadmapChange[], label: string) => Promise<boolean>
	templates: ComputedRef<RoadmapTemplate[]>
	/** Хуки: подписки приложения и их итоги — вкладка «Хуки» */
	hooks: RoadmapHookBoard
	/** Выбор этапа или темы по id */
	find: (id: string) => RoadmapFound | null
}

/** Режим и переключатель */
export interface RoadmapModeState {
	currentMode: ShallowRef<RoadmapMode>
	isEditing: ComputedRef<boolean>
	isReviewing: ComputedRef<boolean>
	setMode: (mode: RoadmapMode) => void
}

/** Загрузчик правки: методы expose, контроллер (после загрузки чанка) и `load` */
export interface RoadmapEditLoader {
	controller: ShallowRef<RoadmapEditController | null>
	load: () => Promise<RoadmapEditController>
	methods: Omit<
		BaseRoadmapExpose,
		| 'on'
		| 'propose'
		| 'setTopicStatus'
		| 'toggleSubtopic'
		| 'expandStage'
		| 'expandAll'
		| 'collapseAll'
		| 'selectTopic'
		| 'continueLearning'
		| 'getTopicState'
		| 'resetProgress'
	>
}

/** Найденный этап или тема: этап, номера и тема (у этапа её нет) */
export interface RoadmapFound {
	stage: RoadmapStage
	stageIndex: number
	topic?: RoadmapTopic
	topicIndex: number
}

/** Вкладка панели свойств */
export type RoadmapInspectorTab = 'topic' | 'materials' | 'hooks'

/** Место темы при перестановке: этап и номер в нём */
export interface RoadmapTopicPlace {
	stage: string
	index: number
}

/** Что нужно перестановке */
export interface RoadmapSortableOptions {
	rootRef: Ref<HTMLElement | null>
	edit: RoadmapEditController
	isDisabled: () => boolean
}

/** Общие действия перестановки */
export interface RoadmapSortableActions {
	focusHandle: (id: string) => void
	preview: (id: string, place: number | RoadmapTopicPlace) => void
	drop: (task: { id: string; kind: 'stage' | 'topic' }, done: () => void) => Promise<void>
	cancel: (done: () => void) => void
	announce: (message: 'PICKED' | 'MOVED', id: string, kind: 'stage' | 'topic') => void
	moveBy: (id: string, delta: -1 | 1) => Promise<void>
}

/** Имя хука, который подписывается из пропсов */
export type RoadmapHookName = 'beforeStatusChange' | 'beforeChange' | 'beforeDelete'

/** Итог последнего вызова обработчика: разрешил или отказал (с причиной) */
export interface RoadmapHookResult {
	isCancelled: boolean
	reason?: string
}

/** Хуки роадмапа с учётом для вкладки «Хуки»: версия списка и последний итог каждого обработчика */
export interface RoadmapHookBoard extends HookRunner<RoadmapHooks> {
	/** Растёт при подписке, отписке, включении и каждом вызове — для обновления вкладки */
	revision: ShallowRef<number>
	resultOf: (id: string) => RoadmapHookResult | undefined
}

/** Подписка из пропса: функция и отписка */
export interface RoadmapPropSubscription {
	fn: unknown
	off: () => void
}

/** Ключ строки словаря «Правки» */
export type RoadmapEditKey = Extract<keyof typeof UI_ROADMAP_EDIT, string>

/** Методы структуры: добавить, переместить, изменить, удалить */
export type RoadmapStructureMethods = Pick<RoadmapEditMethods, 'addStage' | 'addTopic' | 'move' | 'update' | 'remove'>

/** Методы связей и вставки */
export type RoadmapLinkMethods = Pick<RoadmapEditMethods, 'addRequirement' | 'removeRequirement' | 'insertTemplate' | 'importJson'>

/** Куда добавить тему */
export interface RoadmapTopicInsert {
	stage: string
	topic: RoadmapTopic
	index?: number
}

/** Инструмент «Правки»: выбор или связь */
export type RoadmapTool = 'select' | 'link'

/** Подтверждение, которого ждёт окно: удалить этап с темами или заменить непустой путь шаблоном */
export type RoadmapPending = { kind: 'stage'; id: string; title: string; topics: number } | { kind: 'template'; id: string; title: string }

/** Счётчики подвала */
export interface RoadmapEditCounts {
	stages: number
	topics: number
	changes: number
	issues: number
}

/** Панель свойств для композиции */
export type RoadmapInspectorState = ReturnType<typeof import('../../model/edit/sortable/useRoadmapInspector').useRoadmapInspector>

/** Что нужно обработчику клавиш «Правки» */
export interface RoadmapEditorKeysContext {
	edit: RoadmapEditController
	inspector: RoadmapInspectorState
	state: {
		linkFrom: ShallowRef<string | null>
		setTool: (tool: RoadmapTool) => void
	}
	actions: {
		requestRemove: (id: string) => void
		duplicate: (id: string) => Promise<boolean>
	}
	focusTitle: () => void
}

/** Состояние поверхности «Правки» (то, что возвращает `useRoadmapEditor`) */
export type RoadmapEditorState = ReturnType<typeof import('../../model/edit/editor/useRoadmapEditor').useRoadmapEditor>

/** Загрузчик «Правок»: код и состояние приходят отдельным чанком при первом обращении */
export interface RoadmapReviewLoader {
	state: ShallowRef<RoadmapReviewState | null>
	load: () => Promise<RoadmapReviewState>
	propose: BaseRoadmapExpose['propose']
}
