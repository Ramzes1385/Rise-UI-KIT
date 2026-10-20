/** Точка на плоскости острова: x — вправо, z — вглубь (три координаты y строит сцена) */
export interface IslandPoint {
	x: number
	z: number
}

/** Раскладка змейкой: позиции этапов, сглаженная дорога и площадка цели */
export interface RoadLayout {
	stages: IslandPoint[]
	road: IslandPoint[]
	goal: IslandPoint
}

/** Поле расстояний на сетке: значение < 0 — суша */
export interface IslandField {
	field: Float32Array
	width: number
	height: number
	x0: number
	z0: number
	cellSize: number
}

/** Корзины отрезков дороги для быстрого расстояния до ближайшего отрезка */
export interface RoadBuckets {
	road: IslandPoint[]
	cells: Map<string, number[]>
	x0: number
	z0: number
}

/** Уступ-утёс: замкнутый контур на заданном уровне поля */
export interface IslandTerrace {
	level: number
	points: IslandPoint[]
}

/** Гора со снежной шапкой: доля шапки — от высоты */
export interface IslandMountain extends IslandPoint {
	height: number
	radius: number
	snow: number
}

/** Дерево: kind 0..2 — вид (конус, шар, двойной конус) */
export interface IslandTree extends IslandPoint {
	kind: number
	scale: number
}

/** Облако над берегом */
export interface IslandCloud extends IslandPoint {
	y: number
	scale: number
}

/** Прямоугольник сетки острова */
export interface IslandBounds {
	minX: number
	maxX: number
	minZ: number
	maxZ: number
}

/** Весь остров: дорога, берег, уступы и декор */
export interface IslandModel {
	seed: number
	layout: RoadLayout
	shoreline: IslandPoint[]
	terraces: IslandTerrace[]
	mountains: IslandMountain[]
	trees: IslandTree[]
	clouds: IslandCloud[]
	bounds: IslandBounds
}

/** Накопленные длины дороги по точкам и полная длина */
export interface RoadTable {
	cumulative: number[]
	total: number
}

/** Точка дороги и направление (угол от оси z к x) */
export interface RoadSample extends IslandPoint {
	angle: number
}

/** Ячейка сетки поля */
export interface IslandCell {
	i: number
	j: number
}

/** Пара рёбер ячейки, соединённых отрезком изолинии (0 — верх, 1 — право, 2 — низ, 3 — лево) */
export type IslandEdgePair = [number, number]

/** Состояние отбора деревьев */
export interface TreeContext {
	layout: RoadLayout
	buckets: RoadBuckets
	grid: IslandField
	mountains: IslandMountain[]
	placed: IslandTree[]
}
