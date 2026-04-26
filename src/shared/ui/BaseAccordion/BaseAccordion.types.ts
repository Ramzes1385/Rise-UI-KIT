import type { CustomColor } from '@/shared/composables/useCustomColor'

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
export interface BaseAccordionProps {
	/** Список элементов */
	items: BaseAccordionItem[]
	/** Возможность открывать несколько элементов */
	isMultiple?: boolean
	/** Вариант отображения */
	variant?: (typeof ACCORDION_VARIANTS)[number]
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомный цвет компонента */
	color?: CustomColor
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
