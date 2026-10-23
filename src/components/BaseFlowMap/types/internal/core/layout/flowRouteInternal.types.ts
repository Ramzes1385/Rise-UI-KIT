import type { FlowLayoutScope } from './flowLayoutScope.types'
import type { FlowLayoutEdge, FlowLayoutResult } from '../../../api/flowLayout.types'
import type { FlowPoint, FlowPortSide, FlowRect } from '../../../data/flowData.types'

/** Запрос на подпись связи: линия и размер подписи */
export interface LabelRequest {
	/** Id связи */
	id: string
	/** Опорные точки линии */
	points: readonly FlowPoint[]
	/** Ширина подписи, px */
	width: number
	/** Высота подписи, px */
	height: number
}

/** Сторона узла без `auto` */
export type ConcreteSide = Exclude<FlowPortSide, 'auto'>

/** Контекст ортогонального маршрутизатора: прямоугольники, ручные точки и номер канала */
export interface OrthogonalContext {
	/** Источник */
	source: FlowRect
	/** Приёмник */
	target: FlowRect
	/** Ручные точки излома */
	points?: FlowPoint[]
	/** Номер канала в пучке: сдвиг средней линии шагом 6 px */
	channel?: number
}

/** Концы линии после выбора сторон */
export interface RouteEnds {
	/** Выход из источника */
	s1: FlowPoint
	/** Вход в приёмник */
	t1: FlowPoint
}

/** Луч: начало и единичное направление */
export interface Ray {
	/** Начало */
	origin: FlowPoint
	/** Направление */
	dir: FlowPoint
}

/** Узел для обрезки линии по фигуре: вид и рамка */
export interface FlowNodeBox {
	/** Вид узла */
	kind: string
	/** Рамка */
	rect: FlowRect
}

/** Всё для построения маршрутов одной карты */
export interface RouteBuild {
	/** Область раскладки */
	scope: FlowLayoutScope
	/** Готовая раскладка */
	layout: FlowLayoutResult
	/** Вид узла по id */
	kinds: ReadonlyMap<string, string>
	/** Связи раскладки по id */
	layoutEdges: ReadonlyMap<string, FlowLayoutEdge>
	/** Номер канала в пучке по id связи */
	channels: ReadonlyMap<string, number>
	/** Вид линии, если у связи и её вида нет своего */
	fallback: string
}
