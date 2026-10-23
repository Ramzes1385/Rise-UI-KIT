import type { FlowGraph, FlowLayoutAlgorithm, FlowRouter } from './flowLayout.types'
import type { FlowConnectContext, FlowDataIssue, FlowNotation } from './flowNotation.types'
import type { FlowScenario, FlowScenarioChoice, FlowScenarioState } from '../data/flowScenario.types'
import type { FlowChange, FlowChangeSource, FlowCommentThread, FlowElementRef, FlowEntity, FlowSuggestion } from '../data/flowReview.types'
import type {
	FlowEdge,
	FlowGroup,
	FlowLayoutSettings,
	FlowMapData,
	FlowMetric,
	FlowNode,
	FlowPoint,
	FlowStatus,
	FlowTraffic,
} from '../data/flowData.types'

/** Режимы: view — просмотр, edit — «Правка» (рисование и изменение), review — «Правки» (предложения, комментарии, версии) */
export const FLOW_MODES = ['view', 'edit', 'review'] as const

/** Режим карты */
export type FlowMode = (typeof FLOW_MODES)[number]

/** Ответ хука: false — отменить, true или ничего — продолжить, объект — продолжить с заменой (например, поправленная связь) */
export type FlowHookResult<T> = boolean | void | T | Promise<boolean | void | T>

/** Контекст изменения: что команда собирается сделать */
export interface FlowBeforeChangeContext {
	/** Изменения команды */
	changes: FlowChange[]
	/** Источник */
	source: FlowChangeSource
	/** Имя команды: `add-node`, `connect`, `move`, `update-label`, `delete`, `layout`, `paste`, `accept-proposal` */
	command: string
	/** Данные до изменения */
	data: FlowMapData
}

/** Что удаляется: выбранное и то, что уходит вместе с ним (связи удаляемых узлов, содержимое групп) */
export interface FlowDeleteContext {
	/** Узлы */
	nodes: FlowNode[]
	/** Связи */
	edges: FlowEdge[]
	/** Группы */
	groups: FlowGroup[]
	/** Источник */
	source: FlowChangeSource
}

/** Отменяемые хуки. Синхронные и асинхронные; несколько обработчиков — по приоритету, первый `false` отменяет */
export interface FlowHooks {
	/** Перед любым изменением данных — последний рубеж (права, блокировка элемента) */
	beforeChange: (context: FlowBeforeChangeContext) => FlowHookResult<FlowChange[]>
	/** Перед созданием узла, группы или сценария (палитра, вставка, контроллер); объект — созданный элемент с правками */
	beforeCreate: (context: {
		entity: FlowEntity
		value: FlowNode | FlowGroup | FlowScenario
		source: FlowChangeSource
	}) => FlowHookResult<FlowNode | FlowGroup | FlowScenario>
	/** Перед соединением — после правил нотации; объект — связь с правками (вид, подпись) */
	beforeConnect: (context: FlowConnectContext & { edge: FlowEdge }) => FlowHookResult<FlowEdge>
	/** Перед удалением; объект — удалить только часть */
	beforeDelete: (context: FlowDeleteContext) => FlowHookResult<Pick<FlowDeleteContext, 'nodes' | 'edges' | 'groups'>>
	/** Перед сохранением подписи, исправленной на месте; строка — заменить текст */
	beforeEditLabel: (context: { target: FlowElementRef; value: string; previous: string }) => FlowHookResult<string>
	/** Перед импортом JSON (после миграции и проверки); объект — импортировать исправленное */
	beforeImport: (context: { data: FlowMapData; issues: FlowDataIssue[] }) => FlowHookResult<FlowMapData>
	/** Перед принятием предложения правки */
	beforeAccept: (context: { suggestion: FlowSuggestion }) => FlowHookResult<FlowSuggestion>
	/** Выбор ветки сценария, если нет в `choices`: id ветки; ничего — ветка по умолчанию */
	resolveChoice: (context: { step: FlowScenarioChoice; scenario: FlowScenario }) => string | void | Promise<string | void>
}

