import { ref, watch, onBeforeUnmount, type Ref } from 'vue'
import type { BaseDescriptionsProps } from '../types/BaseDescriptions.types'

function measureColumns(element: HTMLElement, props: BaseDescriptionsProps): number {
	const maxColumns = Math.max(1, Math.floor(props.columns ?? 1))
	const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0
	const fit = Math.floor((element.clientWidth + gap) / Math.max(1, (props.minItemWidth ?? 0) + gap))
	return Math.min(maxColumns, Math.max(1, fit))
}

export function useColumnCount(listRef: Ref<HTMLElement | null>, props: BaseDescriptionsProps): Ref<number> {
	const count = ref(1)
	let observer: ResizeObserver | null = null
	function update(): void {
		if (listRef.value) count.value = measureColumns(listRef.value, props)
	}
	watch(listRef, element => {
		observer?.disconnect()
		update()
		if (!element || typeof ResizeObserver === 'undefined') return
		observer = new ResizeObserver(update)
		observer.observe(element)
	})
	watch(() => [props.columns, props.minItemWidth], update, { flush: 'post' })
	onBeforeUnmount(() => observer?.disconnect())
	return count
}
