import type { BaseComponentProps } from '@/types/base.types'

/** Варианты отображения пагинации */
export const PAGINATION_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BasePagination
 */

export interface BasePaginationProps extends BaseComponentProps<(typeof PAGINATION_VARIANTS)[number]> {
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
}

/**
 * События компонента BasePagination
 */
export interface BasePaginationEmits {
	(event: 'update:modelValue', value: number): void
	(event: 'change', value: number): void
}
