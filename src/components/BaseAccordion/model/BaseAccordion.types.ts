import type { BaseComponentProps } from '@/types/base.types'

/** Варианты отображения аккордеона */
export const ACCORDION_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Элемент аккордеона
 */
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

/**
 * Пропсы компонента BaseAccordion
 */
export interface BaseAccordionProps extends BaseComponentProps<(typeof ACCORDION_VARIANTS)[number]> {
	/** Список элементов */
	items: BaseAccordionItem[]
	/** Возможность открывать несколько элементов */
	isMultiple?: boolean
}

/**
 * События компонента BaseAccordion
 */
export interface BaseAccordionEmits {
	(event: 'toggle', index: number, isOpen: boolean): void
}

/**
 * Слоты компонента BaseAccordion
 */
export interface BaseAccordionSlots {
	/** Контент элемента аккордеона */
	default?: (props: { item: BaseAccordionItem }) => unknown
	/** Динамические слоты для контента элементов (определяются через item.slot) */
	[key: string]: ((props: { item: BaseAccordionItem }) => unknown) | undefined
}
