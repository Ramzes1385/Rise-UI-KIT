import type { FlowScenario } from './flowScenario.types'
import type { FlowEdge3D, FlowGroup3D, FlowNode3D, FlowView3D } from './flowData3d.types'

/**
 * Формат данных BaseFlowMap — JSON карты взаимодействий или процесса. Версия 1.
 * Координаты — в единицах холста (1 = 1 px при масштабе 100 %), ось Y вниз, начало — левый верхний угол холста.
 * Новая версия формата — только вместе с миграцией (`migrateFlowData`): старый JSON остаётся рабочим.
 */
export const FLOW_DATA_VERSION = 1

/** Направления слоистой раскладки: LR — слева направо, TB — сверху вниз, RL и BT — обратные */
export const FLOW_DIRECTIONS = ['LR', 'TB', 'RL', 'BT'] as const

/** Направление раскладки */
export type FlowDirection = (typeof FLOW_DIRECTIONS)[number]

/** Линии связей: curved — плавная кривая, orthogonal — ломаная под прямым углом со скруглением, straight — прямая */
export const FLOW_EDGE_ROUTINGS = ['curved', 'orthogonal', 'straight'] as const

/** Вид линии связи */
export type FlowEdgeRouting = (typeof FLOW_EDGE_ROUTINGS)[number]

/**
 * Встроенные виды групп: lane — дорожка, pool — пул (содержит дорожки), boundary — граница (C4, система),
 * layer — слой архитектуры, context — ограниченный контекст (DDD, Event Storming), zone — произвольная область.
 * Нотация может добавить свои виды строкой.
 */
export const FLOW_GROUP_KINDS = ['lane', 'pool', 'boundary', 'layer', 'context', 'zone'] as const

/** Вид группы: встроенный или вид нотации */
export type FlowGroupKind = (typeof FLOW_GROUP_KINDS)[number] | (string & {})

/** Встроенные статусы: работает, задержки, ошибки, не работает, нет данных. Свои — `FlowMapData.statuses`. Те же id — у 3D (`MODEL3D_STATUSES`) */
export const FLOW_STATUSES = ['ok', 'warning', 'error', 'down', 'unknown'] as const

/** Статус узла, связи или шага: встроенный или свой (`FlowStatusDef.id`) */
export type FlowStatus = (typeof FLOW_STATUSES)[number] | (string & {})

/** Сторона порта; auto — сторона по направлению раскладки (выход — по ходу потока, вход — навстречу) */
export const FLOW_PORT_SIDES = ['top', 'right', 'bottom', 'left', 'auto'] as const

/** Сторона порта */
export type FlowPortSide = (typeof FLOW_PORT_SIDES)[number]

/** Значение JSON: поля нотации и метаданные должны сохраняться в JSON без потерь */
export type FlowValue = string | number | boolean | null | FlowValue[] | { [key: string]: FlowValue }

/** Точка холста */
export interface FlowPoint {
	/** Координата X */
	x: number
	/** Координата Y */
	y: number
}

/** Размер */
export interface FlowSize {
	/** Ширина */
	width: number
	/** Высота */
	height: number
}

/** Прямоугольник холста: левый верхний угол и размер */
export interface FlowRect extends FlowPoint, FlowSize {}

/** Ссылка узла: «Логи», «Документация» — кнопки в подробностях */
export interface FlowLink {
	/** Подпись кнопки */
	label: string
	/** Адрес */
	href: string
	/** Значок — имя BaseIcon */
	icon?: string
	/** Открыть в новой вкладке */
	isExternal?: boolean
}

/** Вид карточки узла: card — карточка с подзаголовком и метриками, compact — плитка со значком и подписью (узкий экран) */
export const FLOW_NODE_APPEARANCES = ['card', 'compact'] as const

/** Вид карточки узла */
export type FlowNodeAppearance = (typeof FLOW_NODE_APPEARANCES)[number]

/** Своё поле узла — строка в подробностях («Ссылка на дашборд») */
export interface FlowField {
	/** Id поля */
	id: string
	/** Подпись */
	label: string
	/** Значение */
	value: string | number
	/** Ссылка: значение становится ссылкой */
	href?: string
}

/** Ответственный: команда или человек — BaseAvatar и подпись в подробностях */
export interface FlowOwner {
	/** Имя: подпись и инициалы аватара */
	name: string
	/** Картинка аватара */
	avatar?: string
	/** Ссылка на профиль или страницу команды */
	href?: string
}

/** Метрика: «Запросов/с 840», «p95 64 мс» */
export interface FlowMetric {
	/** Id метрики — по нему живые обновления (`setMetrics`) заменяют значение */
	id: string
	/** Подпись */
	label: string
	/** Значение: число форматируется по языку кита, строка показывается как есть */
	value: number | string
	/** Единица после числа: «мс», «rps», «%» */
	unit?: string
	/** Статус метрики — цвет, значок и текст (не только цвет) */
	status?: FlowStatus
	/** Направление изменения — стрелка и текст для скринридера */
	trend?: 'up' | 'down' | 'flat'
}

