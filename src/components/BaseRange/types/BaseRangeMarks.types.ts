import type { BaseRangeProps } from './BaseRange.types'

/** Props компонента BaseRangeMarks */
export interface BaseRangeMarksProps {
	/** Метки на шкале */
	marks: NonNullable<BaseRangeProps['marks']>
	/** Получение CSS-стилей для метки */
	markStyle: (value: number) => Record<string, string>
	/** Объект CSS-классов для кастомизации элементов шкалы */
	classes: Record<string, string | undefined>
}
