import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Вид графика: `line` — линии, `area` — линии с заливкой до нуля, `bar` — столбики (группами или стопкой при `isStacked`) */
export const CHART_VARIANTS = ['line', 'area', 'bar'] as const

/** Вид графика */
export type ChartVariant = (typeof CHART_VARIANTS)[number]

/** Подпись точки по оси X: строка как есть, число — через `Intl.NumberFormat`, дата — через `Intl.DateTimeFormat` языка кита */
export type ChartLabel = string | number | Date

/** Ряд данных: имя для легенды, подсказки и таблицы; значения по порядку подписей `labels`; `null` — нет значения (разрыв линии) */
export interface ChartSeries {
	name: string
	values: readonly (number | null)[]
	/** Цвет ряда: токен (`var(--rise-success)`) или CSS-цвет. По умолчанию — `--rise-chart-1…8` по порядку ряда */
	color?: string
}

/** Значение ряда в точке — для подсказки, слота `tooltip` и объявления скринридера */
export interface ChartPointValue {
	name: string
	color: string
	value: number | null
	text: string
}

/** Точка оси X со значениями видимых рядов: аргумент слота `tooltip` */
export interface ChartPoint {
	index: number
	label: string
	values: ChartPointValue[]
}

/** Ряд для разметки: цвет, видимость, пути линии и области в координатах 0–100 */
export interface ChartSeriesView {
	name: string
	color: string
	isHidden: boolean
	line: string
	area: string
}

/** Прямоугольник столбика в процентах области графика */
export interface ChartRect {
	x: number
	y: number
	width: number
	height: number
}

/** Столбик для разметки: ряд, цвет и прямоугольник */
export interface ChartBarView extends ChartRect {
	key: string
	color: string
}

/** Метка оси: текст и положение в процентах (X — слева, Y — сверху) */
export interface ChartTick {
	text: string
	position: number
}

/** Метка активной точки линии: цвет и положение в процентах */
export interface ChartMarker {
	key: string
	color: string
	x: number
	y: number
}

/** Отрезок значения в точке: основание и вершина (у стопки основание — сумма рядов ниже); `null` — нет значения */
export type ChartSpan = readonly [number, number] | null

/** Шкала оси Y: границы и «круглые» метки */
export interface ChartDomain {
	min: number
	max: number
	ticks: number[]
}

/** Система координат области графика: число точек, шкала Y и положение точек по X (`isBand` — в середине полос, для столбиков) */
export interface ChartFrame {
	count: number
	domain: ChartDomain
	isBand: boolean
}

/** Строка таблицы для скринридера: подпись и значения всех рядов */
export interface ChartTableRow {
	key: string
	label: string
	cells: string[]
}

/**
 * Пропсы компонента BaseChart
 */
export interface BaseChartProps extends BaseComponentProps<ChartVariant, 'root' | 'plot' | 'legend' | 'tooltip'> {
	/** Ряды данных; порядок задаёт цвета, поэтому цвет ряда не меняется, когда другие ряды скрыты */
	series: readonly ChartSeries[]
	/** Подписи точек по оси X, по одной на значение ряда */
	labels: readonly ChartLabel[]
	/** Что показывает график: имя для скринридера и подпись таблицы данных («Выручка за 2026 год») */
	label: string
	/** Заголовок колонки подписей в таблице для скринридера. По умолчанию «Категория» */
	labelsTitle?: string
	/** Имена скрытых рядов (`v-model:hidden-series`); без привязки компонент хранит их сам */
	hiddenSeries?: readonly string[]
	/** Складывать ряды стопкой (столбики и области) вместо групп и наложения */
	isStacked?: boolean
	/** Высота области графика в пикселях; ширина — по контейнеру. По умолчанию 240 */
	height?: number
	/** Горизонтальные линии сетки по меткам оси Y */
	hasGrid?: boolean
	/** Легенда с кнопками скрытия рядов */
	hasLegend?: boolean
	/** Примерное число меток оси Y; значения округляются до «круглых». По умолчанию 5 */
	yTickCount?: number
	/** Формат значений (ось Y, подсказка, таблица) через `Intl.NumberFormat`, напр. `{ style: 'currency', currency: 'RUB' }` */
	valueFormat?: Intl.NumberFormatOptions
	/** Формат подписей-дат через `Intl.DateTimeFormat`. По умолчанию `{ day: 'numeric', month: 'short' }` */
	labelFormat?: Intl.DateTimeFormatOptions
	/** Свой формат значения; важнее `valueFormat` */
	formatValue?: (value: number) => string
	/** Свой формат подписи оси X; важнее `labelFormat` */
	formatLabel?: (label: ChartLabel) => string
}

/**
 * События компонента BaseChart
 */
export interface BaseChartEmits {
	/** Кнопкой легенды скрыт или показан ряд: имена скрытых рядов (`v-model:hidden-series`) */
	(event: 'update:hiddenSeries', names: string[]): void
}

/**
 * Слоты компонента BaseChart
 */
export interface BaseChartSlots {
	/** Содержимое подсказки у активной точки (наведение или стрелки) */
	tooltip?: (props: { point: ChartPoint }) => unknown
	/** Пустое состояние: нет рядов или подписей. По умолчанию — «Нет данных» */
	empty?: () => unknown
}