/** Порт — точка подключения связей на узле. Без портов связь подключается к стороне по направлению раскладки */
export interface FlowPort {
	/** Id порта, уникальный в пределах узла */
	id: string
	/** Сторона узла */
	side?: FlowPortSide
	/** Положение вдоль стороны, 0–1 (0 — начало стороны слева или сверху); по умолчанию порты стороны распределяются равномерно */
	offset?: number
	/** Роль порта в нотации: IDEF0 — `input`, `control`, `output`, `mechanism`, `call`; правила допустимости читают её */
	role?: string
	/** Подпись порта (в режиме «Правка» и для скринридера) */
	label?: string
	/** Какие связи принимает: in — входящие, out — исходящие, both — любые (по умолчанию) */
	direction?: 'in' | 'out' | 'both'
	/** Сколько связей можно подключить; без ограничения — не задавать */
	maxEdges?: number
}

/** Узел: сервис, задача, функция, событие, хранилище… */
export interface FlowNode {
	/** Уникальный id узла */
	id: string
	/** Вид узла в нотации карты: `service`, `task`, `function`; вид другой нотации — `<нотация>:<вид>` (`c4:person`) */
	kind: string
	/** Подпись */
	label: string
	/** Вторая строка карточки: «Go · 840 rps» */
	subtitle?: string
	/** Описание — подробности и подсказка */
	description?: string
	/** Значок — имя BaseIcon; без него — значок вида нотации */
	icon?: string
	/** Цвет акцента — токен (`var(--rise-chart-3)`) или CSS-цвет; без него — цвет группы */
	color?: string
	/** Вид карточки (HTML-узлы); без него — card, на узком экране — compact */
	appearance?: FlowNodeAppearance
	/** Группа (дорожка, пул, граница…), в которой лежит узел */
	group?: string
	/** Внешняя система (партнёр, банк): пунктирная рамка в 2D, модель `cloud` в 3D; по умолчанию — `isExternal` вида нотации */
	isExternal?: boolean
	/** Позиция (левый верхний угол). Без неё узел ставит раскладка */
	position?: FlowPoint
	/** Позиция закреплена: авто-раскладка узел не двигает (ставится при перетаскивании в режиме «Правка») */
	isPinned?: boolean
	/** Размер; без него — размер вида нотации, ширина подстраивается под подпись */
	size?: Partial<FlowSize>
	/** Порты; без них — порты вида нотации */
	ports?: FlowPort[]
	/** Статус: значок, текст и цвет; живое значение — `FlowLiveState` */
	status?: FlowStatus
	/** Метрики — подробности и подпись карточки */
	metrics?: FlowMetric[]
	/** Метки для фильтра и поиска */
	tags?: string[]
	/** Ответственный */
	owner?: FlowOwner
	/** Ссылки — кнопки в подробностях */
	links?: FlowLink[]
	/** Свои поля — строки в подробностях */
	fields?: FlowField[]
	/** Поля нотации: тип задачи BPMN (`taskType`), номер функции IDEF0 (`code`)… Описание полей — `FlowNodeKindDef.props` */
	props?: Record<string, FlowValue>
	/** Данные приложения: кит их не читает и сохраняет без изменений */
	meta?: Record<string, unknown>
	/** Поля 3D (контракт 3D): модель, поворот, масштаб; 2D их не читает, но сохраняет */
	model3d?: FlowNode3D
}

/** Узел вида `K` с полями нотации `P` — для типов нотаций: `FlowNodeOf<'task', BpmnTaskProps>` */
export type FlowNodeOf<K extends string, P extends object = Record<string, FlowValue>> = Omit<FlowNode, 'kind' | 'props'> & {
	/** Вид */
	kind: K
	/** Поля нотации */
	props?: P
}

/** Частицы на связи — «трафик» */
export interface FlowTraffic {
	/** Частиц в секунду; 0 — без частиц. По умолчанию — из вида связи нотации */
	rate?: number
	/** Скорость, px холста в секунду; по умолчанию 120 */
	speed?: number
	/** Обратное направление (ответы) */
	isReversed?: boolean
	/** Частицы в обе стороны */
	isBidirectional?: boolean
}