/** Имя хука */
export type FlowHookName = keyof FlowHooks

/** Подписка на хук: обработчики с большим `priority` вызываются раньше; хук-проп — приоритет 0 */
export interface FlowHookOptions {
	/** Приоритет; по умолчанию 0 */
	priority?: number
}

/** Отказ: правило нотации, хук или предел (порт занят) */
export interface FlowRejectEvent {
	/** Команда */
	command: string
	/** Кто отказал: rule — правило нотации, hook — хук, limit — предел порта или режима */
	by: 'rule' | 'hook' | 'limit'
	/** Причина (озвучивается и показывается подсказкой) */
	message?: string
	/** Код правила */
	code?: string
}

/** Событие изменения данных */
export interface FlowChangeEvent {
	/** Изменения */
	changes: FlowChange[]
	/** Источник */
	source: FlowChangeSource
	/** Команда */
	command: string
	/** Данные после изменения */
	data: FlowMapData
}

/** Событие элемента: клик, двойной клик, контекстное меню, наведение */
export interface FlowElementEvent {
	/** Элемент */
	target: FlowElementRef
	/** Исходное событие DOM; нет — вызвано с клавиатуры или контроллером */
	event?: MouseEvent | KeyboardEvent | PointerEvent
}

/** Перемещение узлов — после команды `move` (мышь, клавиатура, контроллер) */
export interface FlowMoveEvent {
	/** Узлы */
	ids: string[]
	/** Новые позиции */
	positions: Record<string, FlowPoint>
	/** Новая группа (перенос в дорожку); undefined — группа не менялась */
	group?: string | null
	/** Источник */
	source: FlowChangeSource
}

/** Событие комментария */
export interface FlowCommentEvent {
	/** Цепочка после действия */
	thread: FlowCommentThread
	/** Действие */
	action: 'add' | 'reply' | 'resolve' | 'reopen'
}

/** Ошибка: загрузка, импорт, хук */
export interface FlowErrorEvent {
	/** Код: `invalid-data`, `version-unsupported`, `hook-failed`, `export-failed` */
	code: string
	/** Текст из словаря */
	message: string
}

/** Состояние истории */
export interface FlowHistoryState {
	/** Можно отменить */
	canUndo: boolean
	/** Можно повторить */
	canRedo: boolean
	/** Подпись шага для отмены: «Отменить: соединение Orders → Kafka» */
	undoLabel?: string
	/** Подпись шага для повтора */
	redoLabel?: string
}

/** Видимая область: сдвиг и масштаб */
export interface FlowViewport {
	/** Сдвиг X, px экрана */
	x: number
	/** Сдвиг Y, px экрана */
	y: number
	/** Масштаб, 1 — 100 % */
	zoom: number
}

/** Живые данные: статусы, метрики, трафик — не входят в документ и историю отмены (телеметрия приложения) */
export interface FlowLiveState {
	/** Узлы: id → поля */
	nodes?: Record<string, { status?: FlowStatus; metrics?: FlowMetric[]; badge?: string | number }>
	/** Связи: id → поля */
	edges?: Record<string, { status?: FlowStatus; metrics?: FlowMetric[]; traffic?: FlowTraffic }>
}

/** Уровень смыслового зума и вход в группы */
export interface FlowLevelState {
	/** Номер уровня с 0: 0 — самый крупный план, последний — всё развёрнуто */
	index: number
	/** Число уровней: записей `semanticZoom` плюс один; 0 — смыслового зума нет или он отключён */
	count: number
	/** Подпись текущего уровня */
	label: string
	/** Подписи всех уровней по порядку */
	labels: string[]
	/** Вход в группы: id групп от корня до текущей (крошки) */
	path: string[]
}

/** Параметры вписывания и фокуса */
export interface FlowFitOptions {
	/** Что вписать; по умолчанию всё */
	ids?: string[]
	/** Отступ, px экрана; по умолчанию 32 */
	padding?: number
	/** С анимацией (при reduced motion — всегда без) */
	isAnimated?: boolean
	/** Предельный масштаб */
	maxZoom?: number
}

