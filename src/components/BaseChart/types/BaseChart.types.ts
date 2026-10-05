import type { Ref } from 'vue'
import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Вид графика: `line` — линии, `area` — линии с заливкой до нуля, `bar` — столбики (группами или стопкой при `isStacked`) */
export const CHART_VARIANTS = ['line', 'area', 'bar'] as const

/** Вид графика */
export type ChartVariant = (typeof CHART_VARIANTS)[number]

/** Подпись точки по оси X: строка как есть, число — через `Intl.NumberFormat`, дата — через `Intl.DateTimeFormat` языка кита */
export type ChartLabel = string | number | Date

/** Появление графика: `grow` — столбики растут от базовой линии, линии и области поднимаются от неё; `draw` — линии рисуются, области проявляются; `fade` — проявление; `none` — сразу */
export const CHART_ANIMATIONS = ['grow', 'draw', 'fade', 'none'] as const

/** Появление графика */
export type ChartAnimation = (typeof CHART_ANIMATIONS)[number]

/** Смена данных: `tween` — значения и шкала Y плавно переходят к новым (при смене числа точек или пропусков — перекрёстное затухание); `none` — сразу */
export const CHART_UPDATE_ANIMATIONS = ['tween', 'none'] as const

/** Смена данных */
export type ChartUpdateAnimation = (typeof CHART_UPDATE_ANIMATIONS)[number]

/**
 * Части графика для пропа `ui` (БЭМ-элементы `.base-chart__<часть>`, `root` — корень `<figure>`):
 * empty — пустое состояние; body — сетка осей и области графика; y-axis — колонка меток оси Y; y-tick — метка оси Y;
 * plot — область графика (фокус, подсказка); svg — рисунок; grid — линия сетки; shapes — группа фигур рядов;
 * area — заливка области; line — линия ряда; bar — столбик; guide — вертикальная направляющая у активной точки;
 * marker — точка ряда у активной точки; tooltip — подсказка; tooltip-label — подпись точки в подсказке;
 * tooltip-row — строка ряда в подсказке; tooltip-name — имя ряда; tooltip-value — значение;
 * swatch — цветной квадрат ряда (подсказка и легенда); x-axis — полоса меток оси X; x-tick — метка оси X;
 * legend — список легенды; legend-item — кнопка ряда в легенде.
 */
export const CHART_PARTS = [
	'empty',
	'body',
	'y-axis',
	'y-tick',
	'plot',
	'svg',
	'grid',
	'shapes',
	'area',
	'line',
	'bar',
	'guide',
	'marker',
	'tooltip',
	'tooltip-label',
	'tooltip-row',
	'tooltip-name',
	'tooltip-value',
	'swatch',
	'x-axis',
	'x-tick',
	'legend',
	'legend-item',
] as const

/** Часть графика для пропа `ui` */
export type BaseChartPart = (typeof CHART_PARTS)[number]

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
	/** Порядок ряда — задержка появления (`--rise-motion-stagger`) */
	order: number
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
	/** Ряд скрыт: столбик сжат до нулевой ширины и прозрачен */
	isHidden: boolean
	/** Значение меньше нуля: столбик растёт вниз от базовой линии */
	isNegative: boolean
	/** Порядок точки — задержка появления (`--rise-motion-stagger`) */
	order: number
}

/** Место столбиков ряда в полосе точки: смещение и ширина в долях полосы (у скрытого ряда ширина 0) */
export interface ChartSlot {
	offset: number
	width: number
}

/** Состояние графика, которое плавно переходит при смене данных: границы шкалы Y, места рядов в полосе и отрезки значений */
export interface ChartMotionState {
	min: number
	max: number
	slots: ChartSlot[]
	spans: ChartSpan[][]
}

/** Метка оси: текст и положение в процентах (X — слева, Y — сверху) */
export interface ChartTick {
	text: string
	position: number
	/** Сдвиг подписи оси Y от места в конечной шкале, px — пока шкала плавно переходит */
	shift?: number
	/** Метка вне текущей шкалы (во время перехода шкалы) — скрыта */
	isOutside?: boolean
}

/** Метка активной точки линии: цвет и положение в процентах */
export interface ChartMarker {
	key: string
	color: string
	x: number
	y: number
	/** Положение в области графика, px: маркер двигается через `transform` */
	offsetX: number
	offsetY: number
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

/** Отрисовываемое состояние: во время перехода — промежуточные отрезки, места рядов и шкала */
export interface ChartView {
	spans: Readonly<Ref<ChartSpan[][]>>
	slots: Readonly<Ref<ChartSlot[]>>
	frame: Readonly<Ref<ChartFrame>>
}

/** Раскладка области графика: отрисовываемое состояние, ширина и высота в px, наибольшее число подписей оси X */
export interface ChartLayout {
	view: ChartView
	width: Readonly<Ref<number>>
	height: Readonly<Ref<number>>
	maxXTicks: Readonly<Ref<number>>
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
	/** Появление графика при монтировании. По умолчанию `grow` */
	animation?: ChartAnimation
	/** Переход при новых данных и скрытии рядов. По умолчанию `tween` */
	updateAnimation?: ChartUpdateAnimation
	/** Свой формат значения; важнее `valueFormat` */
	formatValue?: (value: number) => string
	/** Свой формат подписи оси X; важнее `labelFormat` */
	formatLabel?: (label: ChartLabel) => string
	/**
	 * Классы частей графика (`root`, `plot`, `tooltip`, `legend`, `legend-item`, `x-tick`…) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseChart: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseChart :series="series" :labels="labels" label="Выручка" :ui="{ tooltip: 'shadow-lg', legend: 'justify-center' }" />
	 */
	ui?: UiProp<BaseChartPart>
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
