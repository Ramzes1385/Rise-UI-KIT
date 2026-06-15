import type { BaseComponentProps } from '@/types/base.types'

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
export interface BaseTabsProps extends BaseComponentProps<TabsVariant> {
	/** Список табов */
	items: TabItem[]
	/** Активный таб (id) */
	modelValue: string
	/** Растянуть на всю ширину */
	isFullWidth?: boolean
	/** Скролл табов с кнопками навигации при переполнении */
	isScrollable?: boolean
}

/**
 * События компонента BaseTabs
 */
export interface BaseTabsEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'change', value: string): void
}
