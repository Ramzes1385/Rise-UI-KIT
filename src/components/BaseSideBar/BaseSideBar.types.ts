import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'
import type { PaddingProp } from '@composables/usePadding'

/** Варианты отображения сайдбара */
export const SIDEBAR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Элемент навигации сайдбара
 */
export interface SideBarItem {
	/** Заголовок */
	label: string
	/** Иконка */
	icon?: string
	/** Ссылка для навигации */
	to?: string
	/** Обработчик клика */
	click?: () => void
	/** Отключен ли */
	isDisabled?: boolean
	/** Разделитель после элемента */
	hasDivider?: boolean
	/** Дочерние элементы */
	children?: SideBarItem[]
}

/**
 * Пропсы компонента BaseSideBar
 */
export interface BaseSideBarProps {
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
	/** Вариант отображения */
	variant?: (typeof SIDEBAR_VARIANTS)[number]
	/**
	 * Внутренние отступы. Число (px): Y = значение, X = значение × 2.
	 * Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения
	 * (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси.
	 * По умолчанию 12 → 12px 24px
	 */
	padding?: PaddingProp
	/** Отступ между секциями (px). По умолчанию 0 */
	gap?: number
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%) */
	sizeScale?: number
	/** Состояние загрузки */
	isLoading?: boolean
	/** Элементы навигации сайдбара. Каждый элемент может содержать label, icon, to, click, isDisabled, hasDivider, children */
	items?: SideBarItem[]
	/** Кастомные классы */
	customClass?: CustomClassProp
}

/**
 * События компонента BaseSideBar
 */
export interface BaseSideBarEmits {
	(event: 'update:isCollapsed', value: boolean): void
	(event: 'collapse'): void
	(event: 'expand'): void
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
	/** Навигация */
	navigation?: () => unknown
	/** Контент в свёрнутом состоянии */
	collapsedContent?: () => unknown
}