/** Связь: вызов, поток, сообщение, событие */
export interface FlowEdge {
	/** Уникальный id связи */
	id: string
	/** Вид связи в нотации: `call`, `event`, `sequence`, `message`, `flow`; без него — вид по умолчанию нотации */
	kind?: string
	/** Id узла-источника */
	source: string
	/** Id узла-приёмника */
	target: string
	/** Порт источника */
	sourcePort?: string
	/** Порт приёмника */
	targetPort?: string
	/** Подпись на линии: «gRPC», «order.created» */
	label?: string
	/** Описание — подсказка и подробности */
	description?: string
	/** Вид линии; без него — `layout.routing` карты */
	routing?: FlowEdgeRouting
	/** Точки излома, заданные вручную (режим «Правка»); без них путь строит маршрутизатор */
	points?: FlowPoint[]
	/** Условие ветвления: подпись у выхода шлюза (BPMN, IDEF3, EPC) */
	condition?: string
	/** Поток по умолчанию у шлюза (засечка BPMN) */
	isDefault?: boolean
	/** Статус: цвет, штрих и текст */
	status?: FlowStatus
	/** Метрики связи: rps, задержка */
	metrics?: FlowMetric[]
	/** Частицы */
	traffic?: FlowTraffic
	/** Метки */
	tags?: string[]
	/** Поля нотации */
	props?: Record<string, FlowValue>
	/** Данные приложения */
	meta?: Record<string, unknown>
	/** Поля 3D: вид ленты */
	model3d?: FlowEdge3D
}

/** Группа: дорожка, пул, граница, слой, контекст. Вложенность — через `parent` (пул → дорожки) */
export interface FlowGroup {
	/** Уникальный id группы */
	id: string
	/** Вид группы */
	kind: FlowGroupKind
	/** Подпись (заголовок дорожки, имя системы C4) */
	label: string
	/** Описание */
	description?: string
	/** Родительская группа */
	parent?: string
	/** Порядок среди соседних групп (дорожки сверху вниз или слева направо); по умолчанию — порядок в массиве */
	order?: number
	/** Цвет группы — CSS-цвет или токен (`var(--rise-chart-3)`): фон 5 %, рамка 24 % (токены `--rise-flow-map-lane-*`) */
	color?: string
	/** Свёрнута: показывается одним блоком (C4, вложенные процессы) */
	isCollapsed?: boolean
	/** Позиция (ручная раскладка) */
	position?: FlowPoint
	/** Размер (ручная раскладка); без него — по содержимому */
	size?: Partial<FlowSize>
	/** Поля нотации */
	props?: Record<string, FlowValue>
	/** Данные приложения */
	meta?: Record<string, unknown>
	/** Поля 3D: ярус в «Слоях», основание */
	model3d?: FlowGroup3D
}

/** Свой статус: id, подпись, значок и цвет (токен). Показывается в легенде */
export interface FlowStatusDef {
	/** Id статуса */
	id: string
	/** Подпись: «Задержки» */
	label: string
	/** Значок — имя BaseIcon: статус различим не только цветом */
	icon: string
	/** Цвет — токен: `var(--rise-warning)` */
	color: string
}

/** Настройки раскладки, сохраняемые в данных */
export interface FlowLayoutSettings {
	/** Алгоритм: `layered` (по умолчанию), `manual`, раскладка нотации (`idef0-staircase`, `sequence`, `timeline`, `c4-nested`) или своя */
	algorithm?: string
	/** Направление (слоистая раскладка) */
	direction?: FlowDirection
	/** Вид линий по умолчанию */
	routing?: FlowEdgeRouting
	/** Зазор между узлами в слое, px */
	nodeGap?: number
	/** Зазор между слоями, px */
	rankGap?: number
	/** Шаг сетки привязки, px; 0 — без сетки */
	gridSize?: number
	/** Раскладывать по дорожкам (группы `band` и `tier`); false — дорожки рисуются вокруг узлов, но раскладку не задают. По умолчанию true */
	byLanes?: boolean
	/** Сколько узлов в ряду яруса (`tier`), лишние — следующим рядом; 0 — без переноса (по умолчанию; на узком экране — 3) */
	wrap?: number
	/** Параметры алгоритма */
	options?: Record<string, FlowValue>
}

/** Данные карты */
export interface FlowMapData {
	/** Версия формата — `FLOW_DATA_VERSION` */
	version: number
	/** Нотация карты (`FlowNotation.id`); по умолчанию `services` */
	notation?: string
	/** Заголовок карты */
	title?: string
	/** Описание — подзаголовок и описание области для скринридера */
	description?: string
	/** Узлы */
	nodes: FlowNode[]
	/** Связи */
	edges: FlowEdge[]
	/** Группы */
	groups?: FlowGroup[]
	/** Сценарии */
	scenarios?: FlowScenario[]
	/** Раскладка */
	layout?: FlowLayoutSettings
	/** Свои статусы */
	statuses?: FlowStatusDef[]
	/** Данные приложения */
	meta?: Record<string, unknown>
	/** Настройки 3D-сцены (контракт 3D) */
	view3d?: FlowView3D
}
