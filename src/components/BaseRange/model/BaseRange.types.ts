import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

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
export interface BaseRangeProps {
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
	/** Вариант */
	variant?: RangeVariant
	/** Кастомный цвет компонента */
	color?: CustomColor
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
	/** Кастомные классы */
	customClass?: CustomClassProp
}

/** Пропсы слота thumb */
export interface ThumbSlotProps {
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
