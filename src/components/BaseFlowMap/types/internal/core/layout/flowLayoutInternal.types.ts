import type { FlowRect, FlowSize } from '../../../data/flowData.types'
import type { FlowLayoutGroup, FlowLayoutInput, FlowLayoutResult } from '../../../api/flowLayout.types'

/** Связь между вершинами: индексы источника и приёмника */
export type LayeredLink = readonly [number, number]

/** Вершина слоистого графа: настоящий узел или фиктивная точка на длинной связи */
export interface LayeredVertex {
	/** Id узла; у фиктивной вершины — пусто */
	id: string
	/** Фиктивная вершина длинной связи */
	isDummy: boolean
	/** Размер вдоль потока */
	main: number
	/** Размер поперёк потока */
	cross: number
	/** Номер полосы: ключ порядка и границы по поперечной оси */
	band: number
	/** Слой */
	layer: number
	/** Начало вдоль потока */
	mainPos: number
	/** Начало поперёк потока */
	crossPos: number
}

/** Слоистый граф: вершины, слои и соседи в соседних слоях */
export interface LayeredGraph {
	/** Вершины */
	vertices: LayeredVertex[]
	/** Слои: индексы вершин по порядку */
	layers: number[][]
	/** Соседи в предыдущем слое */
	up: number[][]
	/** Соседи в следующем слое */
	down: number[][]
	/** Связи внутри одного слоя: вершины ставятся рядом */
	peers: LayeredLink[]
}

/** Настройки поперечной раскладки */
export interface CrossSettings {
	/** Зазор между вершинами в слое */
	nodeGap: number
	/** Зазор между слоями */
	rankGap: number
	/** Число полос; 0 — полос нет */
	bands: number
}

/** Вход шага «слои»: число узлов, ориентированные связи и закреплённые слои ярусов */
export interface RankInput {
	/** Число узлов */
	count: number
	/** Связи источник → приёмник */
	links: readonly LayeredLink[]
	/** Закреплённый слой узла (ярус); undefined — узел свободный */
	fixed: readonly (number | undefined)[]
}

/** Слой вдоль потока: начало и толщина */
export interface LayerSpan {
	/** Начало слоя вдоль потока */
	start: number
	/** Толщина слоя вдоль потока */
	size: number
}

/** Индексы групп входа: по id, листья полос, ярусы по порядку */
export interface GroupIndex {
	/** Все группы */
	groups: readonly FlowLayoutGroup[]
	/** Группы по id */
	byId: ReadonlyMap<string, FlowLayoutGroup>
	/** Листья полос по порядку */
	leaves: readonly FlowLayoutGroup[]
	/** Ярусы по порядку */
	tiers: readonly FlowLayoutGroup[]
}

/** Что нужно сборке полос и ярусов после расстановки вершин */
export interface StripContext {
	/** Вход раскладки */
	input: FlowLayoutInput
	/** Индексы групп */
	index: GroupIndex
	/** Слоистый граф с позициями */
	graph: LayeredGraph
	/** Прямоугольники узлов в экранных осях */
	nodes: Record<string, FlowRect>
	/** Раскладка вдоль потока: общая длина, слои, строки ярусов после переноса */
	placed: { total: number; spans: LayerSpan[]; rowsOf: [number, number][] }
	/** Раскладывать по дорожкам */
	byLanes: boolean
}

/** Рамка содержимого: границы узлов с отступом */
export interface StripFrame {
	/** Левая граница */
	left: number
	/** Верхняя граница */
	top: number
	/** Правая граница */
	right: number
	/** Нижняя граница */
	bottom: number
}

/** Контекст сборки полос: вход, рамка и поперечные диапазоны полос */
export interface StripScope extends StripContext {
	/** Рамка содержимого */
	frame: StripFrame
	/** Поперечные диапазоны полос */
	ranges: [number, number][]
}

/** Состояние упорядочивания: граф и позиции вершин в слоях */
export interface OrderState {
	/** Граф */
	graph: LayeredGraph
	/** Позиции вершин в слоях */
	pos: number[]
}

/** Общие данные раскладки в одном месте */
export interface LayoutScope {
	/** Вход раскладки */
	input: FlowLayoutInput
	/** Индексы групп */
	index: GroupIndex
	/** Раскладывать по дорожкам */
	byLanes: boolean
}

/** Смежность для назначения рангов */
export interface RankAdjacency {
	/** Исходящие вершины */
	out: number[][]
	/** Входящая степень */
	degree: number[]
}

/** Состояние обхода в глубину при поиске циклов */
export interface CycleWalk {
	/** Связи */
	links: readonly LayeredLink[]
	/** Связи по источнику */
	adjacency: number[][]
	/** Состояние вершин: 0 не виден, 1 в стеке, 2 готов */
	state: Uint8Array
	/** Связи, которые надо развернуть */
	reversed: boolean[]
}

/** Начала полос и зазор для расстановки слоя */
export interface StackPlan {
	/** Начала полос */
	starts: readonly number[]
	/** Зазор между узлами */
	nodeGap: number
}

/** Рамка в раскладке: результат раскладки её содержимого и размер целиком */
export interface BoxLayout {
	/** Рамка */
	box: FlowLayoutGroup
	/** Результат раскладки содержимого в локальных координатах */
	inner: FlowLayoutResult
	/** Размер рамки целиком: содержимое, отступ и заголовок */
	size: FlowSize
}

/** Уровень раскладки рамок: вход, индекс групп и владелец уровня */
export interface BoxLevel {
	/** Вход всей раскладки */
	input: FlowLayoutInput
	/** Группы по id */
	byId: ReadonlyMap<string, FlowLayoutGroup>
	/** Рамка-владелец уровня; undefined — корень */
	owner: string | undefined
}