/** Параметры экспорта картинки */
export interface FlowExportImageOptions {
	/** Что выгрузить: всё содержимое или видимую область */
	area?: 'content' | 'viewport'
	/** Плотность пикселей PNG; по умолчанию 2 */
	pixelRatio?: number
	/** Фон: токен темы или прозрачный */
	background?: 'theme' | 'transparent'
}

/** Привязка для панели «Хуки» в «Правке»: событие или хук и обработчик приложения */
export interface FlowBinding {
	/** Id привязки */
	id: string
	/** Имя события (`node-click`) или хука (`beforeConnect`) */
	name: string
	/** Хук отменяемый */
	isCancellable: boolean
	/** Имя функции-обработчика; анонимная — пустая строка */
	handler: string
	/** Включена: выключенную карта не вызывает (отладка в «Правке») */
	isEnabled: boolean
	/** Сколько раз вызвана */
	calls: number
	/** Последний итог: «отменено: клиент не вызывает кеш напрямую» */
	lastResult?: string
}

/** Результат команды */
export interface FlowCommandResult {
	/** Выполнена */
	isApplied: boolean
	/** Изменения (пусто, если отменена) */
	changes: FlowChange[]
	/** Отказ */
	reject?: FlowRejectEvent
}

/** Результат импорта */
export interface FlowImportResult extends FlowCommandResult {
	/** Найденное проверкой и миграцией */
	issues: FlowDataIssue[]
}

