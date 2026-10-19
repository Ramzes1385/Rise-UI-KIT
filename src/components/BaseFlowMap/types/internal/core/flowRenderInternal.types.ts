import type { ComputedRef, Ref } from 'vue'
import type { UiClassFn } from '@composables/base/useUi'
import type { FlowGroupState } from '../flowGroups.types'
import type { FlowEventBus } from './flowModelCore.types'
import type { FlowRoute } from '../../api/flowLayout.types'
import type { BaseFlowMapPart } from '../../BaseFlowMap.types'
import type { FlowElementRef } from '../../data/flowReview.types'
import type { FlowMapContext, FlowModel } from '../flowModel.types'
import type { FlowEdgeKindDef, FlowNodeKindDef } from '../../api/flowNotation.types'
import type { FlowMapController, FlowMode, FlowViewport } from '../../api/flowController.types'
import type { FlowEdge, FlowGroup, FlowMetric, FlowNode, FlowPoint, FlowRect, FlowSize } from '../../data/flowData.types'

/** Классы частей карты */
type FlowUiClass = UiClassFn<Exclude<BaseFlowMapPart, 'root'>>

/** Модель с шиной событий: её видят части интерфейса, снаружи — `FlowModel` */
export interface FlowModelInternal extends FlowModel {
	/** Шина событий */
	events: FlowEventBus
	/** Свёрнутость групп и уровень смыслового зума */
	groups: FlowGroupState
}

/** Пределы масштаба */
export interface FlowZoomLimits {
	/** Наименьший */
	min: number
	/** Наибольший */
	max: number
}

/** Статус для показа: подпись, значок, цвет */
export interface FlowStatusView {
	/** Id статуса */
	id: string
	/** Подпись */
	label: string
	/** Значок BaseIcon */
	icon: string
	/** Цвет: токен или CSS-цвет своего статуса */
	color: string
}

/** Узел, готовый к отрисовке */
export interface FlowNodeItem {
	/** Id */
	id: string
	/** Данные узла */
	node: FlowNode
	/** Вид нотации */
	kind: FlowNodeKindDef
	/** Рамка на холсте */
	rect: FlowRect
	/** Название вида: роль для скринридера */
	kindLabel: string
	/** Описание для скринридера */
	ariaLabel: string
	/** Имя значка BaseIcon; нет встроенной глифы */
	icon: string | null
	/** Контур встроенной глифы 16 × 16 */
	glyph: string | null
	/** Контур фигуры */
	shape: FlowShapeView
	/** Статус */
	status: FlowStatusView | null
	/** Метрики (живые поверх данных) */
	metrics: FlowMetric[]
	/** Выделен */
	isSelected: boolean
	/** В фокусе */
	isFocused: boolean
	/** Подсвечен: путь, наведение, шаг сценария */
	isHighlighted: boolean
	/** Приглушён: на карте есть подсветка, а узла в ней нет */
	isDim: boolean
	/** Внешняя система */
	isExternal: boolean
	/** Плитка compact */
	isCompact: boolean
	/** Значение `tabindex` */
	tabIndex: 0 | -1
	/** Имя кнопки «Развернуть <группа>»; null — узел не блок свёрнутой группы */
	expandLabel: string | null
}

/** Связь, готовая к отрисовке */
export interface FlowEdgeItem {
	/** Id */
	id: string
	/** Данные связи */
	edge: FlowEdge
	/** Вид нотации */
	kind: FlowEdgeKindDef
	/** Маршрут */
	route: FlowRoute
	/** Id маркера в начале (без префикса карты) */
	markerStart: string | null
	/** Id маркера в конце (без префикса карты) */
	markerEnd: string | null
	/** Цвет линии из `color` вида; без него — токен карты */
	color: string | undefined
	/** Статус */
	status: FlowStatusView | null
	/** Выделена */
	isSelected: boolean
	/** Подсвечена */
	isHighlighted: boolean
	/** Приглушена */
	isDim: boolean
	/** Описание для скринридера */
	ariaLabel: string
	/** Значение `tabindex` */
	tabIndex: -1
}

