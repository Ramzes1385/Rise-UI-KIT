import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { BaseGanttEmits, GanttProps, GanttScale, GanttTask, GanttTaskId } from './BaseGantt.types'

/** Диапазон дней шкалы: первый день и число дней */
export interface GanttRange {
	start: Date
	days: number
}

/** Ячейка шкалы: смещение от начала диапазона и ширина — в днях */
export interface GanttScaleCell {
	key: string
	label: string
	offset: number
	span: number
}

/** Единицы подписей шкалы */
export type GanttScaleUnit = 'day' | 'month' | 'year' | 'monthYear'

export type GanttScaleFormat = (date: Date, unit: GanttScaleUnit) => string

/** Задача, приведённая к дням и встроенная в дерево */
export interface GanttItem {
	id: GanttTaskId
	task: GanttTask
	name: string
	start: Date
	end: Date
	progress: number
	parentId: GanttTaskId | null
	dependencies: GanttTaskId[]
	isMilestone: boolean
	level: number
	hasChildren: boolean
	position: number
	setSize: number
}

/** Первый и последний день задачи */
export interface GanttSpan {
	start: Date
	end: Date
}

/** Положение полосы в слое диаграммы, px */
export interface GanttBox {
	x: number
	width: number
	row: number
}

/** Контуры стрелки зависимости: линия и наконечник */
export interface GanttArrow {
	line: string
	head: string
}

/** Окно строк: индексы от `start` до `end` не включая */
export interface GanttRowWindow {
	start: number
	end: number
}

/** Правка дат задачи и что именно изменено */
export interface GanttEdit {
	kind: 'move' | 'resize-start' | 'resize-end'
	span: GanttSpan
}

/** Черновик правки во время перетаскивания */
export interface GanttDraft {
	id: GanttTaskId
	edit: GanttEdit
}

/** Строка, готовая к отрисовке */
export interface GanttRowView {
	item: GanttItem
	index: number
	top: number
	isActive: boolean
	isCollapsed: boolean
	isEditing: boolean
	barStyle: Record<string, string>
	progressStyle: Record<string, string>
	label: string
}

/** Размеры диаграммы в px с учётом `sizeScale` */
export interface GanttMetrics {
	scale: GanttScale
	rowHeight: number
	listWidth: number
	headerHeight: number
	dayWidth: number
	firstDay: number
}

/** Ячейка шкалы в px */
export interface GanttHeaderCell {
	key: string
	label: string
	left: number
	width: number
}

/** Общие данные для частей модели диаграммы */
export interface GanttContext {
	props: GanttProps
	emit: BaseGanttEmits
	items: ComputedRef<GanttItem[]>
	rows: ComputedRef<GanttItem[]>
	metrics: ComputedRef<GanttMetrics>
	range: ComputedRef<GanttRange>
	draft: Ref<GanttDraft | null>
}

/** Шкала и первый день недели: по ним считаются границы столбцов */
export interface GanttUnit {
	scale: GanttScale
	firstDay: number
}

/** Нажатие на полосу, из которого вырастает перетаскивание */
export interface GanttPress {
	item: GanttItem
	kind: GanttEdit['kind']
	x: number
	isMoved: boolean
}

/** Что именно сделали с полосой мышью: тип правки и сдвиг в пикселях при ширине дня */
export interface GanttPointerShift {
	kind: GanttEdit['kind']
	deltaPx: number
	dayWidth: number
}

/** Нажатая клавиша правки: стрелка, Shift и шкала, задающая шаг */
export interface GanttKeyInput {
	key: string
	isShift: boolean
	scale: GanttScale
}

/** Правка в днях: что менять, на сколько дней, вехе нельзя менять длительность */
export interface GanttDelta {
	kind: GanttEdit['kind']
	days: number
	isMilestone: boolean
}

/** Окно прокрутки: сдвиг и высота видимой части */
export interface GanttScrollView {
	top: number
	viewport: number
}

/** Строки списка: высота строки и число строк */
export interface GanttRowsSize {
	height: number
	count: number
}

/** Состояние для отрисовки строк */
export interface GanttRowsState {
	window: ComputedRef<GanttRowWindow>
	activeIndex: ComputedRef<number>
	collapsed: ShallowRef<ReadonlySet<GanttTaskId>>
}

/** Управление свёрнутыми задачами */
interface GanttCollapseApi {
	collapsed: ShallowRef<ReadonlySet<GanttTaskId>>
	toggle: (id: GanttTaskId) => void
	setCollapsed: (id: GanttTaskId, isCollapsed: boolean) => void
}

/** Перемещение фокуса по строкам и полосам */
export interface GanttFocusApi {
	grid: Ref<HTMLElement | null>
	activeIndex: ComputedRef<number>
	setActive: (index: number) => void
	lastIndex: () => number
	focusRow: (index: number) => Promise<void>
	focusBar: (index: number) => Promise<void>
}

/** Правка с клавиатуры, нужная обработчику клавиш */
interface GanttKeyEditing {
	editByKey: (event: KeyboardEvent, item: GanttItem) => boolean
}

/** Части модели, которые нужны обработчику клавиш */
export interface GanttNavigationParts {
	collapse: GanttCollapseApi
	editing: GanttKeyEditing
	focus: GanttFocusApi
}
