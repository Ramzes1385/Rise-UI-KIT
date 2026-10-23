import type { FlowRoute } from '../api/flowLayout.types'
import type { FlowEdge, FlowRect, FlowTraffic } from '../data/flowData.types'

/** Шаг таблицы точек пути, px холста */
export const FLOW_ROUTE_STEP = 6

/** Предел частиц на карте по умолчанию */
export const FLOW_PARTICLE_LIMIT = 400

/** Скорость частиц по умолчанию, px холста в секунду */
export const FLOW_PARTICLE_SPEED = 120

/** Наибольшее число частиц на одной связи в одном направлении */
export const FLOW_PARTICLES_PER_LANE = 24

/** Запас вокруг видимой области, px холста: связь чуть за краем уже живёт */
export const FLOW_VIEW_MARGIN = 64

/** Таблица точек пути: равные отрезки по длине, чтобы частица не считала геометрию в кадре */
export interface FlowRouteTable {
	/** Длина пути, px */
	length: number
	/** Число отрезков */
	segments: number
	/** X точек, `segments + 1` значений */
	xs: Float32Array
	/** Y точек */
	ys: Float32Array
	/** Рамка пути */
	bounds: FlowRect
}

/** Направление частиц на связи */
export type FlowParticleDirection = 'forward' | 'reverse' | 'both'

/** Связь с частицами */
export interface FlowParticleLane {
	/** Id связи */
	id: string
	/** Таблица точек пути */
	table: FlowRouteTable
	/** Частиц в секунду */
	rate: number
	/** Скорость, px в секунду */
	speed: number
	/** Направление */
	direction: FlowParticleDirection
	/** Связь подсвечена: её частицы первыми получают место под предел */
	isHot: boolean
}

/** Частицы, которые живут на связи сейчас */
export interface FlowParticleSlot {
	/** Связь */
	lane: FlowParticleLane
	/** Сколько частиц */
	count: number
}

/** Откуда берутся связи с частицами */
export interface FlowLaneSource {
	/** Связи */
	edges: readonly FlowEdge[]
	/** Маршруты по id связей */
	routes: Record<string, FlowRoute>
	/** Трафик связи: поля связи поверх вида нотации */
	trafficOf: (edge: FlowEdge) => FlowTraffic | undefined
	/** Подсвеченные элементы */
	hot: ReadonlySet<string>
}
