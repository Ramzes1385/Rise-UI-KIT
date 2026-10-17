import type { FlowElementRef } from '../data/flowReview.types'
import type { FlowGraph, FlowLayoutAlgorithm } from './flowLayout.types'
import type { FlowScenario, FlowScenarioChoices, FlowStepEffect } from '../data/flowScenario.types'
import type {
	FlowEdgeRouting,
	FlowGroup,
	FlowLayoutSettings,
	FlowMapData,
	FlowNode,
	FlowPort,
	FlowSize,
	FlowStatus,
	FlowTraffic,
	FlowValue,
} from '../data/flowData.types'

/** Встроенные фигуры узлов; свою даёт `FlowShapeDef.path` */
export const FLOW_SHAPES = [
	'rect',
	'round-rect',
	'pill',
	'ellipse',
	'circle',
	'diamond',
	'hexagon',
	'parallelogram',
	'cylinder',
	'document',
	'person',
	'note',
	'open-rect',
	'parallel-lines',
	'path',
] as const

/** Фигура узла */
export type FlowShape = (typeof FLOW_SHAPES)[number]

/** Как отрисовывается узел: html — карточка из компонентов кита (сервисы, C4), svg — фигура нотации (BPMN, IDEF, DFD) */
export type FlowNodeRender = 'html' | 'svg'

/** Знак внутри фигуры: конверт BPMN-сообщения, «+» параллельного шлюза, номер IDEF0 */
export interface FlowShapeMarker {
	/** Путь SVG в квадрате 24 × 24 или имя BaseIcon (`icon`) */
	path?: string
	/** Значок BaseIcon */
	icon?: string
	/** Текст (номер, буква соединения IDEF3 «&», «X», «O») */
	text?: string
	/** Где: center, top-start, top-end, bottom-center, bottom-start, bottom-end */
	placement: 'center' | 'top-start' | 'top-end' | 'bottom-center' | 'bottom-start' | 'bottom-end'
	/** Залит (бросающее событие BPMN) */
	isFilled?: boolean
}

/** Фигура вида узла */
export interface FlowShapeDef {
	/** Фигура */
	shape: FlowShape
	/** Свой контур для `path`: путь SVG по размеру узла */
	path?: (size: FlowSize) => string
	/** Ободок: double — промежуточное событие BPMN, thick — конечное, dashed — неуправляемое */
	ring?: 'single' | 'double' | 'thick' | 'dashed'
	/** Заливка — токен: `var(--rise-flow-epc-event)` */
	fill?: string
	/** Обводка — токен */
	stroke?: string
	/** Цвет текста — токен (C4: светлый текст на тёмной заливке) */
	text?: string
	/** Знаки внутри — по данным узла (тип задачи, маркер события) */
	markers?: (node: FlowNode) => FlowShapeMarker[]
}

/** Описание поля `props` вида — панель свойств «Правки» и проверка данных */
export interface FlowPropDef {
	/** Подпись поля (функция — читает словарь в момент показа) */
	label: () => string
	/** Тип поля: text, number, boolean, select, color */
	type: 'text' | 'number' | 'boolean' | 'select' | 'color'
	/** Варианты для select */
	options?: { value: string; label: () => string }[]
	/** Значение по умолчанию */
	default?: FlowValue
}

/** Вид узла нотации */
export interface FlowNodeKindDef {
	/** Название вида: «Исключающий шлюз»; скринридер слышит его как роль узла */
	label: () => string
	/** Отрисовка */
	render: FlowNodeRender
	/** Фигура (для svg) и оформление карточки (для html — только `fill`, `stroke`, `text`) */
	shape: FlowShapeDef
	/** Размер по умолчанию */
	size: FlowSize
	/** Подпись: inside — внутри, below — под фигурой (события и шлюзы BPMN), none — без подписи */
	labelPlacement?: 'inside' | 'below' | 'none'
	/** Значок по умолчанию — имя BaseIcon */
	icon?: string
	/** Порты по умолчанию */
	ports?: FlowPort[]
	/** Вид — контейнер (подпроцесс, система C4): может содержать узлы как группа */
	isContainer?: boolean
	/** Узлы вида — внешние системы (`FlowNode.isExternal` по умолчанию) */
	isExternal?: boolean
	/** Поля `props` */
	props?: Record<string, FlowPropDef>
	/** Модель 3D по умолчанию — id встроенной модели (`server`, `db`, `gateway`, `cloud`… — таблица 6.1 контракта 3D) или `auto` (по ключевым словам); выбор — правило 6.2 контракта 3D */
	model3d?: string
	/** Раздел палитры «Правки»; без него вида нет в палитре */
	paletteGroup?: string
}

/** Вид связи нотации */
export interface FlowEdgeKindDef {
	/** Название: «Поток управления», «Поток сообщений» */
	label: () => string
	/** Штрих: solid, dashed, dotted — различие не только цветом */
	stroke: 'solid' | 'dashed' | 'dotted'
	/** Начало линии: none, circle (сообщение BPMN), diamond, slash (поток по умолчанию) */
	startMarker?: 'none' | 'circle' | 'diamond' | 'slash'
	/** Конец линии: arrow — залитая стрелка, open-arrow — открытая, double-arrow — двойная (поток объектов IDEF3), none */
	endMarker?: 'arrow' | 'open-arrow' | 'double-arrow' | 'none'
	/** Цвет — токен; по умолчанию `--rise-flow-map-edge-border` */
	color?: string
	/** Вид линии по умолчанию */
	routing?: FlowEdgeRouting
	/** Частицы по умолчанию; без них — без частиц */
	traffic?: FlowTraffic
	/** Эффект шага сценария */
	effect?: FlowStepEffect
}

