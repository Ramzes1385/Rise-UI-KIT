import { onBeforeUnmount, onMounted, watch } from 'vue'
import type { AffixObserverOptions, AffixOffsets, AffixTarget } from '../types/BaseAffix.types'
const EDGE_PX = 1

function resolveRoot(target: AffixTarget): Element | null {
	if (typeof target === 'string') return document.querySelector(target)
	return target
}

function rootMargin({ top, bottom }: AffixOffsets): string {
	const topMargin = top === undefined ? 0 : -(top + EDGE_PX)
	const bottomMargin = bottom === undefined ? 0 : -(bottom + EDGE_PX)
	return `${topMargin}px 0px ${bottomMargin}px 0px`
}

function isStuck(entry: IntersectionObserverEntry, { top, bottom }: AffixOffsets): boolean {
	const bounds = entry.rootBounds
	if (!bounds || entry.intersectionRatio === 1) return false
	const rect = entry.boundingClientRect
	return (top !== undefined && rect.top < bounds.top) || (bottom !== undefined && rect.bottom > bounds.bottom)
}
export function useAffixObserver(options: AffixObserverOptions): void {
	let observer: IntersectionObserver | null = null
	let isFixed = false

	function report(value: boolean): void {
		if (value === isFixed) return
		isFixed = value
		options.onChange(value)
	}

	function disconnect(): void {
		observer?.disconnect()
		observer = null
	}

	function connect(): void {
		disconnect()
		const element = options.elementRef.value
		if (!element || typeof IntersectionObserver === 'undefined') return
		const offsets = options.offsets()
		observer = new IntersectionObserver(entries => report(isStuck(entries[entries.length - 1], offsets)), {
			root: resolveRoot(options.target()),
			rootMargin: rootMargin(offsets),
			threshold: [0, 1],
		})
		observer.observe(element)
	}

	onMounted(connect)
	watch([() => options.offsets().top, () => options.offsets().bottom, options.target], connect)
	onBeforeUnmount(disconnect)
}