/** Группа, готовая к отрисовке */
export interface FlowGroupItem {
	/** Id */
	id: string
	/** Данные группы */
	group: FlowGroup
	/** Рамка */
	rect: FlowRect
	/** Название вида */
	kindLabel: string
	/** Полоса, ярус или рамка */
	layout: 'band' | 'tier' | 'box'
	/** Где заголовок */
	header: 'start' | 'top'
	/** Рамка */
	border: 'solid' | 'dashed'
	/** Глубина вложенности: порядок наложения */
	depth: number
	/** Имя кнопки-шеврона «Свернуть <группа>» */
	collapseLabel: string
}

/** Подпись связи на холсте */
export interface FlowLabelItem {
	/** Id связи */
	id: string
	/** Данные связи */
	edge: FlowEdge
	/** Текст */
	text: string
	/** Центр подписи */
	point: FlowPoint
	/** Подсвечена */
	isHighlighted: boolean
	/** Приглушена */
	isDim: boolean
}

/** Маркер связи в `defs` */
export interface FlowMarkerDef {
	/** Id (без префикса карты) */
	id: string
	/** Контуры в квадрате 10 × 10 */
	paths: string[]
	/** Залит */
	isFilled: boolean
	/** Опорная точка по X */
	refX: number
}

/** Построитель контура фигуры по размеру узла */
export type FlowShapeBuilder = (size: FlowSize) => FlowShapeView

/** Цвета выгруженной картинки */
export type FlowExportPalette = Record<'bg' | 'node' | 'border' | 'text' | 'muted', string>

/** Вид события элемента: `<сущность>-<вид>` */
export type FlowElementEventKind = 'click' | 'dblclick' | 'contextmenu' | 'enter' | 'leave'

/** Пределы и якорь масштабирования */
export interface FlowZoomStep {
	/** Во сколько раз */
	factor: number
	/** Точка, которая остаётся на месте, px экрана */
	anchor: FlowPoint
}

/** Контур фигуры узла в локальных координатах */
export interface FlowShapeView {
	/** Внешний контур */
	path: string
	/** Линии внутри (цилиндр, документ, голова человека) */
	inner: string | null
}

/** Видимая область и размер кадра: общее для модели раскладки и вида */
export interface FlowFrameState {
	/** Размер кадра */
	frame: Ref<FlowSize>
	/** Компактный вид */
	isCompact: ComputedRef<boolean>
	/** Элемент области вида */
	element: Ref<HTMLElement | null>
	/** Подключить элемент и следить за размером: подходит для `:ref` */
	attach: (element: unknown) => void
}

/** Вид: видимая область и методы */
export interface FlowViewState {
	/** Видимая область */
	viewport: Ref<FlowViewport>
	/** Идёт анимированный переход */
	isAnimating: Ref<boolean>
	/** Задать видимую область */
	setViewport: FlowMapContext['setViewport']
	/** Вписать */
	fit: (padding?: number) => void
	/** Масштаб на шаг к центру */
	zoomBy: (factor: number) => void
	/** Показать подсказку про колесо */
	hint: Ref<boolean>
	/** Пределы масштаба */
	limits: () => FlowZoomLimits
	/** Показать прямоугольник, если он за краем: сдвиг без смены масштаба */
	reveal: (rect: FlowRect) => void
	/** Масштаб в процентах */
	percent: ComputedRef<number>
}

/** Обработчики жестов области вида */
export interface FlowGestureHandlers {
	/** Нажатие */
	onPointerdown: (event: PointerEvent) => void
	/** Движение */
	onPointermove: (event: PointerEvent) => void
	/** Отпускание */
	onPointerup: (event: PointerEvent) => void
	/** Отмена */
	onPointercancel: (event: PointerEvent) => void
	/** Колесо */
	onWheel: (event: WheelEvent) => void
}

