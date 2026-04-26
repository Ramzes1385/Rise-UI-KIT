/**
 * Вариант range
 */
export type RangeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error'

/**
 * Метка на шкале
 */
export interface RangeMark {
	/** Значение */
	value: number
	/** Текст метки */
	label?: string
}

/**
 * Пропсы компонента BaseRange
 */
export interface BaseRangeProps {
	/** Текущее значение (одиночное) */
	modelValue?: number
	/** Диапазон (двойной ползунок) */
	rangeValue?: [number, number]
	/** Минимальное значение */
	min?: number
	/** Максимальное значение */
	max?: number
	/** Шаг */
	step?: number
	/** Вариант */
	variant?: RangeVariant
	/** Отключен */
	isDisabled?: boolean
	/** Показывать тултип */
	hasTooltip?: boolean
	/** Метки на шкале */
	marks?: RangeMark[]
	/** Вертикальный */
	isVertical?: boolean
	/** Показывать текущее значение */
	hasLabel?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseRange
 */
export interface BaseRangeEmits {
	(event: 'update:modelValue', value: number): void
	(event: 'update:rangeValue', value: [number, number]): void
	(event: 'change', value: number | [number, number]): void
}
