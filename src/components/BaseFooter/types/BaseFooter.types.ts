import type { ContainerSize } from '@components/BaseContainer'
import type { LinkTo } from '@composables/interaction/useLink'
import type { SeoComponentProps } from '@composables/seo/useStructuredData'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseFooter: `default` — фон страницы и линия сверху, `soft` — приглушённый фон без линии,
 * `ghost` — прозрачный без линии
 */
export const FOOTER_VARIANTS = ['default', 'soft', 'ghost'] as const

/** `sizeScale` масштабирует отступы и кегль; `color` задаёт фон и текст. */
/** Ссылка в колонке подвала */
export interface FooterLink {
	/** Текст ссылки */
	label: string
	/** Маршрут (RouterLink) */
	to?: LinkTo
	/** Адрес */
	href?: string
}

/** Колонка ссылок: заголовок — имя навигации для скринридера */
export interface FooterColumn {
	/** Заголовок колонки: «Продукт», «Компания» */
	title: string
	/** Ссылки колонки */
	links: FooterLink[]
}

export interface BaseFooterProps extends SeoComponentProps, BaseComponentProps<(typeof FOOTER_VARIANTS)[number], 'root' | 'inner'> {
	/** Ширина содержимого подвала — как у BaseContainer: `sm`…`xl` или `full` (во всю ширину) */
	containerSize?: ContainerSize
	/** Колонки ссылок в верхней части подвала; каждая — `<nav>` с именем по заголовку */
	columns?: FooterColumn[]
	/** Компактный подвал: меньше отступы и кегль — для приложений и рабочих экранов */
	isCompact?: boolean
}

export interface BaseFooterSlots {
	/** Середина: ссылки */
	default?: () => unknown
	/** Начало: копирайт, логотип */
	start?: () => unknown
	/** Конец: соцсети, переключатель темы */
	end?: () => unknown
	/** Верхняя часть подвала слева от колонок: логотип, описание, подписка, приложения. Нижняя строка отделяется линией */
	top?: () => unknown
}
