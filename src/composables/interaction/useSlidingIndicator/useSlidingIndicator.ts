/** Composable: один скользящий индикатор на контейнер — CSS-переменные позиции и размера активного пункта */

import { computed, onBeforeUnmount, onMounted, readonly, ref, toValue, watch } from 'vue'
import type {
	SlidingIndicatorContainer,
	SlidingIndicatorIndex,
	SlidingIndicatorRect,
	UseSlidingIndicatorOptions,
	UseSlidingIndicatorReturn,
} from './types/useSlidingIndicator.types'

const DEFAULT_ITEM_SELECTOR = '[data-indicator-item]'

function findItem(container: HTMLElement, index: number | null | undefined, selector: string): HTMLElement | null {
	if (index === null || index === undefined || index < 0) return null
	return container.querySelectorAll<HTMLElement>(selector)[index] ?? null
}

function measureItem(container: HTMLElement, item: HTMLElement): SlidingIndicatorRect {
	const box = container.getBoundingClientRect()
	const itemBox = item.getBoundingClientRect()
	return {
		x: itemBox.left - box.left - container.clientLeft + container.scrollLeft,
		y: itemBox.top - box.top - container.clientTop + container.scrollTop,
		width: itemBox.width,
		height: itemBox.height,
	}
}

/** Два кадра: первый отрисовывает индикатор на месте без перехода, со второго переход включается */
function afterNextPaint(callback: () => void): void {
	requestAnimationFrame(() => requestAnimationFrame(callback))
}

function toStyle(rect: SlidingIndicatorRect | null): Record<string, string> {
	if (!rect) return {}
	return {
		'--indicator-x': `${rect.x}px`,
		'--indicator-y': `${rect.y}px`,
		'--indicator-w': `${rect.width}px`,
		'--indicator-h': `${rect.height}px`,
	}
}

/** ResizeObserver контейнера и активного пункта: следит только за текущей парой, лишних подписок не копит */
function createSizeObserver(onResize: () => void) {
	let observer: ResizeObserver | null = null
	let observedElement: HTMLElement | null = null
	let observedItem: HTMLElement | null = null

	function swap(previous: HTMLElement | null, next: HTMLElement | null): HTMLElement | null {
		if (!observer || previous === next) return previous
		if (previous) observer.unobserve(previous)
		if (next) observer.observe(next)
		return next
	}

	return {
		start(): void {
			if (typeof ResizeObserver !== 'undefined') observer = new ResizeObserver(onResize)
		},
		track(element: HTMLElement, item: HTMLElement | null): void {
			observedElement = swap(observedElement, element)
			observedItem = swap(observedItem, item)
		},
		stop(): void {
			observer?.disconnect()
			observer = null
			observedElement = null
			observedItem = null
		},
	}
}

/**
 * Скользящий индикатор (вкладки, сегменты, нижняя навигация, якоря): один элемент на контейнер вместо своего
 * у каждого пункта. Возвращает CSS-переменные `--indicator-x/-y/-w/-h` для контейнера; сам индикатор — миксин
 * `sliding-indicator` (позиция через `transform`, длительность и пружина — токены движения). Пересчёт — при смене
 * индекса и при изменении размеров контейнера или активного пункта (ResizeObserver). Контейнеру нужен
 * `position: relative`. Вызывать в `setup`.
 *
 * @example
 * ```ts
 * const list = ref<HTMLElement | null>(null)
 * const indicator = useSlidingIndicator(list, () => tabs.findIndex(tab => tab.value === active.value))
 * // <div ref="list" :style="indicator.style.value"><button data-indicator-item …/><span class="x__indicator" /></div>
 * ```
 */
export function useSlidingIndicator(
	container: SlidingIndicatorContainer,
	activeIndex: SlidingIndicatorIndex,
	options: UseSlidingIndicatorOptions = {},
): UseSlidingIndicatorReturn {
	const selector = options.itemSelector ?? DEFAULT_ITEM_SELECTOR
	const rect = ref<SlidingIndicatorRect | null>(null)
	const isInstant = ref(true)
	const sizes = createSizeObserver(() => update())

	function setRect(next: SlidingIndicatorRect | null): void {
		const wasHidden = rect.value === null
		rect.value = next
		if (!next || !wasHidden) return
		isInstant.value = true
		afterNextPaint(() => {
			isInstant.value = false
		})
	}

	function update(): void {
		const element = toValue(container)
		if (!element) return setRect(null)
		const item = findItem(element, toValue(activeIndex), selector)
		sizes.track(element, item)
		setRect(item ? measureItem(element, item) : null)
	}

	onMounted(() => {
		sizes.start()
		update()
	})

	onBeforeUnmount(sizes.stop)

	watch([() => toValue(container), () => toValue(activeIndex)], update, { flush: 'post' })

	return {
		rect: readonly(rect),
		style: computed(() => toStyle(rect.value)),
		isVisible: computed(() => rect.value !== null),
		isInstant: readonly(isInstant),
		update,
	}
}
