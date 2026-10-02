import type { ImageMapLayer, ImageMapObject } from './imageMapData.types'

/**
 * Маршруты BaseImageMap (wayfinding) — поле `routes` JSON карты.
 * Пути — граф: узлы (`nodes`) в долях картинки своего слоя, коридоры (`edges`) между узлами одного слоя
 * и переходы (`transitions`) между слоями — лестницы, лифты, эскалаторы, пандусы.
 * Объект привязан к графу узлом с его `object` (вход; входов может быть несколько),
 * без такого узла — ближайшим узлом своего слоя (кроме объектов `svg`: им нужен вход).
 */

/** Виды переходов между этажами */
export const IMAGE_MAP_TRANSITION_TYPES = ['stairs', 'elevator', 'escalator', 'ramp'] as const

/** Вид перехода */
export type ImageMapTransitionType = (typeof IMAGE_MAP_TRANSITION_TYPES)[number]

/** Узел графа путей: точка коридора, развилка, вход объекта или площадка перехода */
export interface ImageMapRouteNode {
	/** Уникальный id узла */
	id: string
	/** Слой узла; без него — первый слой */
	layer?: string
	/** По горизонтали, доля ширины слоя */
	x: number
	/** По вертикали, доля высоты слоя */
	y: number
	/** Id объекта, вход которого здесь: маршрут к объекту начинается и заканчивается в этом узле */
	object?: string
}

/** Коридор — путь между двумя узлами одного слоя в обе стороны; длина считается по координатам */
export type ImageMapRouteEdge = [string, string]

/** Переход между этажами: лестница, лифт, эскалатор или пандус */
export interface ImageMapRouteTransition {
	/** Уникальный id перехода */
	id: string
	/** Вид: `stairs` (по умолчанию), `elevator`, `escalator`, `ramp` */
	type?: ImageMapTransitionType
	/** Название в шагах маршрута: «Лестница А», «Лифт у входа» */
	title?: string
	/** Узлы перехода на разных слоях: соседние в списке соединены. «Вверх» и «вниз» в шагах — по порядку слоёв `data.layers` */
	nodes: string[]
	/** Проход только в порядке `nodes`: эскалатор вверх — узлы снизу вверх, эскалатор вниз — сверху вниз */
	isOneWay?: boolean
	/** Без ступеней — для маршрута «Без лестниц»; по умолчанию у лифта и пандуса */
	isStepFree?: boolean
	/** Цена перехода на один этаж в долях ширины слоя; по умолчанию: лестница и эскалатор — 0.2, пандус — 0.25, лифт — 0.3 */
	cost?: number
}

/** Граф путей карты — поле `routes` JSON */
export interface ImageMapRoutes {
	/** Узлы всех слоёв */
	nodes: ImageMapRouteNode[]
	/** Коридоры внутри слоя */
	edges: ImageMapRouteEdge[]
	/** Переходы между слоями */
	transitions?: ImageMapRouteTransition[]
	/** Метров в ширине слоя: с ним шаги и итог показывают расстояние («≈ 40 м») */
	metersPerWidth?: number
}

/** Запрос маршрута (`v-model:route`): откуда, куда и только без ступеней */
export interface ImageMapRouteValue {
	/** Id объекта «откуда» */
	from: string | null
	/** Id объекта «куда» */
	to: string | null
	/** Маршрут без лестниц и эскалаторов */
	isStepFree?: boolean
}

/**
 * Шаг маршрута:
 * start — начало у объекта; walk — пройти по этажу до перехода; transition — подняться или спуститься;
 * arrive — пройти по этажу и прийти к объекту
 */
export const IMAGE_MAP_ROUTE_STEP_KINDS = ['start', 'walk', 'transition', 'arrive'] as const

/** Вид шага маршрута */
export type ImageMapRouteStepKind = (typeof IMAGE_MAP_ROUTE_STEP_KINDS)[number]

/** Шаг маршрута — строка списка «Как пройти» */
export interface ImageMapRouteStep {
	/** Вид шага */
	kind: ImageMapRouteStepKind
	/** Текст шага */
	text: string
	/** Слой, на котором шаг заканчивается: выбор шага показывает этот слой */
	layer: string
	/** Длина шага в метрах, если задан `metersPerWidth` */
	meters?: number
}