/** Управление картой: ref компонента (`defineExpose`) и `useFlowMap()`. Одинаково у BaseFlowMap и BaseFlowMap3D */
export interface FlowMapController {
	/** Текущие данные */
	getData: () => FlowMapData
	/** Граф текущих данных */
	getGraph: () => FlowGraph
	/** Добавить узел */
	addNode: (node: FlowNode) => Promise<FlowCommandResult>
	/** Изменить поля узла */
	updateNode: (id: string, patch: Partial<Omit<FlowNode, 'id'>>) => Promise<FlowCommandResult>
	/** Добавить связь (правила нотации и `beforeConnect` проверяются) */
	addEdge: (edge: FlowEdge) => Promise<FlowCommandResult>
	/** Соединить узлы: id связи и вид — по умолчанию нотации */
	connect: (
		source: string | { node: string; port?: string },
		target: string | { node: string; port?: string },
		edge?: Partial<FlowEdge>,
	) => Promise<FlowCommandResult>
	/** Изменить поля связи */
	updateEdge: (id: string, patch: Partial<Omit<FlowEdge, 'id'>>) => Promise<FlowCommandResult>
	/** Добавить группу */
	addGroup: (group: FlowGroup) => Promise<FlowCommandResult>
	/** Изменить поля группы */
	updateGroup: (id: string, patch: Partial<Omit<FlowGroup, 'id'>>) => Promise<FlowCommandResult>
	/** Удалить элементы по id (вместе со связями удаляемых узлов) */
	remove: (ids: string[]) => Promise<FlowCommandResult>
	/** Переместить узлы: сдвиг или позиции; узлы закрепляются */
	move: (ids: string[], by: FlowPoint | Record<string, FlowPoint>) => Promise<FlowCommandResult>
	/** Несколько команд одним шагом истории: «Отменить» отменит всё сразу */
	transact: (label: string, run: () => Promise<void> | void) => Promise<FlowCommandResult>
	/** Применить изменения от приложения (совместная работа): без хуков и без истории отмены */
	applyRemote: (changes: FlowChange[]) => void
	/** Отменить */
	undo: () => void
	/** Повторить */
	redo: () => void
	/** Состояние истории */
	getHistory: () => FlowHistoryState
	/** Очистить историю */
	clearHistory: () => void
	/** Выделить: replace — заменить, add — добавить, toggle — переключить */
	select: (ids: string[], mode?: 'replace' | 'add' | 'toggle') => void
	/** Выделенное */
	getSelection: () => string[]
	/** Свернуть или развернуть группу: состояние вида, не данные — без `update:data` и истории правок; без `isCollapsed` — переключить */
	toggleGroup: (id: string, isCollapsed?: boolean) => void
	/** Id свёрнутых групп сейчас: из данных, по уровню зума и по явным переключениям */
	getCollapsed: () => string[]
	/** Уровень смыслового зума, подписи и путь входа */
	getLevel: () => FlowLevelState
	/** Перейти на уровень (масштаб подбирается под уровень; явные переключения групп сбрасываются) */
	setLevel: (index: number, options?: { isAnimated?: boolean }) => void
	/** Войти в группу: нужный уровень, группа развёрнута, вид вписан в неё */
	enterGroup: (id: string, options?: { isAnimated?: boolean }) => void
	/** Выйти из групп: `depth` — длина пути входа, до которой вернуться (0 — к корню); по умолчанию на шаг выше */
	leaveGroup: (depth?: number, options?: { isAnimated?: boolean }) => void
	/** Вписать в область */
	fitView: (options?: FlowFitOptions) => void
	/** Показать элемент и перевести на него фокус клавиатуры */
	focus: (id: string, options?: { isZoomed?: boolean; isAnimated?: boolean }) => void
	/** Масштаб: число или шаг */
	zoom: (to: number | 'in' | 'out') => void
	/** Видимая область */
	getViewport: () => FlowViewport
	/** Задать видимую область */
	setViewport: (viewport: FlowViewport, options?: { isAnimated?: boolean }) => void
	/** Подсветить путь: связи по id или кратчайший путь между узлами; возвращает id связей */
	highlightPath: (path: string[] | { from: string; to: string }) => string[]
	/** Снять подсветку */
	clearHighlight: () => void
	/** Запустить сценарий (по умолчанию — выбранный) */
	play: (scenario?: string) => void
	/** Пауза */
	pause: () => void
	/** Остановить и вернуть в начало */
	stop: () => void
	/** Перейти ко времени, мс, или к шагу */
	seek: (to: number | { step: string | number }) => void
	/** Шаг вперёд или назад (пауза) */
	step: (direction: 1 | -1) => void
	/** Скорость, 0.25–4 */
	setSpeed: (speed: number) => void
	/** Состояние сценария */
	getScenarioState: () => FlowScenarioState
	/** Живые данные: слить с текущими (не в историю) */
	setLive: (patch: FlowLiveState) => void
	/** Статус элемента (живой) */
	setStatus: (id: string, status: FlowStatus | null) => void
	/** Метрики элемента (живые): заменяются по `FlowMetric.id` */
	setMetrics: (id: string, metrics: FlowMetric[]) => void
	/** Авто-раскладка: `isForced` сбрасывает закрепления, `ids` — разложить только эти узлы (остальные стоят) */
	layout: (settings?: FlowLayoutSettings & { isForced?: boolean; ids?: string[] }) => Promise<FlowCommandResult>
	/** Проверить карту по нотации */
	validate: () => FlowDataIssue[]
	/** Выгрузить JSON (строка, отступ 2) */
	exportJson: () => string
	/** Загрузить JSON: миграция, проверка, `beforeImport`, замена данных одним шагом истории */
	importJson: (json: string | FlowMapData) => Promise<FlowImportResult>
	/** Выгрузить SVG (самодостаточный: стили и цвета темы — внутри) */
	exportSvg: (options?: FlowExportImageOptions) => Promise<string>
	/** Выгрузить PNG */
	exportPng: (options?: FlowExportImageOptions) => Promise<Blob>
	/** Подписаться на хук (с приоритетом) или на событие; возвращает отписку */
	on: FlowOn
	/** Привязки событий и хуков — панель «Хуки» */
	getBindings: () => FlowBinding[]
	/** Включить или выключить привязку (отладка в «Правке») */
	setBindingEnabled: (id: string, isEnabled: boolean) => void
	/** «Правки»: предложить изменения от текущего пользователя */
	suggest: (changes: FlowChange[], label?: string) => FlowSuggestion | null
	/** Принять предложение */
	accept: (suggestion: string) => Promise<FlowCommandResult>
	/** Отклонить предложение */
	decline: (suggestion: string) => void
	/** Сравнить версии: «было» (`base`) и «стало» (`target`, по умолчанию — текущие данные); null — выключить */
	compare: (base: string | null, target?: string) => FlowChange[]
}

