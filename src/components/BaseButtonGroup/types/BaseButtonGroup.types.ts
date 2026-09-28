import type { BaseComponentProps } from '@composables/useBaseComponent'

/** Вариант оформления один: вид задают кнопки внутри */
export const BUTTON_GROUP_VARIANTS = ['default'] as const

export interface BaseButtonGroupProps extends BaseComponentProps<(typeof BUTTON_GROUP_VARIANTS)[number], 'root'> {
	/** Направление: кнопки в ряд или столбиком */
	orientation?: 'horizontal' | 'vertical'
	/** Имя группы для скринридера, например «Выравнивание текста» */
	ariaLabel?: string
}

export interface BaseButtonGroupSlots {
	/** Кнопки (BaseButton, BaseSplitButton, BaseDropdownMenu с кнопкой) */
	default?: () => unknown
}
