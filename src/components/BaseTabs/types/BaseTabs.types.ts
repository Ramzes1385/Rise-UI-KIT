import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const TABS_VARIANTS = ['underline', 'pills', 'rounded', 'arc'] as const

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

export type TabsVariant = (typeof TABS_VARIANTS)[number]

export interface BaseTabsProps extends BaseComponentProps<
	TabsVariant,
	'root' | 'nav' | 'scrollBtn' | 'list' | 'tab' | 'icon' | 'label' | 'content'
> {
	/** Список табов */
	items: TabItem[]
	/** Активный таб (id) */
	modelValue: string
	/** Растянуть на всю ширину */
	isFullWidth?: boolean
	/** Скролл табов с кнопками навигации при переполнении */
	isScrollable?: boolean
}

export interface BaseTabsEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'change', value: string): void
}

export interface BaseTabsSlots {
	/** Содержимое выбранной вкладки — панель `tabpanel`, связанная с вкладкой */
	default?: () => unknown
	/**
	 * Содержимое одной вкладки по её `id`: `panel-orders` — вкладка `orders`. Показывается, когда вкладка выбрана;
	 * у вкладки без своего слота — `default`
	 */
	[name: `panel-${string}`]: (() => unknown) | undefined
}
