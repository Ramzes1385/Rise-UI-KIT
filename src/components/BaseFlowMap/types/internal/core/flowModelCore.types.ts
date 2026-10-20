import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { FlowGroupState } from '../flowGroups.types'
import type { FlowLayoutScope } from './flowLayoutScope.types'
import type { FlowMapData, FlowPoint } from '../../data/flowData.types'
import type { FlowGraph, FlowLayoutResult } from '../../api/flowLayout.types'
import type { FlowDataIssue, FlowNotation } from '../../api/flowNotation.types'
import type { FlowChange, FlowChangeSource, FlowSuggestion } from '../../data/flowReview.types'
import type { FlowModel, FlowModelEnvironment, FlowModelProps, FlowViewAdapter } from '../flowModel.types'
import type { CommandHistory, HookRunner } from '@composables/editor/useCommandHistory/types/useCommandHistory.types'
import type { FlowBinding, FlowEventMap, FlowHooks, FlowLiveState, FlowMapController, FlowMode } from '../../api/flowController.types'

/** Передача события наружу: `emit` компонента */
export type FlowEmit = <K extends keyof FlowEventMap>(name: K, value: FlowEventMap[K]) => void

/** Что модель берёт у владельца: `emit` компонента, вид и слушатели из `vnode.props` */
export interface FlowModelOptions {
	/** `emit` компонента; у `useFlowModel` без компонента — не нужен */
	emit?: FlowEmit
	/** Видимость, движение, озвучка */
	environment: FlowModelEnvironment
	/** Слушатели событий из `vnode.props`: имя события → функция (для панели «Хуки») */
	listeners?: () => Record<string, unknown>
	/** Компактный вид: ширина области меньше `compactBreakpoint`; нет — карточки */
	isCompact?: () => boolean
	/** Догрузить интерфейс сценария вместе с драйвером: панель и слой появляются сразу */
	preloadScenario?: () => Promise<unknown>
}

/** Подписка на событие через `controller.on` */
export interface FlowEventSub {
	/** Id */
	id: string
	/** Имя события */
	name: string
	/** Обработчик */
	handler: (value: never) => void
	/** Включена */
	isEnabled: boolean
	/** Сколько раз вызвана */
	calls: number
}

/** Шина событий: подписчики контроллера и `emit` компонента */
export interface FlowEventBus {
	/** Сообщить о событии */
	emit: FlowEmit
	/** Подписаться на событие; возвращает отписку */
	subscribe: (name: string, handler: (value: never) => void) => () => void
	/** Привязки событий */
	list: () => FlowBinding[]
	/** Включить или выключить привязку события; false — такой привязки нет */
	setEnabled: (id: string, isEnabled: boolean) => boolean
	/** Запомнить итог для привязки */
	note: (name: string, text: string) => void
	/** Итог последнего вызова */
	resultOf: (name: string) => string | undefined
}

/** Состояние данных карты: реестры, граф, проверка, живые данные, выделение */
export interface FlowState {
	/** Данные после нормализации */
	data: ShallowRef<FlowMapData>
	/** Данные для раскладки и отрисовки: свёрнутые группы заменены блоками */
	shown: ComputedRef<FlowMapData>
	/** Свёрнутость групп и уровень смыслового зума */
	groups: FlowGroupState
	/** Нотации */
	registry: ComputedRef<Map<string, FlowNotation>>
	/** Нотация карты */
	notation: ComputedRef<FlowNotation>
	/** Граф */
	graph: ComputedRef<FlowGraph>
	/** Проверка */
	issues: ComputedRef<FlowDataIssue[]>
	/** Область раскладки */
	scope: ComputedRef<FlowLayoutScope>
	/** Выделение */
	selection: Ref<string[]>
	/** Подсветка */
	highlighted: ShallowRef<ReadonlySet<string>>
	/** Живые данные */
	live: ShallowRef<FlowLiveState>
	/** Режим */
	mode: ComputedRef<FlowMode>
	/** Записать новые данные */
	commit: (next: FlowMapData) => void
}

/** Среда построения команд: нотация, позиции узлов и источник */
export interface FlowCommandEnv {
	/** Нотация */
	notation: () => FlowNotation
	/** Реестр нотаций */
	registry: () => ReadonlyMap<string, FlowNotation>
	/** Текущая позиция узла на холсте */
	positionOf: (id: string) => FlowPoint | undefined
	/** Область раскладки */
	scope: () => FlowLayoutScope
	/** Источник изменений команды */
	source: FlowChangeSource
}

