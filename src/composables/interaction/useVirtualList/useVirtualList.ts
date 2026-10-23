/** Composable: виртуальный список — отрисовка только видимых строк длинного списка */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type {
	UseVirtualListOptions,
	UseVirtualListReturn,
	VirtualAlign,
	VirtualItem,
	VirtualItemObserver,
	VirtualKey,
	VirtualRange,
	VirtualScrollState,
	VirtualSizes,
} from './types/useVirtualList.types'

/** Строк сверх видимых сверху и снизу по умолчанию: хватает на быстрый прокрут колесом */
const DEFAULT_OVERSCAN = 5

/** Последняя строка, которая начинается не ниже position (двоичный поиск по началам строк) */
function findIndex(offsets: number[], position: number): number {
	let low = 0
	let high = offsets.length - 2
	while (low < high) {
		const middle = Math.ceil((low + high) / 2)
		if (offsets[middle] <= position) low = middle
		else high = middle - 1
	}
	return low
}

/** Строка с фокусом существует и лежит вне отрисовываемого диапазона */
function isPinnedOutside(pinned: number | undefined, count: number, range: VirtualRange): pinned is number {
	return pinned !== undefined && pinned < count && (pinned < range.start || pinned >= range.end)
}

/** Прокрутка, при которой строка встаёт по `align`; `auto` — к ближнему краю, `null` — строка видна целиком */
function alignedScrollTop(element: HTMLElement, row: VirtualRange, align: VirtualAlign): number | null {
	const viewport = element.clientHeight
	if (align === 'start') return row.start
	if (align === 'end') return row.end - viewport
	if (align === 'center') return (row.start + row.end - viewport) / 2
	if (row.start < element.scrollTop) return row.start
	if (row.end > element.scrollTop + viewport) return row.end - viewport
	return null
}

/**
 * Высоты строк: до замера — estimateSize, замеренные хранятся по ключу строки. `offsets[i]` — начало i-й строки,
 * последний элемент — полная высота
 */
function createSizes(options: UseVirtualListOptions): VirtualSizes {
	const sizes = new Map<VirtualKey, number>()
	/** version пересчитывает смещения после замера */
	const version = ref(0)

	function keyOf(index: number): VirtualKey {
		return options.getKey ? options.getKey(index) : index
	}

	const offsets = computed((): number[] => {
		void version.value
		const count = options.count()
		const estimate = options.estimateSize()
		const result = [0]
		for (let index = 0; index < count; index++) result.push(result[index] + (sizes.get(keyOf(index)) ?? estimate))
		return result
	})

	function measure(index: number, size: number): void {
		const key = keyOf(index)
		if (size <= 0 || sizes.get(key) === size) return
		sizes.set(key, size)
		version.value++
	}

	return { offsets, keyOf, measure }
}

/** Замер элементов строк при изменении их размера (содержимое загрузилось, строка раскрылась) */
function createItemObserver(measure: VirtualSizes['measure']): VirtualItemObserver {
	/** Индекс строки по элементу */
	const elementIndex = new WeakMap<Element, number>()
	let itemObserver: ResizeObserver | null = null

	function handleItemResize(entries: ResizeObserverEntry[]): void {
		for (const { target } of entries) {
			// Отключённый от DOM элемент больше не нужен: строка ушла из отрисовки
			if (!target.isConnected) (itemObserver as ResizeObserver).unobserve(target)
			else measure(elementIndex.get(target) as number, (target as HTMLElement).offsetHeight)
		}
	}

	return {
		measureElement: (element, index) => {
			if (!(element instanceof HTMLElement)) return
			elementIndex.set(element, index)
			measure(index, element.offsetHeight)
			itemObserver ??= new ResizeObserver(handleItemResize)
			itemObserver.observe(element)
		},
		disconnect: () => itemObserver?.disconnect(),
	}
}

