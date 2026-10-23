import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { SeoComponentProps } from '@composables/seo/useStructuredData'
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

/** Уровень заголовка пункта: `<h2>`…`<h6>` */
export const ACCORDION_HEADING_LEVELS = [2, 3, 4, 5, 6] as const

/**
 * Части аккордеона для пропа `ui` (БЭМ-элементы `.base-accordion__<часть>`, `root` — корень):
 * item — пункт; heading — заголовок `<hN>`; header — кнопка пункта; icon — иконка заголовка; title — обёртка подписи и пояснения;
 * label — подпись; description — пояснение под подписью; arrow — стрелка; collapse — раскрывающаяся панель;
 * content — содержимое панели; text — текст пункта из `content` (без слота).
 */
export const ACCORDION_PARTS = [
	'item',
	'heading',
	'header',
	'icon',
	'title',
	'label',
	'description',
	'arrow',
	'collapse',
	'content',
	'text',
] as const

export type BaseAccordionPart = (typeof ACCORDION_PARTS)[number]

export type AccordionHeadingLevel = (typeof ACCORDION_HEADING_LEVELS)[number]

export type AccordionArrowPosition = (typeof ACCORDION_ARROW_POSITIONS)[number]

export type AccordionDivider = (typeof ACCORDION_DIVIDERS)[number]

export type AccordionDensity = (typeof ACCORDION_DENSITIES)[number]

export interface BaseAccordionItem {
	/** Ключ пункта для `v-model:open` и для сохранения открытых пунктов при смене `items`. По умолчанию — `label` */
	id?: string
	/** Заголовок */
	label: string
	/** Пояснение под заголовком: одна строка приглушённым цветом */
	description?: string
	/** Контент */
	content?: string
	/** Ответ для SEO-разметки FAQPage, когда содержимое — слот. По умолчанию — `content` */
	seoAnswer?: string
	/** Слот для контента */
	slot?: string
	/** Иконка заголовка (имя из спрайта) */
	icon?: string
	/** Отключен ли элемент */
	isDisabled?: boolean
	/** Открыт ли по умолчанию. Без `isMultiple` открывается только первый такой пункт */
	defaultOpen?: boolean
}

export interface BaseAccordionProps
	extends
		SeoComponentProps,
		BaseComponentProps<
			(typeof ACCORDION_VARIANTS)[number],
			| 'root'
			| 'item'
			| 'heading'
			| 'header'
			| 'icon'
			| 'label'
			| 'description'
			| 'arrow'
			| 'arrowIcon'
			| 'collapse'
			| 'content'
			| 'contentText'
		> {
	/** Список элементов; по умолчанию пустой — аккордеон ничего не рисует и не падает */
	items?: BaseAccordionItem[]
	/** Возможность открывать несколько элементов */
	isMultiple?: boolean
	/** Открытые пункты — ключи (`id`, иначе `label`), `v-model:open`. Без него открытием управляет сам аккордеон, начиная с `defaultOpen` */
	open?: string[]
	/** Уровень заголовка пункта (`<h3>` по умолчанию): кнопка пункта — внутри заголовка, как в шаблоне Accordion WAI-ARIA */
	headingLevel?: AccordionHeadingLevel
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
	/**
	 * Классы частей аккордеона (`root`, `item`, `header`, `label`, `arrow`, `collapse`, `content`…) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseAccordion: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseAccordion :items="items" :ui="{ header: 'font-semibold', content: 'text-base' }" />
	 */
	ui?: UiProp<BaseAccordionPart>
}

export interface BaseAccordionEmits {
	/** Пункт открыт или закрыт; при открытии другого пункта без `isMultiple` сначала приходит закрытие прежнего */
	(event: 'toggle', index: number, isOpen: boolean): void
	/** Новый список открытых пунктов (`v-model:open`) */
	(event: 'update:open', value: string[]): void
}

export interface BaseAccordionSlots {
	/** Контент элемента аккордеона */
	default?: (props: { item: BaseAccordionItem }) => unknown
	/** Динамические слоты для контента элементов (определяются через item.slot) */
	[key: string]: ((props: { item: BaseAccordionItem }) => unknown) | undefined
}

/** Пропсы аккордеона после значений по умолчанию: `items` всегда массив */
export type AccordionProps = PropsWithDefaults<BaseAccordionProps, 'items'>
