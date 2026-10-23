import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const TABS_VARIANTS = ['underline', 'pills', 'rounded', 'arc'] as const

/**
 * Части вкладок для пропа `ui` (БЭМ-элементы `.base-tabs__<часть>`, `root` — сам компонент):
 * nav — строка со списком и кнопками прокрутки; scroll-btn — кнопки прокрутки (`isScrollable`); list — список вкладок
 * `tablist`; indicator — один скользящий индикатор выбранной вкладки (линия у `underline` и `arc`, подложка у `pills`
 * и `rounded`); tab — вкладка; icon — обёртка значка; label — подпись; content — панель `tabpanel`; panel — содержимое
 * выбранной вкладки внутри панели (меняется с мягким переходом).
 */
export const TABS_PARTS = ['nav', 'scroll-btn', 'list', 'indicator', 'tab', 'icon', 'label', 'content', 'panel'] as const

export type BaseTabsPart = (typeof TABS_PARTS)[number]

export interface TabItem {
	/** Идентификатор таба */
	id: string
	/** Текст таба */
	label: string
	/**
	 * Имя иконки BaseIcon перед текстом (`'settings'`). Значок декоративный: имя вкладки — только `label`.
	 * Своя разметка значка — слот `icon`
	 */
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
	/**
	 * Активный таб (id). Индикатор выбранной вкладки переезжает к новой, содержимое панели сменяется мягким
	 * появлением; при выключенном движении — сразу
	 */
	modelValue: string
	/** Растянуть на всю ширину */
	isFullWidth?: boolean
	/**
	 * Скролл табов с кнопками навигации при переполнении. Кнопки прокрутки появляются и исчезают плавно. Без него при
	 * переполнении край, за которым есть вкладки, затухает; выбранная вкладка в любом случае прокручивается в видимую часть
	 */
	isScrollable?: boolean
	/**
	 * Классы частей вкладок (`root`, `nav`, `scroll-btn`, `list`, `indicator`, `tab`, `icon`, `label`, `content`, `panel`) —
	 * добавляются к классам кита. Глобально — `createUiKitPlugin({ defaults: { BaseTabs: { ui } } })`, классы плагина
	 * и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseTabs v-model="tab" :items="items" :ui="{ list: 'shadow-sm', indicator: 'bg-brand' }" />
	 */
	ui?: UiProp<BaseTabsPart>
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
	/** Свой значок вкладки вместо BaseIcon по `item.icon`; показывается у каждой вкладки. Обёртка значка — `aria-hidden` */
	icon?: (props: { item: TabItem }) => unknown
}
