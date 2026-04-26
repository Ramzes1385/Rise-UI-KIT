import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения мега-меню */
export const MEGA_MENU_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Элемент 3-го уровня мега-меню
 */
export interface MegaMenuSubItem {
	/** Заголовок */
	label: string
	/** Ссылка маршрута */
	to?: string
	/** Внешняя ссылка */
	href?: string
	/** Target ссылки */
	target?: '_blank' | '_self'
	/** Иконка (имя из спрайта) */
	icon?: string
	/** Отключено */
	isDisabled?: boolean
}

/**
 * Элемент 2-го уровня мега-меню
 */
export interface MegaMenuItem {
	/** Заголовок */
	label: string
	/** Ссылка маршрута */
	to?: string
	/** Внешняя ссылка */
	href?: string
	/** Target ссылки */
	target?: '_blank' | '_self'
	/** Описание */
	description?: string
	/** Иконка (имя из спрайта) */
	icon?: string
	/** Отключено */
	isDisabled?: boolean
	/** Дочерние элементы 3-го уровня */
	children?: MegaMenuSubItem[]
}

/**
 * Колонка мега-меню (layout=columns)
 */
export interface MegaMenuColumn {
	/** Заголовок колонки */
	title: string
	/** Иконка колонки (имя из спрайта) */
	icon?: string
	/** Ссылка маршрута заголовка */
	to?: string
	/** Внешняя ссылка заголовка */
	href?: string
	/** Элементы колонки */
	items: MegaMenuItem[]
}

/**
 * Элемент навигации (layout=dropdown)
 */
export interface MegaMenuNavItem {
	/** Заголовок */
	label: string
	/** Ссылка маршрута */
	to?: string
	/** Внешняя ссылка */
	href?: string
	/** Target ссылки */
	target?: '_blank' | '_self'
	/** Иконка (имя из спрайта) */
	icon?: string
	/** Отключено */
	isDisabled?: boolean
	/** Описание (для 2-го уровня) */
	description?: string
	/** Дочерние элементы */
	children?: MegaMenuNavItem[]
}

/**
 * Режим раскрытия подменю
 */
export type MegaMenuTrigger = 'click' | 'hover'

/**
 * Режим отображения мега-меню
 */
export type MegaMenuLayout = 'columns' | 'dropdown'

/**
 * Пропсы компонента BaseMegaMenu
 */
export interface BaseMegaMenuProps {
	/** Колонки меню (для layout=columns) */
	columns?: MegaMenuColumn[]
	/** Элементы навигации (для layout=dropdown) */
	items?: MegaMenuNavItem[]
	/** Режим раскрытия подменю */
	trigger?: MegaMenuTrigger
	/** Режим отображения */
	layout?: MegaMenuLayout
	/** Задержка закрытия при hover (мс) */
	hoverDelay?: number
	/** Вариант отображения */
	variant?: (typeof MEGA_MENU_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseMegaMenu
 */
export interface BaseMegaMenuEmits {
	(event: 'navigate', url: string): void
	(event: 'item-click', item: MegaMenuItem | MegaMenuNavItem): void
	(event: 'sub-click', item: MegaMenuSubItem): void
	(event: 'column-click', column: MegaMenuColumn): void
}

/**
 * Слоты компонента BaseMegaMenu
 */
export interface BaseMegaMenuSlots {
	/** Кастомный заголовок колонки */
	'column-title'?: (props: { column: MegaMenuColumn }) => unknown
	/** Кастомный элемент 2-го уровня */
	item?: (props: { item: MegaMenuItem }) => unknown
	/** Кастомный элемент 3-го уровня */
	'sub-item'?: (props: { item: MegaMenuSubItem }) => unknown
	/** Кастомный элемент навигации (dropdown) */
	'nav-item'?: (props: { item: MegaMenuNavItem }) => unknown
	/** Кастомный контент dropdown-панели */
	'dropdown-content'?: (props: { item: MegaMenuNavItem }) => unknown
	/** Кастомная ссылка элемента */
	'item-link'?: (props: { item: MegaMenuItem | MegaMenuSubItem | MegaMenuNavItem }) => unknown
}
