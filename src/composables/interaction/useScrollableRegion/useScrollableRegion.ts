/** Composable: признак прокрутки у области с overflow — чтобы сделать её доступной с клавиатуры */
import { onBeforeUnmount, ref, watch } from 'vue'
import type { UseScrollableRegionOptions, UseScrollableRegionReturn } from './types/useScrollableRegion.types'

/**
 * Следит, прокручивается ли элемент: содержимое выше видимой области (scrollHeight > clientHeight), а при
 * `orientation: 'horizontal'` — шире её (scrollWidth > clientWidth).
 * Область с прокруткой, в которой нет фокусируемых элементов, нельзя прокрутить с клавиатуры, пока ей не дали
 * tabindex="0" (WCAG 2.1.1, правило axe scrollable-region-focusable). Постоянный tabindex добавил бы лишнюю остановку Tab
 * в каждое окно, поэтому компонент ставит его только при isScrollable.
 * Признак пересчитывается, когда элемент появляется (flush: 'post' — после отрисовки) и когда меняется его размер
 * (ResizeObserver: окно выросло до предела по высоте, изменился размер экрана).
 *
 * @example
 * ```ts
 * const bodyRef = ref<HTMLElement | null>(null)
 * const { isScrollable } = useScrollableRegion({ elementRef: bodyRef })
 * // <div ref="bodyRef" :tabindex="isScrollable ? 0 : undefined">…</div>
 * ```
 */
function isOverflowing(element: HTMLElement, orientation: UseScrollableRegionOptions['orientation']): boolean {
	if (orientation === 'horizontal') return element.scrollWidth > element.clientWidth
	return element.scrollHeight > element.clientHeight
}

function useScrollableRegion(options: UseScrollableRegionOptions): UseScrollableRegionReturn {
	const { elementRef } = options
	const isScrollable = ref(false)
	let observer: ResizeObserver | null = null

	function update(): void {
		const element = elementRef.value
		isScrollable.value = element !== null && isOverflowing(element, options.orientation)
	}

	function disconnect(): void {
		observer?.disconnect()
		observer = null
	}

	watch(
		elementRef,
		element => {
			disconnect()
			update()
			if (!element) return
			observer = new ResizeObserver(update)
			observer.observe(element)
		},
		{ flush: 'post' },
	)

	onBeforeUnmount(disconnect)

	return { isScrollable }
}

export { useScrollableRegion }
