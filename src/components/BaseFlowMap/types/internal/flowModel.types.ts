import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { BaseFlowMapProps } from '../BaseFlowMap.types'
import type { FlowGraph, FlowLayoutResult, FlowRoute } from '../api/flowLayout.types'
import type { FlowScenarioState, FlowTimelineEntry } from '../data/flowScenario.types'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode, FlowSize } from '../data/flowData.types'
import type { FlowChange, FlowChangeSource, FlowElementRef, FlowSuggestion } from '../data/flowReview.types'
import type { CommandHistory, HookRunner } from '@composables/editor/useCommandHistory/types/useCommandHistory.types'
import type { FlowDataIssue, FlowEdgeKindDef, FlowGroupKindDef, FlowNodeKindDef, FlowNotation } from '../api/flowNotation.types'
import type {
	FlowCommandResult,
	FlowHooks,
	FlowLevelState,
	FlowLiveState,
	FlowMapController,
	FlowMode,
	FlowRejectEvent,
	FlowViewport,
} from '../api/flowController.types'

/** Пропсы модели — общие для BaseFlowMap и BaseFlowMap3D */
export type FlowModelProps = Pick<
	BaseFlowMapProps,
	| 'data'
	| 'notations'
	| 'plugins'
	| 'mode'
	| 'selection'
	| 'layout'
	| 'scenario'
	| 'isAutoplay'
	| 'isSemanticZoom'
	| 'choices'
	| 'live'
	| 'suggestions'
	| 'comments'
	| 'versions'
	| 'compareWith'
	| 'currentUser'
	| 'isDisabled'
> &
	Partial<FlowHooks>

/** Что модель берёт у вида: видимость и движение (2D — наблюдатель пересечения и вкладка, 3D — свой цикл) */
export interface FlowModelEnvironment {
	/** Карта на экране и вкладка активна: часы сценария идут */
	isVisible: () => boolean
	/** Движение выключено: шаги без пробега, автозапуска нет */
	isReducedMotion: () => boolean
	/** Сообщить в live-регион */
	announce: (text: string) => void
}

/** Команда ядра: изменения по текущим данным и свои хуки */
export interface FlowCommand {
	/** Имя: `add-node`, `connect`, `move`, `update`, `delete`, `layout`, `import`, `paste`… — в `FlowBeforeChangeContext.command` */
	name: string
	/** Подпись шага истории */
	label: string
	/** Источник */
	source: FlowChangeSource
	/** Ключ склейки шагов (набор подписи, сдвиг стрелками) */
	mergeKey?: string
	/** Изменения; отказ — правило или предел */
	build: (data: FlowMapData, graph: FlowGraph) => FlowChange[] | FlowRejectEvent
	/** Свои хуки команды до `beforeChange` (`beforeConnect`, `beforeDelete`…): вернуть изменения (возможно, поправленные) или null — отменено */
	before?: (hooks: HookRunner<FlowHooks>, changes: FlowChange[], data: FlowMapData) => Promise<FlowChange[] | null>
}

/** Драйвер сценария — часть «Сценарии»; ядро зовёт его из контроллера */
export interface FlowScenarioDriver {
	/** Состояние */
	state: Readonly<Ref<FlowScenarioState>>
	/** Хронометраж выбранных веток */
	timeline: Readonly<Ref<FlowTimelineEntry[]>>
	/** Запустить */
	play: (scenario?: string) => void
	/** Пауза */
	pause: () => void
	/** Остановить */
	stop: () => void
	/** Перейти */
	seek: (to: number | { step: string | number }) => void
	/** Шаг */
	step: (direction: 1 | -1) => void
	/** Скорость */
	setSpeed: (speed: number) => void
}

/** Методы вида: их даёт 2D (вьюпорт) или 3D (камера) */
export type FlowViewAdapter = Pick<
	FlowMapController,
	'fitView' | 'focus' | 'zoom' | 'getViewport' | 'setViewport' | 'exportSvg' | 'exportPng'
