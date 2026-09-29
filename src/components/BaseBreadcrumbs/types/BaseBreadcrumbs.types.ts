import type { LinkComponent } from '@composables/interaction/useLink'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const BREADCRUMBS_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface BreadcrumbItem {
	/** Заголовок */
	label: string
	/** Маршрут приложения: ссылка RouterLink (из плагина или vue-router) или `<a href>` */
	to?: string
	/** Внешний адрес: `<a href>`, по умолчанию в новой вкладке */
	href?: string
	/** Где открыть ссылку. Для `href` по умолчанию `_blank`, для `to` — текущая вкладка */
	target?: '_blank' | '_self'
	/** Иконка (имя из спрайта) */
	icon?: string
}

export type BreadcrumbSeparator = 'slash' | 'chevron' | 'dot' | 'arrow'

export interface BaseBreadcrumbsProps extends BaseComponentProps<
	(typeof BREADCRUMBS_VARIANTS)[number],
	| 'root'
	| 'list'
	| 'item'
	| 'ellipsisBtn'
	| 'link'
	| 'current'
	| 'separator'
	| 'separatorIcon'
	| 'separatorText'
	| 'homeIcon'
	| 'itemIcon'
	| 'itemText'
	| 'currentIcon'
	| 'currentText'
> {
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
	/** Компонент ссылок на маршруты. По умолчанию — из плагина, RouterLink (если подключён vue-router) или `a` */
	linkComponent?: LinkComponent
}

export interface BaseBreadcrumbsEmits {
	/** Переход по крошке с адресом: переходит сама ссылка, событие — для аналитики и закрытия меню */
	(event: 'navigate', url: string): void
	/** Клик по крошке, в том числе без адреса (такую крошку приложение обрабатывает само) */
	(event: 'item-click', item: BreadcrumbItem): void
}

export interface BaseBreadcrumbsSlots {
	/** Кастомный элемент крошки */
	item?: (props: { item: BreadcrumbItem; index: number }) => unknown
	/** Кастомный разделитель */
	separator?: (props: { index: number }) => unknown
	/** Кастомная иконка дома */
	home?: () => unknown
}

export type BreadcrumbsProps = PropsWithDefaults<BaseBreadcrumbsProps, 'maxItems' | 'showHome' | 'sizeScale'>
