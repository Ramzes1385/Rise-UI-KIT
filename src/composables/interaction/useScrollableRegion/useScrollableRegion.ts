/** Composable: признак прокрутки у области с overflow — чтобы сделать её доступной с клавиатуры */
import { onBeforeUnmount, ref, watch } from 'vue'
import type { ScrollableRegionOrientation, UseScrollableRegionOptions, UseScrollableRegionReturn } from './types/useScrollableRegion.types'

const MUTATION_OPTIONS = { childList: true, characterData: true, subtree: true }

function isOverflowing(element: HTMLElement, orientation: ScrollableRegionOrientation): boolean {
	const isWider = element.scrollWidth > element.clientWidth
	if (orientation === 'horizontal') return isWider
	const isTaller = element.scrollHeight > element.clientHeight
	return orientation === 'both' ? isTaller || isWider : isTaller
}

function observeChildren(observer: ResizeObserver, element: HTMLElement): void {
	observer.disconnect()
	observer.observe(element)
	for (const child of element.children) observer.observe(child)
}

/**
 * Следит, прокручивается ли элемент: содержимое выше видимой области (scrollHeight > clientHeight), при
 * `orientation: 'horizontal'` — шире её (scrollWidth > clientWidth), при `'both'` — хотя бы одно из двух.
 * Область с прокруткой, в которой нет фокусируемых элементов, нельзя прокрутить с клавиатуры, пока ей не дали
 * tabindex="0" (WCAG 2.1.1, правило axe scrollable-region-focusable). Постоянный tabindex добавил бы лишнюю остановку Tab
 * в каждое окно, поэтому компонент ставит его только при isScrollable.
 * Признак пересчитывается, когда элемент появляется (flush: 'post' — после отрисовки), когда меняется размер самого
 * элемента или его прямых потомков (ResizeObserver: окно упёрлось в предел, выросла или сжалась таблица, загрузилась
 * картинка) и когда меняется разметка внутри (MutationObserver: добавлены или убраны узлы, изменился текст).
 * Изменения, которых наблюдатели не видят (например, только стили глубоко вложенного элемента), — через `update()`.
 *
 * @example
 * ```ts
 * const bodyRef = ref<HTMLElement | null>(null)
 * const { isScrollable } = useScrollableRegion({ elementRef: bodyRef })
 * // <div ref="bodyRef" :tabindex="isScrollable ? 0 : undefined">…</div>
 * ```
 */
function useScrollableRegion(options: UseScrollableRegionOptions): UseScrollableRegionReturn {
	const { elementRef } = options
	const isScrollable = ref(false)
	let resizeObserver: ResizeObserver | null = null
	let mutationObserver: MutationObserver | null = null

	function update(): void {
		const element = elementRef.value
		isScrollable.value = element !== null && isOverflowing(element, options.orientation ?? 'vertical')
	}

	function handleMutations(records: MutationRecord[]): void {
		const element = elementRef.value
		const hasOwnChildren = records.some(record => record.type === 'childList' && record.target === element)
		if (hasOwnChildren && resizeObserver) observeChildren(resizeObserver, element!)
		update()
	}

	function disconnect(): void {
		resizeObserver?.disconnect()
		mutationObserver?.disconnect()
		resizeObserver = null
		mutationObserver = null
	}

	function connect(element: HTMLElement): void {
		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(update)
			observeChildren(resizeObserver, element)
		}
		mutationObserver = new MutationObserver(handleMutations)
		mutationObserver.observe(element, MUTATION_OPTIONS)
	}

	watch(
		elementRef,
		element => {
			disconnect()
			update()
			if (element) connect(element)
		},
		{ flush: 'post' },
	)

	onBeforeUnmount(disconnect)

	return { isScrollable, update }
}

export { useScrollableRegion }
