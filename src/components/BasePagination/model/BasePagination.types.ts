import type { CustomColor } from '@composables/useCustomColor'

/** Варианты отображения пагинации */
export const PAGINATION_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BasePagination
 */
import type { CustomClassProp } from '@composables/useCustomClass'

export interface BasePaginationProps {
	/** Текущая страница */
	modelValue: number
	/** Всего элементов */
	total: number
	/** Элементов на странице */
	pageSize?: number
	/** Количество отображаемых кнопок (включая первую и последнюю) */
	maxVisible?: number
	/** Показывать последнюю страницу всегда */
	showLastPage?: boolean
	/** Вариант отображения */
	variant?: (typeof PAGINATION_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомные классы */
	customClass?: CustomClassProp
}

/**
 * События компонента BasePagination
 */
export interface BasePaginationEmits {
	(event: 'update:modelValue', value: number): void
	(event: 'change', value: number): void
}
