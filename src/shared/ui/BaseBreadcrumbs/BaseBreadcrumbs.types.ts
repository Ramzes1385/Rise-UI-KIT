import type { CustomColor } from '@/shared/composables/useCustomColor'

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
 * Размер хлебных крошек
 */
export type BreadcrumbSize = 'sm' | 'md' | 'lg'

/**
 * Пропсы компонента BaseBreadcrumbs
 */
export interface BaseBreadcrumbsProps {
	/** Элементы крошек */
	items: BreadcrumbItem[]
	/** Разделитель */
	separator?: BreadcrumbSeparator
	/** Вариант отображения */
	variant?: (typeof BREADCRUMBS_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Размер */
	size?: BreadcrumbSize
	/** Максимальное количество видимых элементов (0 = все) */
	maxItems?: number
	/** Показывать иконку дома вместо первой крошки */
	showHome?: boolean
	/** Иконка дома (имя из спрайта, по умолчанию chevron-left) */
	homeIcon?: string
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
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
