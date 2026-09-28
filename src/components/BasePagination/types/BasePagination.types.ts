import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseComponentProps } from '@composables/useBaseComponent'

export const PAGINATION_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface BasePaginationProps extends BaseComponentProps<
	(typeof PAGINATION_VARIANTS)[number],
	'root' | 'prev' | 'next' | 'pages' | 'button' | 'ellipsis'
> {
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

export interface BasePaginationEmits {
	(event: 'update:modelValue', value: number): void
	(event: 'change', value: number): void
}

export interface BasePaginationSlots {
	default?: () => unknown
}

export type PaginationProps = PropsWithDefaults<BasePaginationProps, 'pageSize' | 'maxVisible' | 'showLastPage' | 'sizeScale'>
