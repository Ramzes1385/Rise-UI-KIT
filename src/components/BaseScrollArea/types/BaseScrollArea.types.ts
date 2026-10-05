import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** У области одно оформление: тонкая полоса прокрутки поверх содержимого */
export const SCROLL_AREA_VARIANTS = ['default'] as const

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both'

/** Когда видна полоса прокрутки: `hover` — при наведении, прокрутке и фокусе, `always` — всегда */
export type ScrollAreaScrollbar = 'hover' | 'always'

/**
 * Части области для пропа `ui`: root — корень, viewport — прокручиваемый элемент, content — обёртка содержимого,
 * bar — дорожка полосы прокрутки, thumb — ползунок
 */
export const SCROLL_AREA_PARTS = ['root', 'viewport', 'content', 'bar', 'thumb'] as const

export type BaseScrollAreaPart = (typeof SCROLL_AREA_PARTS)[number]

/** `sizeScale` масштабирует толщину полосы; `variant` и `color` не используются. */
export interface BaseScrollAreaProps extends BaseComponentProps<
	(typeof SCROLL_AREA_VARIANTS)[number],
	'root' | 'viewport' | 'bar' | 'thumb'
> {
	/** Направление прокрутки */
	orientation?: ScrollAreaOrientation
	/** Наибольшая высота: число — в пикселях, строка — любая CSS-длина (`50vh`) */
	maxHeight?: number | string
	/** Когда видна полоса прокрутки */
	scrollbar?: ScrollAreaScrollbar
	/** Имя области: с ним она становится ориентиром (`role="region"`) */
	ariaLabel?: string
	/**
	 * Классы частей области: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseScrollArea.ui`.
	 *
	 * @example
	 * <BaseScrollArea :ui="{ viewport: 'pe-3', thumb: 'opacity-80' }" />
	 */
	ui?: UiProp<BaseScrollAreaPart>
}

export interface BaseScrollAreaEmits {
	(event: 'scroll', value: Event): void
}

export interface BaseScrollAreaSlots {
	/** Прокручиваемое содержимое */
	default?: () => unknown
}

export interface BaseScrollAreaExpose {
	/** Прокрутить область, как `element.scrollTo` */
	scrollTo: (options: { top?: number; left?: number; behavior?: 'auto' | 'smooth' | 'instant' }) => void
	/** К началу */
	scrollToTop: () => void
	/** К концу */
	scrollToBottom: () => void
	/** Пересчитать полосы (после изменения содержимого без смены размеров) */
	update: () => void
	/** Прокручиваемый элемент */
	getViewport: () => HTMLElement | null
}

export type Axis = 'x' | 'y'
