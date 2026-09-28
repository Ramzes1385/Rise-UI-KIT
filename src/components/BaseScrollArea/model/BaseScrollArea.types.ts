import type { BaseComponentProps } from '@composables/useBaseComponent'

/** У области одно оформление: тонкая полоса прокрутки поверх содержимого */
export const SCROLL_AREA_VARIANTS = ['default'] as const

/** Направление прокрутки */
export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both'

/** Когда видна полоса прокрутки: `hover` — при наведении, прокрутке и фокусе, `always` — всегда */
export type ScrollAreaScrollbar = 'hover' | 'always'

/**
 * Пропсы компонента BaseScrollArea.
 * `sizeScale` масштабирует толщину полосы; `variant` и `color` не используются.
 */
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
}

/**
 * События компонента BaseScrollArea
 */
export interface BaseScrollAreaEmits {
	(event: 'scroll', value: Event): void
}

/**
 * Слоты компонента BaseScrollArea
 */
export interface BaseScrollAreaSlots {
	/** Прокручиваемое содержимое */
	default?: () => unknown
}

/**
 * Методы BaseScrollArea (ref)
 */
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
