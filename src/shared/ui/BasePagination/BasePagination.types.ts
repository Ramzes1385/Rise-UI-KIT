import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения пагинации */
export const PAGINATION_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BasePagination
 */
export interface BasePaginationProps {
	/** Текущая страница */
	modelValue: number
	/** Всего элементов */
	total: number
	/** Элементов на странице */
	pageSize?: number
	/** Количество отображаемых кнопок */
	maxVisible?: number
	/** Вариант отображения */
	variant?: (typeof PAGINATION_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BasePagination
 */
export interface BasePaginationEmits {
	(event: 'update:modelValue', value: number): void
	(event: 'change', value: number): void
}
