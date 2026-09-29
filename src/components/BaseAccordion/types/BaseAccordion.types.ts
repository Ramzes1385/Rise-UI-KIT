import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const ACCORDION_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface BaseAccordionItem {
	/** Заголовок */
	label: string
	/** Контент */
	content?: string
	/** Слот для контента */
	slot?: string
	/** Иконка заголовка (имя из спрайта) */
	icon?: string
	/** Отключен ли элемент */
	isDisabled?: boolean
	/** Открыт ли по умолчанию */
	defaultOpen?: boolean
}

export interface BaseAccordionProps extends BaseComponentProps<
	(typeof ACCORDION_VARIANTS)[number],
	'root' | 'item' | 'header' | 'icon' | 'label' | 'arrow' | 'arrowIcon' | 'collapse' | 'content' | 'contentText'
> {
	/** Список элементов */
	items: BaseAccordionItem[]
	/** Возможность открывать несколько элементов */
	isMultiple?: boolean
}

export interface BaseAccordionEmits {
	(event: 'toggle', index: number, isOpen: boolean): void
}

export interface BaseAccordionSlots {
	/** Контент элемента аккордеона */
	default?: (props: { item: BaseAccordionItem }) => unknown
	/** Динамические слоты для контента элементов (определяются через item.slot) */
	[key: string]: ((props: { item: BaseAccordionItem }) => unknown) | undefined
}
