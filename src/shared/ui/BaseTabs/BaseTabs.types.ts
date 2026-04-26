import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения табов */
export const TABS_VARIANTS = ['underline', 'pills', 'rounded', 'arc'] as const

/**
 * Элемент таба
 */
export interface TabItem {
	/** Идентификатор таба */
	id: string
	/** Текст таба */
	label: string
	/** Иконка (опционально) */
	icon?: string
	/** Отключен ли таб */
	isDisabled?: boolean
}

/**
 * Вариант отображения табов
 */
export type TabsVariant = (typeof TABS_VARIANTS)[number]

/**
 * Пропсы компонента BaseTabs
 */
export interface BaseTabsProps {
	/** Список табов */
	items: TabItem[]
	/** Активный таб (id) */
	modelValue: string
	/** Вариант отображения */
	variant?: TabsVariant
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Растянуть на всю ширину */
	isFullWidth?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseTabs
 */
export interface BaseTabsEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'change', value: string): void
}
