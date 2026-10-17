import type {
	FlowEdge,
	FlowGroup,
	FlowLayoutSettings,
	FlowNode,
	FlowPoint,
	FlowPortSide,
	FlowRect,
	FlowSize,
	FlowValue,
} from '../data/flowData.types'

/** Граф карты: индексы для правил, раскладки, сценариев и навигации с клавиатуры. Строит ядро, только читать */
export interface FlowGraph {
	/** Узлы по id */
	nodes: ReadonlyMap<string, FlowNode>
	/** Связи по id */
	edges: ReadonlyMap<string, FlowEdge>
	/** Группы по id */
	groups: ReadonlyMap<string, FlowGroup>
	/** Исходящие связи узла */
	outgoing: (nodeId: string) => readonly FlowEdge[]
	/** Входящие связи узла */
	incoming: (nodeId: string) => readonly FlowEdge[]
	/** Цепочка групп узла от ближней к корню */
	ancestry: (nodeId: string) => readonly FlowGroup[]
	/** Кратчайший путь между узлами (по связям в их направлении): id связей; пусто — пути нет */
	path: (from: string, to: string) => string[]
}

/** Узел на входе раскладки */
export interface FlowLayoutNode {
	/** Id */
	id: string
	/** Вид узла, как в данных (`<вид>` или `<нотация>:<вид>`) — для раскладок нотаций */
	kind: string
	/** Поля узла из данных — для раскладок нотаций (например, `code` функции IDEF0) */
	props?: Record<string, FlowValue>
	/** Размер */
	size: FlowSize
	/** Группа */
	group?: string
	/** Закреплённая позиция: раскладка её не меняет */
	fixed?: FlowPoint
	/** Порядок в данных — стабильный ключ при равных весах */
	order: number
}

/** Связь на входе раскладки */
export interface FlowLayoutEdge {
	/** Id */
	id: string
	/** Источник */
	source: string
	/** Приёмник */
	target: string
	/** Сторона порта источника */
	sourceSide?: FlowPortSide
	/** Сторона порта приёмника */
	targetSide?: FlowPortSide
	/** Вес: связи с большим весом раскладка старается делать короче и прямее */
	weight?: number
}

/** Группа на входе раскладки */
export interface FlowLayoutGroup {
	/** Id */
	id: string
	/** Полоса, ярус или рамка (`FlowGroupKindDef.layout`) */
	layout: 'band' | 'tier' | 'box'
	/** Родитель */
	parent?: string
	/** Порядок */
	order: number
	/** Размер заголовка: место под подпись */
	header: FlowSize
}

/** Вход раскладки */
export interface FlowLayoutInput {
	/** Узлы */
	nodes: FlowLayoutNode[]
	/** Связи */
	edges: FlowLayoutEdge[]
	/** Группы */
	groups: FlowLayoutGroup[]
	/** Настройки */
	settings: Required<Pick<FlowLayoutSettings, 'direction' | 'nodeGap' | 'rankGap' | 'gridSize'>> & FlowLayoutSettings
}

/** Результат раскладки */
export interface FlowLayoutResult {
	/** Прямоугольники узлов */
	nodes: Record<string, FlowRect>
	/** Прямоугольники групп */
	groups: Record<string, FlowRect>
	/** Готовые маршруты связей, если раскладка строит их сама (линии жизни Sequence); остальные строит маршрутизатор */
	edges?: Record<string, FlowPoint[]>
	/** Границы всего содержимого */
	bounds: FlowRect
}

/** Алгоритм раскладки — чистая функция без DOM: одинаков в 2D, 3D, тестах и SSR */
export interface FlowLayoutAlgorithm {
	/** Id: `layered`, `manual`, `idef0-staircase`, `sequence`, `timeline`, `c4-nested` */
	id: string
	/** Раскладка */
	run: (input: FlowLayoutInput) => FlowLayoutResult
}

/** Маршрут связи */
export interface FlowRoute {
	/** Путь SVG (`d`) */
	path: string
	/** Опорные точки: для частиц, подписей и 3D-лент */
	points: FlowPoint[]
	/** Точка и угол подписи; null — подписи не нашлось места без наложения (показывается при наведении и фокусе) */
	label: { point: FlowPoint; angle: number } | null
}

/** Маршрутизатор связей — чистая функция */
export interface FlowRouter {
	/** Id: `curved`, `orthogonal`, `straight` или свой */
	id: string
	/** Маршрут: концы на контуре фигур с учётом портов, препятствия — прямоугольники узлов */
	route: (
		edge: FlowLayoutEdge,
		context: { source: FlowRect; target: FlowRect; obstacles: readonly FlowRect[]; points?: FlowPoint[] },
	) => FlowPoint[]
}
