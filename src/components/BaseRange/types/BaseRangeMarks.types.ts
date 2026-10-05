import type { UiClassFn } from '@composables/base/useUi'
import type { BaseRangePart, BaseRangeProps } from './BaseRange.types'

export interface BaseRangeMarksProps {
	/** Метки на шкале */
	marks: NonNullable<BaseRangeProps['marks']>
	/** Получение CSS-стилей для метки */
	markStyle: (value: number) => Record<string, string>
	/** Объект CSS-классов для кастомизации элементов шкалы */
	classes: Record<string, string | undefined>
	/** Классы частей шкалы: БЭМ-класс кита и классы пропа `ui` */
	ui: UiClassFn<BaseRangePart>
}