/** Исполнение команды: всё, что нужно конвейеру */
export interface FlowExecContext {
	/** Пропсы */
	props: FlowModelProps
	/** Состояние */
	state: FlowState
	/** Хуки */
	hooks: HookRunner<FlowHooks>
	/** История */
	history: CommandHistory<FlowChange>
	/** События */
	events: FlowEventBus
	/** Черновик «Правок» */
	draft: ShallowRef<FlowSuggestion | null>
}

/** Состояние слушателя компонента для события */
export interface FlowEventState {
	/** Включён */
	isEnabled: boolean
	/** Сколько раз вызван */
	calls: number
}

/** Описание привязки события */
export interface FlowBindingMeta {
	/** Id */
	id: string
	/** Имя события */
	name: string
	/** Имя функции-обработчика */
	handler: string
	/** Последний итог */
	lastResult?: string
}

/** Хуки и события вместе — для панели привязок */
export interface FlowBindingParts {
	/** Хуки */
	hooks: HookRunner<FlowHooks>
	/** События */
	events: FlowEventBus
}

/** Подписка пропа-хука на раннер */
export interface FlowPropSubscription {
	/** Функция из пропа, на которую подписались */
	fn: unknown
	/** Отписка */
	off: () => void
}

/** Откуда пропы-хуки идут в раннер */
export interface FlowHookSource {
	/** Пропы модели */
	props: FlowModelProps
	/** Раннер */
	hooks: HookRunner<FlowHooks>
}

/** Методы контроллера, которые работают с состоянием: выделение, подсветка, живые данные, выгрузка */
export type FlowStateApi = Pick<
	FlowMapController,
	| 'select'
	| 'getSelection'
	| 'highlightPath'
	| 'clearHighlight'
	| 'setLive'
	| 'setStatus'
	| 'setMetrics'
	| 'getData'
	| 'getGraph'
	| 'exportJson'
	| 'validate'
>

/** Живая запись узла или связи */
export type FlowLiveEntry = NonNullable<FlowLiveState['nodes']>[string] & NonNullable<FlowLiveState['edges']>[string]

/** Части модели для «Правок»: предложения, принятие, сравнение */
export interface FlowReviewParts extends FlowExecContext {
	/** Исполнение команд */
	execute: FlowModel['execute']
}

/** Методы контроллера для «Правок» */
export type FlowReviewApi = Pick<FlowMapController, 'suggest' | 'accept' | 'decline' | 'compare'>

/** Хранилище предложений: чтение и обновление */
export interface FlowSuggestionStore {
	/** Предложения */
	list: ShallowRef<FlowSuggestion[]>
	/** Обновить поля предложения; undefined — такого нет */
	update: (id: string, patch: Partial<FlowSuggestion>) => FlowSuggestion | undefined
}

/** Части модели для команд и истории */
export interface FlowCommandParts extends FlowExecContext {
	/** Исполнение команд */
	execute: FlowModel['execute']
	/** Раскладка: позиции узлов для `move` и `layout` */
	layout: Readonly<ShallowRef<FlowLayoutResult>>
	/** Озвучка */
	announce: (text: string) => void
}

/** Методы контроллера, которые меняют данные */
export type FlowEditApi = Pick<
	FlowMapController,
	'addNode' | 'updateNode' | 'addEdge' | 'connect' | 'updateEdge' | 'addGroup' | 'updateGroup' | 'remove' | 'move' | 'layout'
>

/** Методы контроллера: история, транзакции, импорт, чужие изменения */
export type FlowHistoryApi = Pick<
	FlowMapController,
	'transact' | 'applyRemote' | 'undo' | 'redo' | 'getHistory' | 'clearHistory' | 'importJson'
>

/** Всё, из чего собирается контроллер */
export interface FlowControllerParts extends FlowCommandParts {
	/** Сценарий */
	scenario: FlowModel['scenario']
	/** Вид */
	view: FlowViewAdapter
}

/** Модель без сценария, контроллера и вида: из неё собираются остальные части */
export type FlowModelBase = Omit<FlowModel, 'scenario' | 'controller' | 'setView'>
