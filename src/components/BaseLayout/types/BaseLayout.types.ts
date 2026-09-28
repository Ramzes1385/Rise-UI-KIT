import type { BaseComponentProps } from '@composables/useBaseComponent'

/** У каркаса одно оформление: фон и рамки задают шапка, меню и подвал внутри */
export const LAYOUT_VARIANTS = ['default'] as const

/**
 * Пропсы компонента BaseLayout.
 * `sizeScale` масштабирует ссылку «Перейти к содержимому»; `variant` и `color` не используются.
 */
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
}

/**
 * Слоты компонента BaseLayout
 */
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
