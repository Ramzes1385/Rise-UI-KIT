import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** У каркаса одно оформление: фон и рамки задают шапка, меню и подвал внутри */
export const LAYOUT_VARIANTS = ['default'] as const

/**
 * Части каркаса для пропа `ui`: root — корень, skip-link — ссылка «Перейти к содержимому», header — обёртка шапки,
 * body — ряд меню и содержимого, sidebar — обёртка бокового меню, content — колонка содержимого, main — `<main>`,
 * footer — обёртка подвала
 */
export const LAYOUT_PARTS = ['root', 'skip-link', 'header', 'body', 'sidebar', 'content', 'main', 'footer'] as const

export type BaseLayoutPart = (typeof LAYOUT_PARTS)[number]

/** `sizeScale` масштабирует ссылку «Перейти к содержимому»; `variant` и `color` не используются. */
export interface BaseLayoutProps extends BaseComponentProps<
	(typeof LAYOUT_VARIANTS)[number],
	'root' | 'header' | 'sidebar' | 'main' | 'footer'
> {
	/** Ссылка «Перейти к содержимому» — первая остановка Tab: переносит фокус в `<main>` мимо шапки и меню */
	hasSkipLink?: boolean
	/** Текст ссылки (по умолчанию из словаря: «Перейти к содержимому») */
	skipLinkLabel?: string
	/** id элемента `<main>` (по умолчанию генерируется) */
	mainId?: string
	/** Шапка прилипает к верху окна при прокрутке, боковое меню — под шапкой */
	isHeaderSticky?: boolean
	/** Боковое меню видно и на узком экране (меньше 768px). По умолчанию там оно скрыто: навигацию открывает меню BaseHeader */
	isSidebarVisibleOnMobile?: boolean
	/**
	 * Классы частей каркаса: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseLayout.ui`.
	 *
	 * @example
	 * <BaseLayout :ui="{ sidebar: 'border-e', main: 'p-6' }" />
	 */
	ui?: UiProp<BaseLayoutPart>
}

export interface BaseLayoutSlots {
	/** Основное содержимое — внутри `<main>` */
	default?: () => unknown
	/** Шапка: BaseHeader */
	header?: () => unknown
	/** Боковое меню: BaseSideBar */
	sidebar?: () => unknown
	/** Подвал: BaseFooter */
	footer?: () => unknown
}
