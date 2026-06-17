import type { BaseComponentProps } from '@/types/base.types'
import type { PaddingProp } from '@composables/usePadding'
import type { Component } from 'vue'

/** Варианты отображения сайдбара */
export const SIDEBAR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Уникальный ключ пункта меню */
export type SideBarItemKey = string | number

/**
 * Значение для перехода.
 *
 * string удобно использовать для обычных ссылок и route.path.
 * object удобно использовать для RouterLink-compatible объектов.
 */
export type SideBarItemTo = string | Record<string, unknown>

/** Режим определения активного пункта */
export type SideBarActiveMatch = 'exact' | 'startsWith'

/**
 * Элемент навигации сайдбара
 */
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
export interface BaseSideBarItemSlotProps extends BaseComponentProps<(typeof SIDEBAR_VARIANTS)[number]> {
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

/**
 * Пропсы компонента BaseSideBar
 */
export interface BaseSideBarProps extends BaseComponentProps<(typeof SIDEBAR_VARIANTS)[number]> {
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
	 * По умолчанию 12 → 12px 24px
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
	 * По умолчанию используется `a`, чтобы UI Kit не зависел от vue-router.
	 * В приложении можно передать `RouterLink` или строку `RouterLink`.
	 */
	linkComponent?: string | Component

}

/**
 * События компонента BaseSideBar
 */
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

/**
 * Слоты компонента BaseSideBar
 */
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

/**
 * Пропсы внутреннего компонента навигации BaseSideBarNavigation
 */
export interface BaseSideBarNavigationProps extends BaseComponentProps<(typeof SIDEBAR_VARIANTS)[number]> {
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

/**
 * События внутреннего компонента навигации BaseSideBarNavigation
 */
export interface BaseSideBarNavigationEmits {
	/** Клик по пункту навигации */
	(event: 'itemClick', item: SideBarItem, nativeEvent: MouseEvent): void
}

/**
 * Слоты внутреннего компонента навигации BaseSideBarNavigation
 */
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
