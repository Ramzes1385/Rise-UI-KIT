import type { RoadmapLayoutProps, RoadmapStageView, RoadmapTopicView } from './roadmapInternal.types'

/** Точка раскладки в условных пикселях (при `sizeScale` 100); ось X растёт от начала строки */
export interface RoadmapPoint {
	x: number
	y: number
}

/** Прямоугольник раскладки: `x` — отступ от начала строки (в RTL отсчёт от правого края), `y` — от верха */
export interface RoadmapBox extends RoadmapPoint {
	width: number
	height: number
}

/** Какие свойства этапа влияют на раскладку: число тем и раскрыт ли этап */
export interface RoadmapLayoutStageInput {
	topics: number
	isExpanded: boolean
}

/** Параметры раскладки: `isRtl` зеркалит ось X в путях SVG (боксы остаются логическими — CSS `inset-inline-start`) */
export interface RoadmapLayoutOptions {
	isRtl: boolean
}

/** Раскладки, которые считает `useRoadmapLayout` */
export const ROADMAP_CANVAS_LAYOUTS = ['path', 'snake', 'horizontal'] as const
export type RoadmapCanvasLayout = (typeof ROADMAP_CANVAS_LAYOUTS)[number]

/** Сторона, на которую тема уходит от этапа: к началу строки, к концу или вниз */
export type RoadmapTopicSide = 'start' | 'end' | 'below'

/** Звено пути: прямая или кубическая кривая Безье от предыдущей точки */
export type RoadmapSegment =
	{ kind: 'L'; to: RoadmapPoint } | { kind: 'C'; control1: RoadmapPoint; control2: RoadmapPoint; to: RoadmapPoint }

/** Хребет до записи в строку: начало, звенья и номера звеньев, на которых путь приходит в этапы и в цель */
export interface RoadmapSpine {
	start: RoadmapPoint
	segments: RoadmapSegment[]
	stops: number[]
}

/** Хребет в виде SVG: строка `d` и доли длины пути в центрах этапов (последняя — цель, всегда 1) */
export interface RoadmapSpinePath {
	d: string
	fractions: number[]
}

/** Место темы */
export interface RoadmapTopicSlot {
	index: number
	box: RoadmapBox
	side: RoadmapTopicSide
	/** Ветка от этапа к теме — путь SVG */
	branch: string
}

/** Откуда считать место темы в веере `path`: центр этапа, число тем и номер темы */
export interface RoadmapTopicPlacement {
	center: RoadmapPoint
	count: number
	index: number
}

/** Место этапа и его тем */
export interface RoadmapStageSlot {
	index: number
	box: RoadmapBox
	topics: RoadmapTopicSlot[]
}

/** Раскладка целиком; размеры — условные пиксели, в CSS умножаются на `--size-scale` */
export interface RoadmapLayoutGeometry {
	width: number
	height: number
	stages: RoadmapStageSlot[]
	/** Путь хребта */
	spine: string
	/** Доли длины хребта в центрах этапов и цели: длина — число этапов + 1 */
	fractions: number[]
	/** Точка начала пути */
	start: RoadmapPoint
	/** Цель: центр флажка (`path`) или карточки цели (`snake`, `horizontal`) */
	goal: RoadmapPoint
}

/** Ссылка на место в раскладке: этап или его тема (`topic: null` — сам этап) */
export interface RoadmapSlotRef {
	stage: number
	topic: number | null
}

/** Связь «нужно знать»: от требования к теме */
export interface RoadmapRequirementLink {
	from: RoadmapSlotRef
	to: RoadmapSlotRef
}

/** Пропсы общего холста раскладок `ui/layouts/RoadmapCanvas.vue` */
export interface RoadmapCanvasProps extends RoadmapLayoutProps {
	kind: RoadmapCanvasLayout
}

/** Тема на холсте: данные, место и невыполненные требования (названия) */
export interface RoadmapTopicItem {
	view: RoadmapTopicView
	slot: RoadmapTopicSlot
	/** Переменные CSS `--rl-x`, `--rl-y`, `--rl-i` — положение и номер для задержки появления */
	style: Record<string, number>
	missing: string[]
}

/** Этап на холсте */
export interface RoadmapStageItem {
	view: RoadmapStageView
	slot: RoadmapStageSlot
	style: Record<string, number>
	/** Название того, что откроет закрытый этап */
	unlockTitle?: string
	topics: RoadmapTopicItem[]
}
