import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Вид мини-графика: `line` — линия, `area` — линия с заливкой, `bar` — столбики */
export const SPARKLINE_VARIANTS = ['line', 'area', 'bar'] as const

/**
 * Части графика для пропа `ui` (БЭМ-элементы `.base-sparkline__<часть>`, `root` — корень с `role="img"`):
 * svg — холст линии, line — линия, area — заливка под линией (`variant="area"`), bars — ряд столбиков (`variant="bar"`),
 * bar — столбик, dot — точка последнего или наведённого значения, tooltip — подсказка при наведении.
 */
export const SPARKLINE_PARTS = ['svg', 'line', 'area', 'bars', 'bar', 'dot', 'tooltip'] as const

export type BaseSparklinePart = (typeof SPARKLINE_PARTS)[number]

/** Точка графика для разметки: положение в процентах и значение */
export interface SparklinePoint {
	x: number
	y: number
	value: number
	label: string
}

/**
 * Пропсы компонента BaseSparkline
 */
export interface BaseSparklineProps extends BaseComponentProps<(typeof SPARKLINE_VARIANTS)[number], 'root'> {
	/** Значения слева направо */
	values: readonly number[]
	/** Подписи значений для подсказки: даты или названия периодов */
	labels?: readonly string[]
	/** Что показывает график: начало описания для скринридера («Выручка за год») */
	label: string
	/** Цвет линии и столбиков: токен (`var(--rise-success)`) или CSS-цвет. По умолчанию — основной цвет */
	markColor?: string
	/** Высота в пикселях; ширина — по контейнеру */
	height?: number
	/** Формат значения в подсказке и описании */
	formatValue?: (value: number) => string
	/**
	 * Классы частей графика (`root`, `svg`, `line`, `area`, `bars`, `bar`, `dot`, `tooltip`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseSparkline: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseSparkline label="Выручка" :values="[3, 5, 4, 8]" :ui="{ line: 'stroke-[3px]', tooltip: 'shadow-lg' }" />
	 */
	ui?: UiProp<BaseSparklinePart>
}