/** Прокрутка и высота области: подписка на scroll и ResizeObserver появляются вместе с элементом */
function useScrollState(scrollElement: UseVirtualListOptions['scrollElement']): VirtualScrollState {
	const scrollTop = ref(0)
	const viewportSize = ref(0)

	function update(): void {
		const element = scrollElement.value
		if (!element) return
		scrollTop.value = element.scrollTop
		viewportSize.value = element.clientHeight
	}

	watch(
		scrollElement,
		(element, _previous, onCleanup) => {
			if (!element) return
			update()
			element.addEventListener('scroll', update, { passive: true })
			const observer = new ResizeObserver(update)
			observer.observe(element)
			onCleanup(() => {
				element.removeEventListener('scroll', update)
				observer.disconnect()
			})
		},
		{ immediate: true, flush: 'post' },
	)

	return { scrollTop, viewportSize, update }
}

/**
 * Считает, какие строки длинного списка видны в прокручиваемой области, и отдаёт их вместе с положением.
 * Высота строки до замера — estimateSize; замеренные высоты (measure, measureElement) хранятся по ключу строки.
 * Прокрутка и высота области отслеживаются сами: подписка на scroll и ResizeObserver появляются вместе с элементом.
 *
 * @example
 * ```ts
 * const viewportRef = ref<HTMLElement | null>(null)
 * const { items, totalSize, measureElement } = useVirtualList({
 *   count: () => rows.value.length,
 *   estimateSize: () => 40,
 *   scrollElement: viewportRef,
 *   getKey: index => rows.value[index].id,
 * })
 * ```
 */
function useVirtualList(options: UseVirtualListOptions): UseVirtualListReturn {
	const { scrollElement } = options
	const { scrollTop, viewportSize, update } = useScrollState(scrollElement)
	const { offsets, keyOf, measure } = createSizes(options)
	const { measureElement, disconnect } = createItemObserver(measure)

	const totalSize = computed(() => offsets.value[offsets.value.length - 1])

	const range = computed((): VirtualRange => {
		const count = options.count()
		if (count === 0) return { start: 0, end: 0 }
		const overscan = options.overscan?.() ?? DEFAULT_OVERSCAN
		const first = findIndex(offsets.value, scrollTop.value)
		const last = findIndex(offsets.value, scrollTop.value + viewportSize.value)
		return { start: Math.max(0, first - overscan), end: Math.min(count, last + 1 + overscan) }
	})

	function itemAt(index: number): VirtualItem {
		const list = offsets.value
		return { index, key: keyOf(index), start: list[index], size: list[index + 1] - list[index] }
	}

	const items = computed((): VirtualItem[] => {
		const { start, end } = range.value
		const result: VirtualItem[] = []
		for (let index = start; index < end; index++) result.push(itemAt(index))
		// Строка с фокусом остаётся в DOM и вне видимой области: иначе фокус потерялся бы при прокрутке
		const pinned = options.pinnedIndex?.()
		if (!isPinnedOutside(pinned, options.count(), range.value)) return result
		return pinned < start ? [itemAt(pinned), ...result] : [...result, itemAt(pinned)]
	})

	const paddingStart = computed(() => offsets.value[range.value.start])
	const paddingEnd = computed(() => totalSize.value - offsets.value[range.value.end])

	onBeforeUnmount(disconnect)

	/** Прокрутить к строке; `auto` — к ближнему краю и только если строка не видна целиком */
	function scrollToIndex(index: number, align: VirtualAlign = 'auto'): void {
		const element = scrollElement.value
		const count = options.count()
		if (!element || count === 0) return
		const target = Math.min(Math.max(index, 0), count - 1)
		const position = alignedScrollTop(element, { start: offsets.value[target], end: offsets.value[target + 1] }, align)
		if (position === null) return
		element.scrollTop = Math.max(0, position)
		update()
	}

	return { items, totalSize, range, paddingStart, paddingEnd, measure, measureElement, scrollToIndex, update, scrollTop, viewportSize }
}

export { useVirtualList }
