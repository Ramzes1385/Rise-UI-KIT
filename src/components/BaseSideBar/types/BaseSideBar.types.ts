import type { Component } from 'vue'
import type { PaddingProp } from '@composables/usePadding'
import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseComponentProps } from '@composables/useBaseComponent'

export const SIDEBAR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type SideBarItemKey = string | number

/**
 * Значение для перехода.
 *
 * string удобно использовать для обычных ссылок и route.path.
 * object удобно использовать для RouterLink-compatible объектов.
 */
export type SideBarItemTo = string | Record<string, unknown>

export type SideBarActiveMatch = 'exact' | 'startsWith'

export interface SideBarItem {
	/** Уникальный ключ пункта */
	key?: SideBarItemKey

	/** Заголовок пункта */
	label: string

	/** Иконка пункта */
	icon?: string

	/** Ссылка для навигации */
	to?: SideBarItemTo

	/** Бейдж справа от пункта */
	badge?: string | number

	/** Обработчик клика */
	click?: (item: SideBarItem, event: MouseEvent) => void

	/** Принудительно активное состояние */
	isActive?: boolean

	/** Отключен ли пункт */
	isDisabled?: boolean

	/** Разделитель после элемента */
	hasDivider?: boolean

	/** Дочерние элементы */
	children?: SideBarItem[]
}

/**
 * Props, которые передаются в слоты item/icon/label/badge
 */
export interface BaseSideBarItemSlotProps extends BaseComponentProps<(typeof SIDEBAR_VARIANTS)[number], 'root'> {
	/** Элемент навигации */
	item: SideBarItem

	/** Уровень вложенности */
	level: number

	/** Активен ли пункт или его дочерний элемент */
	isActive: boolean

	/** Является ли пункт текущим выбранным пунктом */
	isCurrent: boolean

	/** Свёрнут ли сайдбар */
	isCollapsed: boolean

	/** Есть ли дочерние элементы */
	hasChildren: boolean

	/** Обработчик клика по пункту */
	onClick: (event: MouseEvent) => void
}

export interface BaseSideBarProps extends BaseComponentProps<
	(typeof SIDEBAR_VARIANTS)[number],
	'root' | 'header' | 'title' | 'toggle' | 'navigation' | 'loading' | 'body' | 'footer' | 'collapsed'
> {
	/** v-model свёрнутого состояния (undefined = внутреннее управление) */
	isCollapsed?: boolean

	/** Заголовок сайдбара */
	title?: string

	/** Ширина раскрытой панели (px) */
	width?: number

	/** Ширина свёрнутой панели (px) */
	collapsedWidth?: number

	/** Можно ли сворачивать */
	isCollapsible?: boolean

	/**
	 * Внутренние отступы.
	 *
	 * Число (px): Y = значение, X = значение × 2.
	 * Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения
	 * (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам);
	 * стороны переопределяют оси.
	 *
	 * Отступы применяются к шапке, навигации, телу и подвалу панели.
	 * По умолчанию — из стилей: 8px сверху/снизу, 12px по бокам (inline-переменные не пишутся).
	 */
	padding?: PaddingProp

	/**
	 * Отступ между пунктами навигации (px).
	 *
	 * По умолчанию 4
	 */
	gap?: number

	/** Состояние загрузки */
	isLoading?: boolean

	/**
	 * Элементы навигации сайдбара.
	 *
	 * Если передан slot navigation, то в раскрытом состоянии он имеет приоритет над items.
	 */
	items?: SideBarItem[]

	/**
	 * Активный пункт по ключу.
	 *
	 * Удобно, когда активное состояние не завязано на URL.
	 */
	activeKey?: SideBarItemKey

	/**
	 * Активный путь.
	 *
	 * Обычно сюда передаётся текущий route.path из приложения.
	 */
	activePath?: string

	/**
	 * Способ сравнения activePath и item.to.
	 *
	 * exact — активен только при полном совпадении.
	 * startsWith — активен, если activePath начинается с item.to.
	 */
	activeMatch?: SideBarActiveMatch

	/**
	 * Компонент для ссылок.
	 *
	 * По умолчанию — `linkComponent` из `createUiKitPlugin`, RouterLink (если в приложении подключён vue-router)
	 * или `a`: UI Kit не зависит от vue-router. Внешние адреса (`https://…`) всегда открываются обычной ссылкой.
	 */
	linkComponent?: string | Component
}

export interface BaseSideBarEmits {
	/** Обновление v-model:isCollapsed */
	(event: 'update:isCollapsed', value: boolean): void

	/** Сайдбар был свёрнут */
	(event: 'collapse'): void

	/** Сайдбар был развёрнут */
	(event: 'expand'): void

	/** Клик по пункту навигации */
	(event: 'itemClick', item: SideBarItem, nativeEvent: MouseEvent): void
}

export interface BaseSideBarSlots {
	/** Основной контент */
	default?: () => unknown

	/** Заголовок (замещает title) */
	header?: () => unknown

	/** Подвал */
	footer?: () => unknown

	/**
	 * Полностью кастомная навигация.
	 *
	 * В раскрытом состоянии имеет приоритет над items.
	 */
	navigation?: () => unknown

	/** Контент в свёрнутом состоянии */
	collapsedContent?: () => unknown

	/** Кастомный рендер всего пункта меню */
	item?: (props: BaseSideBarItemSlotProps) => unknown

	/** Кастомный рендер иконки пункта */
	icon?: (props: BaseSideBarItemSlotProps) => unknown

	/** Кастомный рендер текста пункта */
	label?: (props: BaseSideBarItemSlotProps) => unknown

	/** Кастомный рендер бейджа */
	badge?: (props: BaseSideBarItemSlotProps) => unknown
}

export interface BaseSideBarNavigationProps extends BaseComponentProps<(typeof SIDEBAR_VARIANTS)[number], 'root'> {
	/** Элементы навигации */
	items?: SideBarItem[]

	/** Уровень вложенности */
	level?: number

	/** Активный ключ */
	activeKey?: SideBarItemKey

	/** Активный путь */
	activePath?: string

	/** Режим сравнения activePath */
	activeMatch?: SideBarActiveMatch

	/** Компонент ссылки */
	linkComponent?: string | Component

	/** Свёрнут ли сайдбар */
	isCollapsed?: boolean
}

export interface BaseSideBarNavigationEmits {
	/** Клик по пункту навигации */
	(event: 'itemClick', item: SideBarItem, nativeEvent: MouseEvent): void
}

export interface BaseSideBarNavigationSlots {
	/** Кастомный рендер всего пункта */
	item?: (props: BaseSideBarItemSlotProps) => unknown

	/** Кастомный рендер иконки */
	icon?: (props: BaseSideBarItemSlotProps) => unknown

	/** Кастомный рендер текста */
	label?: (props: BaseSideBarItemSlotProps) => unknown

	/** Кастомный рендер бейджа */
	badge?: (props: BaseSideBarItemSlotProps) => unknown
}

export type SideBarProps = PropsWithDefaults<BaseSideBarProps, 'isCollapsible'>
