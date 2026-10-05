import type { UiProp } from '@composables/base/useUi'
import type { LinkComponent } from '@composables/interaction/useLink'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { SeoComponentProps } from '@composables/seo/useStructuredData'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const BREADCRUMBS_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части крошек для пропа `ui` (БЭМ-элементы `.base-breadcrumbs__<часть>`, `root` — сам `<nav>`):
 * `list` — список `<ol>`; `item` — пункт `<li>`; `link` — ссылка или кнопка крошки (и ссылка «домой»);
 * `current` — текущая страница; `text` — подпись крошки; `icon` — иконка крошки; `sep` — обёртка разделителя;
 * `ellipsis-btn` — кнопка «…», раскрывающая свёрнутые крошки
 */
export const BREADCRUMBS_PARTS = ['list', 'item', 'link', 'current', 'text', 'icon', 'sep', 'ellipsis-btn'] as const

export type BaseBreadcrumbsPart = (typeof BREADCRUMBS_PARTS)[number]

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

export interface BaseBreadcrumbsProps
	extends
		SeoComponentProps,
		BaseComponentProps<
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
	/**
	 * Максимальное количество видимых элементов (0 = все). Начало пути сворачивается в «…»; раскрытые крошки
	 * проявляются с лёгким масштабом на токенах движения, при выключенном движении — сразу
	 */
	maxItems?: number
	/** Показывать иконку дома вместо первой крошки */
	showHome?: boolean
	/** Иконка дома (имя из спрайта, по умолчанию home) */
	homeIcon?: string
	/** Компонент ссылок на маршруты. По умолчанию — из плагина, RouterLink (если подключён vue-router) или `a` */
	linkComponent?: LinkComponent
	/**
	 * Классы частей крошек (`root`, `list`, `item`, `link`, `current`, `text`, `icon`, `sep`, `ellipsis-btn`) — добавляются
	 * к классам кита. Глобально — `createUiKitPlugin({ defaults: { BaseBreadcrumbs: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseBreadcrumbs :items="items" :ui="{ link: 'font-semibold', sep: 'opacity-50' }" />
	 */
	ui?: UiProp<BaseBreadcrumbsPart>
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
