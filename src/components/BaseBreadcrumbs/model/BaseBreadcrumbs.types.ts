import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты отображения хлебных крошек */
export const BREADCRUMBS_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Элемент хлебных крошек
 */
export interface BreadcrumbItem {
	/** Заголовок */
	label: string
	/** Ссылка маршрута */
	to?: string
	/** Внешняя ссылка */
	href?: string
	/** Иконка (имя из спрайта) */
	icon?: string
}

/**
 * Разделитель хлебных крошек
 */
export type BreadcrumbSeparator = 'slash' | 'chevron' | 'dot' | 'arrow'

/**
 * Пропсы компонента BaseBreadcrumbs
 */

export interface BaseBreadcrumbsProps extends BaseComponentProps<(typeof BREADCRUMBS_VARIANTS)[number], 'root' | 'list' | 'item' | 'ellipsisBtn' | 'link' | 'current' | 'separator' | 'separatorIcon' | 'separatorText' | 'homeIcon' | 'itemIcon' | 'itemText' | 'currentIcon' | 'currentText'> {
	/** Элементы крошек */
	items: BreadcrumbItem[]
	/** Разделитель */
	separator?: BreadcrumbSeparator
	/** Максимальное количество видимых элементов (0 = все) */
	maxItems?: number
	/** Показывать иконку дома вместо первой крошки */
	showHome?: boolean
	/** Иконка дома (имя из спрайта, по умолчанию home) */
	homeIcon?: string
}

/**
 * События компонента BaseBreadcrumbs
 */
export interface BaseBreadcrumbsEmits {
	(event: 'navigate', url: string): void
	(event: 'item-click', item: BreadcrumbItem): void
}

/**
 * Слоты компонента BaseBreadcrumbs
 */
export interface BaseBreadcrumbsSlots {
	/** Кастомный элемент крошки */
	item?: (props: { item: BreadcrumbItem; index: number }) => unknown
	/** Кастомный разделитель */
	separator?: (props: { index: number }) => unknown
	/** Кастомная иконка дома */
	home?: () => unknown
}
