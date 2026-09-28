import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseComponentProps } from '@composables/useBaseComponent'

export const RANGE_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type RangeVariant = (typeof RANGE_VARIANTS)[number]

export const TICK_SIZES = ['major', 'minor', 'sub'] as const

export type TickSize = (typeof TICK_SIZES)[number]

export interface RangeMark {
	/** Значение */
	value: number
	/** Текст метки */
	label?: string
	/** Размер деления: major — длинная, minor — средняя, sub — короткая */
	tickSize?: TickSize
}

export interface BaseRangeProps extends BaseComponentProps<
	RangeVariant,
	| 'root'
	| 'label'
	| 'labelMin'
	| 'labelValue'
	| 'labelMax'
	| 'body'
	| 'trackWrapper'
	| 'track'
	| 'fill'
	| 'thumbContainer'
	| 'thumb'
	| 'thumbDot'
	| 'marks'
	| 'mark'
	| 'markTick'
	| 'markText'
> {
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
	/**
	 * Доступное имя ползунков для скринридеров (например «Громкость»). У диапазона и точек к нему добавляется
	 * роль ползунка: «Цена: минимум», «Цена: максимум», «Громкость: точка 2». Без пропа — «Значение»,
	 * «Минимум»/«Максимум», «Точка N».
	 */
	ariaLabel?: string
}

export interface ThumbSlotProps extends BaseComponentProps<RangeVariant, 'root'> {
	/** Текущее значение ползунка */
	value: number
	/** Порядковый индекс ползунка (0 — первый) */
	index: number
}

export interface BaseRangeEmits {
	(event: 'update:modelValue', value: number): void
	(event: 'update:rangeValue', value: [number, number]): void
	(event: 'update:points', value: number[]): void
	(event: 'change', value: number | [number, number] | number[]): void
}

export interface BaseRangeSlots {
	default?: () => unknown
	thumb?: (props: { value: number; index: number }) => unknown
}

export type RangeProps = PropsWithDefaults<BaseRangeProps, 'modelValue' | 'min' | 'max' | 'step' | 'isVertical'>
