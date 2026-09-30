import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты: `default` — линии между пунктами; `ghost` — без линий; `outline`, `shadow`, `soft` — общий блок;
 * `separated` — каждый пункт отдельной карточкой с зазором
 */
export const ACCORDION_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'separated'] as const

/** Сторона стрелки в заголовке */
export const ACCORDION_ARROW_POSITIONS = ['start', 'end'] as const

/** Линия между пунктами */
export const ACCORDION_DIVIDERS = ['solid', 'dashed', 'none'] as const

/** Плотность: высота заголовка и отступы содержимого */
export const ACCORDION_DENSITIES = ['compact', 'default', 'comfortable'] as const

export type AccordionArrowPosition = (typeof ACCORDION_ARROW_POSITIONS)[number]

export type AccordionDivider = (typeof ACCORDION_DIVIDERS)[number]

export type AccordionDensity = (typeof ACCORDION_DENSITIES)[number]

export interface BaseAccordionItem {
	/** Заголовок */
	label: string
	/** Пояснение под заголовком: одна строка приглушённым цветом */
	description?: string
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
	'root' | 'item' | 'header' | 'icon' | 'label' | 'description' | 'arrow' | 'arrowIcon' | 'collapse' | 'content' | 'contentText'
> {
	/** Список элементов */
	items: BaseAccordionItem[]
	/** Возможность открывать несколько элементов */
	isMultiple?: boolean
	/** Сторона стрелки: `end` — справа (по умолчанию), `start` — перед заголовком, закрытый пункт — стрелка вправо */
	arrowPosition?: AccordionArrowPosition
	/** Показывать стрелку. Без неё пункт раскрывается так же — кликом по заголовку */
	showArrow?: boolean
	/** Значок стрелки (имя из спрайта). По умолчанию `chevron-down`; у открытого пункта поворачивается */
	expandIcon?: string
	/** Значок открытого пункта, например `minus` при `expandIcon="plus"`: значки меняются без поворота */
	collapseIcon?: string
	/** Линия между пунктами. По умолчанию — как у варианта: у `ghost` и `separated` линий нет */
	divider?: AccordionDivider
	/** Плотность: `compact` — меньше отступы, `comfortable` — больше. По умолчанию `default` */
	density?: AccordionDensity
	/** Открытый пункт выделен: заголовок и стрелка цвета primary, у `separated` — рамка primary */
	isAccented?: boolean
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
