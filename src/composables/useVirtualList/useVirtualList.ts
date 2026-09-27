/** Composable: виртуальный список — отрисовка только видимых строк длинного списка */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { UseVirtualListOptions, UseVirtualListReturn, VirtualAlign, VirtualItem, VirtualKey } from './useVirtualList.types'

/** Строк сверх видимых сверху и снизу по умолчанию: хватает на быстрый прокрут колесом */
const DEFAULT_OVERSCAN = 5

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
	const scrollTop = ref(0)
	const viewportSize = ref(0)

	/** Замеренные высоты по ключу; version пересчитывает смещения после замера */
	const sizes = new Map<VirtualKey, number>()
	const version = ref(0)

	function keyOf(index: number): VirtualKey {
		return options.getKey ? options.getKey(index) : index
	}

	/** Начало каждой строки: offsets[i] — начало i-й строки, последний элемент — полная высота */
	const offsets = computed((): number[] => {
		void version.value
		const count = options.count()
		const estimate = options.estimateSize()
		const result = [0]
		for (let index = 0; index < count; index++) result.push(result[index] + (sizes.get(keyOf(index)) ?? estimate))
		return result
	})

	const totalSize = computed(() => offsets.value[offsets.value.length - 1])

	/** Последняя строка, которая начинается не ниже position (двоичный поиск) */
	function findIndex(position: number): number {
		const list = offsets.value
		let low = 0
		let high = list.length - 2
		while (low < high) {
			const middle = Math.ceil((low + high) / 2)
			if (list[middle] <= position) low = middle
			else high = middle - 1
		}
		return low
	}

	const range = computed(() => {
		const count = options.count()
		if (count === 0) return { start: 0, end: 0 }
		const overscan = options.overscan?.() ?? DEFAULT_OVERSCAN
		const first = findIndex(scrollTop.value)
		const last = findIndex(scrollTop.value + viewportSize.value)
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
		if (pinned === undefined || pinned >= options.count() || (pinned >= start && pinned < end)) return result
		return pinned < start ? [itemAt(pinned), ...result] : [...result, itemAt(pinned)]
	})

	const paddingStart = computed(() => offsets.value[range.value.start])
	const paddingEnd = computed(() => totalSize.value - offsets.value[range.value.end])

	function measure(index: number, size: number): void {
		const key = keyOf(index)
		if (size <= 0 || sizes.get(key) === size) return
		sizes.set(key, size)
		version.value++
	}

	/** Индекс строки по элементу: замер при изменении размера (содержимое загрузилось, строка раскрылась) */
	const elementIndex = new WeakMap<Element, number>()
	let itemObserver: ResizeObserver | null = null

	function handleItemResize(entries: ResizeObserverEntry[]): void {
		for (const { target } of entries) {
			// Отключённый от DOM элемент больше не нужен: строка ушла из отрисовки
			if (!target.isConnected) (itemObserver as ResizeObserver).unobserve(target)
			else measure(elementIndex.get(target) as number, (target as HTMLElement).offsetHeight)
		}
	}

	function measureElement(element: unknown, index: number): void {
		if (!(element instanceof HTMLElement)) return
		elementIndex.set(element, index)
		measure(index, element.offsetHeight)
		itemObserver ??= new ResizeObserver(handleItemResize)
		itemObserver.observe(element)
	}

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

	onBeforeUnmount(() => itemObserver?.disconnect())

	/** Прокрутить к строке; `auto` — к ближнему краю и только если строка не видна целиком */
	function scrollToIndex(index: number, align: VirtualAlign = 'auto'): void {
		const element = scrollElement.value
		const count = options.count()
		if (!element || count === 0) return
		const target = Math.min(Math.max(index, 0), count - 1)
		const start = offsets.value[target]
		const end = offsets.value[target + 1]
		const viewport = element.clientHeight
		let position: number
		if (align === 'start') position = start
		else if (align === 'end') position = end - viewport
		else if (align === 'center') position = (start + end - viewport) / 2
		else if (start < element.scrollTop) position = start
		else if (end > element.scrollTop + viewport) position = end - viewport
		else return
		element.scrollTop = Math.max(0, position)
		update()
	}

	return { items, totalSize, range, paddingStart, paddingEnd, measure, measureElement, scrollToIndex, update, scrollTop, viewportSize }
}

export { useVirtualList }
