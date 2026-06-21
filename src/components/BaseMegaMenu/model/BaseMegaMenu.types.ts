import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты отображения мега-меню */
export const MEGA_MENU_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Узел мега-меню. Рекурсивный тип: каждый узел может иметь
 * детей того же типа без ограничения по глубине вложенности.
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
	/** Дочерние узлы (любая глубина) */
	children?: MegaMenuItem[]
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
	/** Элементы колонки (любая глубина вложенности) */
	items: MegaMenuItem[]
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
export interface BaseMegaMenuProps extends BaseComponentProps<(typeof MEGA_MENU_VARIANTS)[number], 'root' | 'container' | 'column' | 'title' | 'list' | 'nav' | 'navItem' | 'navLink' | 'dropdown'> {
	/** Колонки меню (для layout=columns) */
	columns?: MegaMenuColumn[]
	/** Элементы навигации (для layout=dropdown) */
	items?: MegaMenuItem[]
	/** Режим раскрытия подменю */
	trigger?: MegaMenuTrigger
	/** Режим отображения */
	layout?: MegaMenuLayout
	/** Задержка закрытия при hover (мс) */
	hoverDelay?: number
}

/**
 * События компонента BaseMegaMenu
 */
export interface BaseMegaMenuEmits {
	(event: 'navigate', url: string): void
	(event: 'item-click', item: MegaMenuItem): void
	(event: 'column-click', column: MegaMenuColumn): void
}

/**
 * Слоты компонента BaseMegaMenu
 */
export interface BaseMegaMenuSlots {
	/** Кастомный заголовок колонки */
	'column-title'?: (props: { column: MegaMenuColumn }) => unknown
	/** Кастомный пункт навигации (dropdown, корневой уровень) */
	'nav-item'?: (props: { item: MegaMenuItem }) => unknown
	/** Кастомный узел меню (любой уровень вложенности) */
	item?: (props: { item: MegaMenuItem; level: number }) => unknown
}