/** События карты и их данные — для `controller.on` и `BaseFlowMapEmits` */
export interface FlowEventMap {
	/** Данные изменились */
	'update:data': FlowMapData
	/** Режим */
	'update:mode': FlowMode
	/** Выделение */
	'update:selection': string[]
	/** Предложения */
	'update:suggestions': FlowSuggestion[]
	/** Комментарии */
	'update:comments': FlowCommentThread[]
	/** Изменение данных */
	change: FlowChangeEvent
	/** Отказ правила, хука или предела */
	reject: FlowRejectEvent
	/** Щелчок по узлу */
	'node-click': FlowElementEvent
	/** Двойной щелчок по узлу */
	'node-dblclick': FlowElementEvent
	/** Контекстное меню узла */
	'node-contextmenu': FlowElementEvent
	/** Указатель вошёл в узел */
	'node-enter': FlowElementEvent
	/** Указатель ушёл с узла */
	'node-leave': FlowElementEvent
	/** Щелчок по связи */
	'edge-click': FlowElementEvent
	/** Двойной щелчок по связи */
	'edge-dblclick': FlowElementEvent
	/** Контекстное меню связи */
	'edge-contextmenu': FlowElementEvent
	/** Указатель вошёл в связь */
	'edge-enter': FlowElementEvent
	/** Указатель ушёл со связи */
	'edge-leave': FlowElementEvent
	/** Щелчок по группе */
	'group-click': FlowElementEvent
	/** Контекстное меню группы */
	'group-contextmenu': FlowElementEvent
	/** Узлы перемещены */
	'node-move': FlowMoveEvent
	/** Фокус клавиатуры */
	'focus-change': FlowElementRef | null
	/** Видимая область */
	'viewport-change': FlowViewport
	/** Группа свёрнута или развёрнута (пользователем, контроллером, по уровню зума) */
	'group-toggle': FlowElementEvent
	/** Уровень смыслового зума или путь входа изменились */
	'level-change': FlowLevelState
	/** Состояние сценария (запуск, пауза, конец) */
	'scenario-change': FlowScenarioState
	/** Новый шаг сценария */
	'scenario-step': FlowScenarioState
	/** История */
	'history-change': FlowHistoryState
	/** Проверка нотации */
	validate: FlowDataIssue[]
	/** Предложение принято */
	accept: FlowSuggestion
	/** Предложение отклонено */
	decline: FlowSuggestion
	/** Комментарий */
	comment: FlowCommentEvent
	/** Карта готова: первая раскладка */
	ready: FlowMapController
	/** Ошибка */
	error: FlowErrorEvent
}

/** Подписка контроллера: на хук — с приоритетом, на событие — обработчик данных события */
export interface FlowOn {
	/** Хук */
	<K extends FlowHookName>(name: K, handler: FlowHooks[K], options?: FlowHookOptions): () => void
	/** Событие */
	<K extends keyof FlowEventMap>(name: K, handler: (value: FlowEventMap[K]) => void): () => void
}

/** Плагин: набор нотаций, раскладок, маршрутизаторов, проверок и хуков, подключаемый одной строкой */
export interface FlowMapPlugin {
	/** Имя плагина — в предупреждениях */
	name: string
	/** Нотации */
	notations?: FlowNotation[]
	/** Раскладки */
	layouts?: FlowLayoutAlgorithm[]
	/** Маршрутизаторы */
	routers?: FlowRouter[]
	/** Проверки карты */
	validators?: ((data: FlowMapData, graph: FlowGraph) => FlowDataIssue[])[]
	/** Подключение: подписаться на хуки, вызывать контроллер; возвращает отключение */
	setup?: (controller: FlowMapController) => void | (() => void)
}