/** Найденный маршрут (событие `route-change`) */
export interface ImageMapRouteResult {
	/** Объект «откуда» */
	from: ImageMapObject
	/** Объект «куда» */
	to: ImageMapObject
	/** Узлы пути по порядку */
	nodes: ImageMapRouteNode[]
	/** Шаги для списка «Как пройти» */
	steps: ImageMapRouteStep[]
	/** Длина всего маршрута в метрах, если задан `metersPerWidth` */
	meters?: number
}

/** Ребро графа: куда и цена */
export interface RouteLink {
	to: string
	cost: number
	transition?: ImageMapRouteTransition
}

/** Граф путей, готовый к поиску */
export interface RouteGraph {
	nodes: Map<string, ImageMapRouteNode>
	links: Map<string, RouteLink[]>
	layerOf: (node: ImageMapRouteNode) => string
	/** Слой по id — пропорции для длины пути */
	layerInfo: (id: string) => ImageMapLayer | undefined
}

/** Точка слоя в долях картинки */
export interface RoutePoint {
	x: number
	y: number
}

/** Данные для построения графа */
export interface RouteGraphInput {
	routes: ImageMapRoutes
	layers: ImageMapLayer[]
	isStepFree: boolean
}

/** Найденный путь: узлы и переходы между ними */
export interface RoutePath {
	nodes: ImageMapRouteNode[]
	links: RouteLink[]
	cost: number
}

/** Состояние поиска пути (Дейкстра) */
export interface SearchState {
	cost: Map<string, number>
	previous: Map<string, { from: string; link: RouteLink }>
	done: Set<string>
}

/** Поиск маршрута: объекты, граф и путь; `result` — `null`, если путь не найден */
export interface RouteSearch {
	from: ImageMapObject
	to: ImageMapObject
	graph: RouteGraph
	path?: RoutePath
	result: ImageMapRouteResult | null
}

/** Данные для шагов маршрута */
export interface StepsInput {
	graph: RouteGraph
	path: RoutePath
	from: ImageMapObject
	to: ImageMapObject
	layers: ImageMapLayer[]
	metersPerWidth?: number
}

/** Подряд идущие рёбра пути: пешком или по одному переходу */
export interface LinkRun {
	transition: ImageMapRouteTransition | undefined
	links: RouteLink[]
	start: number
}

/** Ломаная маршрута на слое: точки `x,y` в единицах картинки */
export interface ImageMapRouteLine {
	/** Ключ */
	id: string
	/** Точки для `polyline` */
	points: string
}

/** Метка на линии маршрута: начало, конец или переход */
export interface ImageMapRouteMarker {
	/** Ключ */
	id: string
	/** Вид метки */
	kind: 'start' | 'end' | 'transition'
	/** Положение в CSS: `left`, `top` в процентах */
	style: Record<string, string>
}

/** Пропсы линии маршрута (внутренний компонент) */
export interface ImageMapRouteLineProps {
	/** Ломаные текущего слоя */
	lines: ImageMapRouteLine[]
	/** Метки текущего слоя */
	markers: ImageMapRouteMarker[]
	/** Ширина слоя в единицах картинки */
	width: number
	/** Высота слоя */
	height: number
}

/** Вариант выбора объекта маршрута */
interface ImageMapRouteOption {
	/** Id объекта */
	value: string
	/** Название (и этаж) */
	label: string
}

/** Пропсы панели «Как пройти» (внутренний компонент) */
export interface ImageMapRoutePanelProps {
	/** Объекты для выбора */
	options: ImageMapRouteOption[]
	/** Запрос маршрута */
	value: ImageMapRouteValue
	/** Шаги найденного маршрута */
	steps: ImageMapRouteStep[]
	/** Итог для скринридера и под заголовком; пустой — маршрут не запрошен */
	summary: string
	/** Маршрут не найден */
	isUnreachable: boolean
	/** Есть переходы без ступеней: показать «Без лестниц» */
	hasStepFree: boolean
	/** Класс из customClass */
	customClass?: string
}

/** События панели «Как пройти» */
export interface ImageMapRoutePanelEmits {
	(event: 'update:value', value: ImageMapRouteValue): void
	(event: 'show-layer', layer: string): void
}