/** Откуда списки отрисовки берут данные */
export interface FlowRenderSource {
	/** Модель */
	model: FlowModelInternal
	/** Контекст карты */
	map: FlowMapContext
	/** Подсвеченные элементы с учётом наведения; null — подсветки нет */
	active: ComputedRef<ReadonlySet<string> | null>
	/** Значение tabindex узла */
	tabIndexOf: (id: string) => 0 | -1
}

/** Направление стрелки */
export type FlowArrowDirection = 'left' | 'right' | 'up' | 'down'

/** Что даёт `useFlowFocus` */
export interface FlowFocusApi {
	/** Элемент в фокусе */
	focused: Ref<string | null>
	/** Значение tabindex для узла */
	tabIndexOf: (id: string) => 0 | -1
	/** Клавиши области вида */
	onKeydown: (event: KeyboardEvent) => void
	/** Перевести фокус на элемент */
	move: (id: string | null) => void
	/** Фокус вошёл в элемент */
	onFocusin: (event: FocusEvent) => void
	/** Фокус ушёл из области */
	onFocusout: (event: FocusEvent) => void
}

/** Отрисовка: подготовленные списки и обработчики для частей холста */
export interface FlowCanvasContext {
	/** Контекст карты */
	map: FlowMapContext
	/** Шина событий */
	events: FlowEventBus
	/** Классы частей */
	ui: FlowUiClass
	/** Вид */
	view: FlowViewState
	/** Идёт анимированный переход */
	isAnimating: Ref<boolean>
	/** Показать подсказку про колесо */
	hint: Ref<boolean>
	/** Масштаб */
	zoom: ComputedRef<number>
	/** Фокус */
	focus: FlowFocusApi
	/** Жесты */
	gestures: FlowGestureHandlers
	/** Подключить область вида: подходит для `:ref` */
	attach: (element: unknown) => void
	/** Узлы */
	nodes: ComputedRef<FlowNodeItem[]>
	/** Связи */
	edges: ComputedRef<FlowEdgeItem[]>
	/** Группы */
	groups: ComputedRef<FlowGroupItem[]>
	/** Подписи связей */
	labels: ComputedRef<FlowLabelItem[]>
	/** Маркеры в `defs` */
	markers: ComputedRef<FlowMarkerDef[]>
	/** Размер сцены, px */
	size: ComputedRef<FlowSize>
	/** Узлы с отрисовкой HTML */
	htmlNodes: ComputedRef<FlowNodeItem[]>
	/** Узлы с отрисовкой SVG */
	svgNodes: ComputedRef<FlowNodeItem[]>
	/** Снимок для выгрузки картинки */
	scene: () => FlowExportScene
	/** Префикс id маркеров этой карты */
	uid: string
	/** Подпись холста для скринридера */
	label: ComputedRef<string>
	/** Выбор, наведение, двойной щелчок и меню */
	pick: FlowPickApi
	/** Стиль сцены: сдвиг и масштаб */
	sceneStyle: ComputedRef<Record<string, string>>
	/** Показывать подписи связей */
	hasLabels: ComputedRef<boolean>
	/** Свернуть или развернуть группу (блок свёрнутой группы — это её id) */
	toggleGroup: (id: string) => void
}

/** Кнопка переключателя режимов шапки */
export interface FlowModeItem {
	/** Режим */
	value: FlowMode
	/** Подпись */
	label: string
	/** Активен */
	isActive: boolean
}

