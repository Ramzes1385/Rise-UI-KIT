import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Вид мини-графика: `line` — линия, `area` — линия с заливкой, `bar` — столбики */
export const SPARKLINE_VARIANTS = ['line', 'area', 'bar'] as const

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
}
