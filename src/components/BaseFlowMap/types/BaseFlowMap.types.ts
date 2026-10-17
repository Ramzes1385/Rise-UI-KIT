import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { FlowScenarioAction, FlowScenarioChoices, FlowScenarioState } from './data/flowScenario.types'
import type { FlowDataIssue, FlowLegendItem, FlowNodeKindDef, FlowNotation } from './api/flowNotation.types'
import type { FlowAuthor, FlowCommentThread, FlowElementRef, FlowSuggestion, FlowVersion } from './data/flowReview.types'
import type { FlowEdge, FlowGroup, FlowLayoutSettings, FlowMapData, FlowMetric, FlowNode, FlowStatus } from './data/flowData.types'
import type {
	FlowChangeEvent,
	FlowCommentEvent,
	FlowElementEvent,
	FlowErrorEvent,
	FlowHistoryState,
	FlowHooks,
	FlowLiveState,
	FlowMapController,
	FlowMapPlugin,
	FlowMode,
	FlowMoveEvent,
	FlowRejectEvent,
	FlowViewport,
} from './api/flowController.types'

/** Варианты оформления */
export const FLOW_MAP_VARIANTS = ['default', 'outline', 'ghost'] as const

/** Части карты для `ui` и `customClass` */
export const FLOW_MAP_PARTS = [
	'root',
	'header',
	'toolbar',
	'viewport',
	'canvas',
	'node',
	'edge',
	'group',
	'label',
	'minimap',
	'legend',
	'scenario',
	'details',
	'list',
	'palette',
	'inspector',
	'review',
] as const

/** Панели: toolbar — инструменты, search — «Найти узел», minimap, legend, scenario, details, list — видимый список узлов и связей */
export const FLOW_MAP_PANELS = ['toolbar', 'search', 'minimap', 'legend', 'scenario', 'details', 'list'] as const

/** Колесо мыши: ctrl — масштаб с Ctrl/⌘ (по умолчанию, страница прокручивается), always — всегда, none — нет */
export const FLOW_MAP_WHEEL_MODES = ['ctrl', 'always', 'none'] as const

/** Вариант оформления */
export type FlowMapVariant = (typeof FLOW_MAP_VARIANTS)[number]

/** Часть карты */
export type BaseFlowMapPart = (typeof FLOW_MAP_PARTS)[number]

/** Панель карты */
export type FlowMapPanel = (typeof FLOW_MAP_PANELS)[number]

/** Режим колеса мыши */
export type FlowMapWheelMode = (typeof FLOW_MAP_WHEEL_MODES)[number]

/** Пропсы BaseFlowMap */
export interface BaseFlowMapProps extends BaseComponentProps<FlowMapVariant, BaseFlowMapPart>, Partial<FlowHooks> {
	/** Данные карты (`v-model:data` в режиме «Правка») */
	data: FlowMapData
	/** Нотации, кроме встроенной `services`: `[flowBpmn, flowIdef0]`; всему приложению — `defaults.BaseFlowMap.notations` */
	notations?: FlowNotation[]
	/** Плагины */
	plugins?: FlowMapPlugin[]
	/** Режим (`v-model:mode`) */
	mode?: FlowMode
	/** Режимы в переключателе шапки; пусто — переключателя нет */
	modes?: FlowMode[]
	/** Выделение (`v-model:selection`) */
	selection?: string[]
	/** Раскладка поверх `data.layout` */
	layout?: FlowLayoutSettings
	/** Активный сценарий; смена — событие `scenario-change` */
	scenario?: string | null
	/** Запускать сценарий сам (при reduced motion — нет) */
	isAutoplay?: boolean
	/** Выбор веток сценария */
	choices?: FlowScenarioChoices
	/** Живые данные */
	live?: FlowLiveState
	/** Частицы: false — выключить; число — предел частиц на карте (по умолчанию 400) */
	particles?: boolean | number
	/** Предложения правок (`v-model:suggestions`) */
	suggestions?: FlowSuggestion[]
	/** Комментарии (`v-model:comments`) */
	comments?: FlowCommentThread[]
	/** Версии для сравнения «было / стало» */
	versions?: FlowVersion[]
	/** С какой версией сравнивать (`FlowVersion.id`); null — без сравнения */
	compareWith?: string | null
	/** Текущий пользователь — автор предложений и комментариев */
	currentUser?: FlowAuthor
	/** Когда приложение сохранило данные: «Черновик сохранён …» и счётчик изменений в «Правке» */
	savedAt?: Date | string | number
	/** Ширина, px, меньше которой карта компактна: плитки, панели снизу, в «Правке» — только свойства и комментарии; по умолчанию 640 */
	compactBreakpoint?: number
	/** Видимые панели; по умолчанию toolbar, minimap, legend, scenario, details */
	panels?: FlowMapPanel[]
	/** Подпись области для скринридера; без неё — `data.title` */
	ariaLabel?: string
	/** Высота области: CSS-длина; по умолчанию 560px */
	height?: string
	/** Колесо мыши */
	wheelZoom?: FlowMapWheelMode
	/** Пределы масштаба */
	minZoom?: number
	/** Верхний предел масштаба */
	maxZoom?: number
	/** Загрузка: скелетон */
	isLoading?: boolean
	/** Отключена: без выбора и правки */
	isDisabled?: boolean
	/** Текст ошибки загрузки; есть — карта показывает BaseResult с ним */
	error?: string
	/** Классы частей */
	ui?: UiProp<BaseFlowMapPart>
}