>

/** Модель карты без отрисовки — общая для 2D и 3D */
export interface FlowModel {
	/** Данные после нормализации (виды по умолчанию, порядок) */
	data: Readonly<ShallowRef<FlowMapData>>
	/** Данные для раскладки и отрисовки: свёрнутые группы заменены блоками, связи к скрытым узлам идут к блоку */
	shown: ComputedRef<FlowMapData>
	/** Id свёрнутых групп сейчас */
	collapsed: ComputedRef<ReadonlySet<string>>
	/** Уровень смыслового зума и путь входа */
	level: ComputedRef<FlowLevelState>
	/** Граф */
	graph: ComputedRef<FlowGraph>
	/** Нотация карты */
	notation: ComputedRef<FlowNotation>
	/** Вид узла (с `<нотация>:<вид>`; неизвестный — общий прямоугольник и `warn`) */
	nodeKind: (node: FlowNode) => FlowNodeKindDef
	/** Вид связи */
	edgeKind: (edge: FlowEdge) => FlowEdgeKindDef
	/** Вид группы */
	groupKind: (group: FlowGroup) => FlowGroupKindDef
	/** Раскладка: рамки узлов и групп, px холста */
	layout: Readonly<ShallowRef<FlowLayoutResult>>
	/** Маршруты связей */
	routes: Readonly<ShallowRef<Record<string, FlowRoute>>>
	/** Проверка карты по нотации */
	issues: ComputedRef<FlowDataIssue[]>
	/** Выделение */
	selection: Readonly<Ref<string[]>>
	/** Подсвеченные элементы: путь, наведение, шаг сценария */
	highlighted: Readonly<Ref<ReadonlySet<string>>>
	/** Живые данные (проп `live` и `setLive`) */
	live: Readonly<Ref<FlowLiveState>>
	/** Режим */
	mode: ComputedRef<FlowMode>
	/** История */
	history: CommandHistory<FlowChange>
	/** Хуки (проп-хуки — приоритет 0) */
	hooks: HookRunner<FlowHooks>
	/** Сценарий */
	scenario: FlowScenarioDriver
	/** Выполнить команду: правила → хуки → применение (в «Правках» — в черновик предложения) → история → `update:data`, `change` */
	execute: (command: FlowCommand) => Promise<FlowCommandResult>
	/** Черновик предложения режима «Правки»: команды копят изменения сюда */
	draft: Readonly<Ref<FlowSuggestion | null>>
	/** Контроллер: методы вида — через `setView` */
	controller: FlowMapController
	/** Подключить вид */
	setView: (adapter: FlowViewAdapter) => void
}

/** Контекст карты для частей интерфейса 2D */
export interface FlowMapContext {
	/** Модель */
	model: FlowModel
	/** Видимая область */
	viewport: Readonly<Ref<FlowViewport>>
	/** Размер области на экране */
	frame: Readonly<Ref<FlowSize>>
	/** Компактный вид: ширина области меньше `compactBreakpoint` (один признак для ядра и панелей) */
	isCompact: Readonly<Ref<boolean>>
	/** Задать видимую область */
	setViewport: (viewport: FlowViewport, options?: { isAnimated?: boolean }) => void
	/** Элемент в фокусе клавиатуры */
	focused: Readonly<Ref<string | null>>
	/** Элемент под указателем */
	hovered: Readonly<Ref<string | null>>
	/** Открытые подробности */
	details: Readonly<Ref<FlowElementRef | null>>
	/** Открыть или закрыть подробности */
	openDetails: (target: FlowElementRef | null) => void
	/** Движение выключено */
	isReducedMotion: Readonly<Ref<boolean>>
	/** Карта видна и вкладка активна */
	isVisible: Readonly<Ref<boolean>>
	/** Сообщить в live-регион */
	announce: (text: string) => void
}