/** Шапка, панель инструментов и поиск: состояние и действия */
export interface FlowChromeContext {
	/** Компактный вид */
	isCompact: Ref<boolean>
	/** Контроллер: слот `toolbar` */
	controller: FlowMapController
	/** Классы частей */
	ui: FlowUiClass
	/** Показать шапку */
	hasHeader: ComputedRef<boolean>
	/** Показать панель инструментов */
	hasToolbar: ComputedRef<boolean>
	/** Показать поиск */
	hasSearch: ComputedRef<boolean>
	/** Показать видимый список */
	hasList: ComputedRef<boolean>
	/** Показать мини-карту */
	hasMinimap: ComputedRef<boolean>
	/** Показать легенду */
	hasLegend: ComputedRef<boolean>
	/** Показать панель сценария */
	hasScenario: ComputedRef<boolean>
	/** Показать подробности */
	hasDetails: ComputedRef<boolean>
	/** Название карты */
	title: ComputedRef<string | undefined>
	/** Режимы переключателя */
	modes: ComputedRef<FlowModeItem[]>
	/** Переключить режим */
	setMode: (mode: FlowMode) => void
	/** Масштаб, % */
	percent: ComputedRef<number>
	/** Увеличить */
	zoomIn: () => void
	/** Уменьшить */
	zoomOut: () => void
	/** Вписать */
	fit: () => void
	/** Запрос поиска */
	query: Ref<string>
	/** Результаты поиска */
	results: ComputedRef<{ id: string; title: string; description?: string; icon?: string }[]>
	/** Выбрать найденный узел */
	choose: (id: string) => void
	/** Карта пуста */
	isEmpty: ComputedRef<boolean>
}

/** Что нужно сборщику контекста карты */
export interface FlowContextParts {
	/** Модель */
	model: FlowModelInternal
	/** Размер кадра */
	frame: FlowFrameState
	/** Вид */
	view: FlowViewState
	/** Элемент в фокусе */
	focused: Ref<string | null>
	/** Элемент под указателем */
	hovered: Ref<string | null>
	/** Окружение */
	environment: {
		/** Движение выключено */
		isReducedMotion: Ref<boolean>
		/** Карта видна */
		isVisible: Ref<boolean>
		/** Озвучка */
		announce: (text: string) => void
	}
}

/** Действия над элементом: выбор, снятие выбора, наведение, двойной щелчок, меню */
export interface FlowPickApi {
	/** Выбрать элемент (с Shift, Ctrl или ⌘ — переключить), открыть подробности */
	pick: (target: FlowElementRef, event?: MouseEvent) => void
	/** Снять выбор и закрыть подробности */
	clear: () => void
	/** Наведение; null — указатель ушёл */
	hover: (target: FlowElementRef | null, event?: PointerEvent) => void
	/** Двойной щелчок */
	open: (target: FlowElementRef, event?: MouseEvent) => void
	/** Контекстное меню */
	menu: (target: FlowElementRef, event: MouseEvent) => void
}

/** Что нужно выгрузке картинки: готовые списки, размеры и корень для чтения токенов */
export interface FlowExportScene {
	/** Узлы */
	nodes: FlowNodeItem[]
	/** Связи */
	edges: FlowEdgeItem[]
	/** Группы */
	groups: FlowGroupItem[]
	/** Подписи связей */
	labels: FlowLabelItem[]
	/** Маркеры */
	markers: FlowMarkerDef[]
	/** Содержимое */
	bounds: FlowRect
	/** Видимая область */
	viewport: FlowViewport
	/** Размер кадра */
	frame: FlowSize
	/** Префикс id маркеров */
	uid: string
	/** Корень карты: токены темы */
	root: Element | null
}

/** Что нужно сборщику контекста отрисовки */
export interface FlowCanvasParts {
	/** Модель */
	model: FlowModelInternal
	/** Контекст карты */
	map: FlowMapContext
	/** Вид */
	view: FlowViewState
	/** Фокус */
	focus: FlowFocusApi
	/** Жесты */
	gestures: FlowGestureHandlers
	/** Размер кадра */
	frame: FlowFrameState
	/** Действия над элементом */
	pick: FlowPickApi
	/** Подсвеченные элементы с учётом наведения */
	active: ComputedRef<ReadonlySet<string> | null>
	/** Классы частей */
	ui: FlowUiClass
}
