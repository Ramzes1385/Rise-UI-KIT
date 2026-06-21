import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты range */
export const RANGE_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Вариант range */
export type RangeVariant = (typeof RANGE_VARIANTS)[number]

/** Размеры делений */
export const TICK_SIZES = ['major', 'minor', 'sub'] as const

/** Размер деления */
export type TickSize = (typeof TICK_SIZES)[number]

/** Метка на шкале */
export interface RangeMark {
	/** Значение */
	value: number
	/** Текст метки */
	label?: string
	/** Размер деления: major — длинная, minor — средняя, sub — короткая */
	tickSize?: TickSize
}

/** Пропсы компонента BaseRange */
export interface BaseRangeProps extends BaseComponentProps<RangeVariant, 'root' | 'label' | 'labelMin' | 'labelValue' | 'labelMax' | 'body' | 'trackWrapper' | 'track' | 'fill' | 'thumbContainer' | 'thumb' | 'thumbDot' | 'marks' | 'mark' | 'markTick' | 'markText'> {
	/** Текущее значение (одиночный ползунок) */
	modelValue?: number
	/** Диапазон (двойной ползунок) */
	rangeValue?: [number, number]
	/** Произвольное количество точек манипуляции (3 и более ползунков) */
	points?: number[]
	/** Минимальное значение */
	min?: number
	/** Максимальное значение */
	max?: number
	/** Шаг */
	step?: number
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
}

/** Пропсы слота thumb */
export interface ThumbSlotProps extends BaseComponentProps<RangeVariant, 'root'> {
	/** Текущее значение ползунка */
	value: number
	/** Порядковый индекс ползунка (0 — первый) */
	index: number
}

/** События компонента BaseRange */
export interface BaseRangeEmits {
	(event: 'update:modelValue', value: number): void
	(event: 'update:rangeValue', value: [number, number]): void
	(event: 'update:points', value: number[]): void
	(event: 'change', value: number | [number, number] | number[]): void
}

/**
 * Слоты компонента BaseRange
 */
export interface BaseRangeSlots {
	default?: () => unknown
	thumb?: (props: { value: number; index: number }) => unknown
}
