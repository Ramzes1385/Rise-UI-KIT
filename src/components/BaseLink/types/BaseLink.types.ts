import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { LinkComponent, LinkTo } from '@composables/interaction/useLink'

/**
 * Варианты BaseLink: `default` — цвет ссылки (primary) и тонкое подчёркивание, для ссылок в тексте;
 * `ghost` — цвет текста вокруг, подчёркивание при наведении, для навигации и списков ссылок
 */
export const LINK_VARIANTS = ['default', 'ghost'] as const

export interface BaseLinkProps extends BaseComponentProps<(typeof LINK_VARIANTS)[number], 'root' | 'external'> {
	/** Маршрут приложения: строка или объект для RouterLink. Внешний адрес (`https://…`) открывается обычной ссылкой */
	to?: LinkTo
	/** Адрес вне приложения: всегда `<a href>` */
	href?: string
	/** Где открыть: `_blank` — в новой вкладке (добавляются `rel="noopener noreferrer"` и подсказка для скринридера) */
	target?: '_blank' | '_self' | '_parent' | '_top'
	/** Отношение к ссылке, например `nofollow` */
	rel?: string
	/** Текст ссылки (заменяется слотом default) */
	label?: string
	/** Отключённая ссылка: без адреса, не получает фокус, `aria-disabled` */
	isDisabled?: boolean
	/** Компонент ссылок на маршруты. По умолчанию — из плагина, RouterLink (если подключён vue-router) или `a` */
	linkComponent?: LinkComponent
}

export interface BaseLinkEmits {
	/** Клик по ссылке (у отключённой не приходит) */
	(event: 'click', e: MouseEvent): void
}

export interface BaseLinkSlots {
	/** Содержимое вместо label */
	default?: () => unknown
}