/** События BaseFlowMap: 18 сигнатур (предел vue-tsc — 22, у BaseFlowMap3D ещё 4), однотипные — объединением; данные — `FlowEventMap` */
export interface BaseFlowMapEmits {
	(event: 'update:data', value: FlowMapData): void
	(event: 'update:mode', value: FlowMode): void
	(event: 'update:selection', value: string[]): void
	(event: 'update:suggestions', value: FlowSuggestion[]): void
	(event: 'update:comments', value: FlowCommentThread[]): void
	(event: 'change', value: FlowChangeEvent): void
	(event: 'reject', value: FlowRejectEvent): void
	(
		event:
			| 'node-click'
			| 'node-dblclick'
			| 'node-contextmenu'
			| 'node-enter'
			| 'node-leave'
			| 'edge-click'
			| 'edge-dblclick'
			| 'edge-contextmenu'
			| 'edge-enter'
			| 'edge-leave'
			| 'group-click'
			| 'group-contextmenu',
		value: FlowElementEvent,
	): void
	(event: 'node-move', value: FlowMoveEvent): void
	(event: 'focus-change', value: FlowElementRef | null): void
	(event: 'viewport-change', value: FlowViewport): void
	(event: 'scenario-change' | 'scenario-step', value: FlowScenarioState): void
	(event: 'history-change', value: FlowHistoryState): void
	(event: 'validate', value: FlowDataIssue[]): void
	(event: 'accept' | 'decline', value: FlowSuggestion): void
	(event: 'comment', value: FlowCommentEvent): void
	(event: 'ready', value: FlowMapController): void
	(event: 'error', value: FlowErrorEvent): void
}

/** Данные слота узла */
export interface FlowNodeSlotProps {
	/** Узел */
	node: FlowNode
	/** Вид нотации */
	kind: FlowNodeKindDef
	/** Живой статус (поверх `node.status`) */
	status?: FlowStatus
	/** Живые метрики */
	metrics: FlowMetric[]
	/** Выделен */
	isSelected: boolean
	/** В фокусе клавиатуры */
	isFocused: boolean
	/** Работает в текущем шаге сценария */
	isActive: boolean
	/** Масштаб — для смыслового зума содержимого */
	zoom: number
}

/** Слоты BaseFlowMap */
export interface BaseFlowMapSlots {
	/** Содержимое HTML-узла (render: 'html'); без слота — карточка кита */
	node?: (props: FlowNodeSlotProps) => unknown
	/** Подпись связи */
	'edge-label'?: (props: { edge: FlowEdge; isActive: boolean }) => unknown
	/** Заголовок группы */
	'group-label'?: (props: { group: FlowGroup }) => unknown
	/** Подсказка при наведении и фокусе */
	tooltip?: (props: { target: FlowElementRef; node?: FlowNode; edge?: FlowEdge }) => unknown
	/** Панель подробностей выбранного элемента */
	details?: (props: { target: FlowElementRef; node?: FlowNode; edge?: FlowEdge; close: () => void }) => unknown
	/** Кнопки в конце панели инструментов */
	toolbar?: (props: { controller: FlowMapController }) => unknown
	/** Своя легенда */
	legend?: (props: { items: FlowLegendItem[] }) => unknown
	/** Строка шага в панели сценария */
	'scenario-step'?: (props: { step: FlowScenarioAction; index: number; isActive: boolean; isDone: boolean }) => unknown
	/** Конец панели свойств «Правки» (раздел «3D» у BaseFlowMap3D, свои поля приложения) */
	'inspector-end'?: (props: { target: FlowElementRef; controller: FlowMapController }) => unknown
	/** Пустая карта */
	empty?: () => unknown
}

/** Методы ref — контроллер */
export type BaseFlowMapExpose = FlowMapController