/** Вид группы нотации */
export interface FlowGroupKindDef {
	/** Название: «Пул», «Дорожка», «Граница системы» */
	label: () => string
	/**
	 * Как раскладка обращается с группой: band — полоса вдоль потока через все слои (дорожки BPMN),
	 * tier — ярус поперёк потока, узлы группы в одном ряду (слои архитектуры карты сервисов), box — рамка вокруг содержимого
	 */
	layout: 'band' | 'tier' | 'box'
	/** Заголовок: start — сбоку (дорожки BPMN, вертикальный текст), top — сверху */
	header?: 'start' | 'top'
	/** Рамка: solid, dashed (граница C4) */
	border?: 'solid' | 'dashed'
}

/** Результат правила: true — можно; объект — нельзя, `message` — причина для подсказки и озвучки */
export type FlowRuleResult = true | { code: string; message: string }

/** Что соединяется */
export interface FlowConnectContext {
	/** Узел-источник */
	source: FlowNode
	/** Узел-приёмник */
	target: FlowNode
	/** Порт источника */
	sourcePort?: FlowPort
	/** Порт приёмника */
	targetPort?: FlowPort
	/** Вид связи */
	kind: string
	/** Данные карты до соединения */
	data: FlowMapData
	/** Граф карты */
	graph: FlowGraph
}

/** Декларативное правило связи: из каких видов в какие можно провести связь вида `edge` */
export interface FlowConnectionRule {
	/** Вид связи */
	edge: string
	/** Виды источника; `*` — любой */
	from: string[]
	/** Виды приёмника; `*` — любой */
	to: string[]
	/** Только между разными пулами (поток сообщений BPMN) или только внутри одного (поток управления) */
	pools?: 'same' | 'different'
}

/** Ошибка или предупреждение проверки данных */
export interface FlowDataIssue {
	/** Уровень */
	level: 'error' | 'warning'
	/** Код: `duplicate-id`, `missing-node`, `bpmn-start-incoming`… */
	code: string
	/** Текст из словаря */
	message: string
	/** Элемент */
	target?: FlowElementRef
}

/** Правила нотации */
export interface FlowNotationRules {
	/** Таблица допустимых связей; связь вне таблицы — отказ с причиной */
	connections?: FlowConnectionRule[]
	/** Дополнительная проверка соединения (например, ICOM-роли IDEF0) */
	canConnect?: (context: FlowConnectContext) => FlowRuleResult
	/** Можно ли положить узел в группу */
	canContain?: (group: FlowGroup | null, node: FlowNode) => FlowRuleResult
	/** Проверка всей карты (стартовое событие без входящих, чередование событий и функций EPC…) */
	validate?: (data: FlowMapData, graph: FlowGraph) => FlowDataIssue[]
}

/** Поведение токена на узле вида: all — делится на все выходы или ждёт все входы, one — один выход, some — выходы с истинным условием */
export interface FlowGatewaySemantics {
	/** Выход */
	split: 'all' | 'one' | 'some'
	/** Вход */
	join: 'all' | 'one' | 'some'
}

/** Анимационная семантика нотации */
export interface FlowNotationSemantics {
	/** Шлюзы и соединения: вид узла → поведение токена */
	gateways?: Record<string, FlowGatewaySemantics>
	/** Сценарий по модели (обход токеном от стартовых узлов), когда в данных нет своего; null — нотация не умеет */
	simulate?: (graph: FlowGraph, choices: FlowScenarioChoices) => FlowScenario | null
}

/** Строка легенды */
export interface FlowLegendItem {
	/** Id строки */
	id: string
	/** Подпись */
	label: string
	/** Образец: узел вида, связь вида или статус */
	sample: { entity: 'node' | 'edge'; kind: string } | { status: FlowStatus }
}

/** Пакет нотации: виды, фигуры, правила, раскладка, семантика, легенда */
export interface FlowNotation {
	/** Id: `services`, `bpmn`, `idef0`, `idef3`, `dfd`, `epc`, `sequence`, `c4`, `event-storming` или свой */
	id: string
	/** Название: «BPMN 2.0» */
	label: () => string
	/** Стандарт и версия — подсказка: «OMG BPMN 2.0.2 (ISO/IEC 19510)» */
	standard?: string
	/** Виды узлов */
	nodeKinds: Record<string, FlowNodeKindDef>
	/** Виды связей */
	edgeKinds: Record<string, FlowEdgeKindDef>
	/** Виды групп */
	groupKinds?: Record<string, FlowGroupKindDef>
	/** Вид узла по умолчанию (палитра, импорт без `kind`) */
	defaultNodeKind: string
	/** Вид связи по умолчанию */
	defaultEdgeKind: string
	/** Раскладка по умолчанию: алгоритм и параметры */
	layout?: FlowLayoutSettings
	/** Правила */
	rules?: FlowNotationRules
	/** Анимационная семантика */
	semantics?: FlowNotationSemantics
	/** Правила словами — строка панели проверки «Правки»: «сервисы вызывают кеш и базы; клиенты — только через шлюз» */
	rulesSummary?: () => string
	/** Легенда; без неё — по видам, которые есть на карте */
	legend?: (data: FlowMapData) => FlowLegendItem[]
	/** Раскладки нотации (`idef0-staircase`…): регистрируются вместе с нотацией */
	layouts?: FlowLayoutAlgorithm[]
	/** Смысловой зум: при масштабе меньше `minZoom` группы и контейнеры глубже `depth` свёрнуты (C4: контекст → контейнеры → компоненты) */
	semanticZoom?: { minZoom: number; depth: number }[]
	/** Варианты оформления нотации: DFD — `gane-sarson` и `yourdon-demarco`; выбор — `FlowLayoutSettings.options.style` */
	styles?: Record<string, { label: () => string; nodeKinds: Record<string, Partial<FlowNodeKindDef>> }>
}
