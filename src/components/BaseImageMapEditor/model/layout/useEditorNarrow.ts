import type { Ref } from 'vue'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { EDITOR_NARROW_BELOW } from '../../types/ImageMapEditorLayout.types'

function contentWidth(element: HTMLElement): number {
	const style = getComputedStyle(element)
	return element.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0)
}

export function useEditorNarrow(rootRef: Ref<HTMLElement | null>) {
	const isNarrow = ref(false)
	const isReady = ref(false)
	let observer: ResizeObserver | undefined

	function measure(): void {
		const width = rootRef.value ? contentWidth(rootRef.value) : 0
		isNarrow.value = width > 0 && width < EDITOR_NARROW_BELOW
	}

	onMounted(() => {
		measure()
		if (rootRef.value && typeof ResizeObserver !== 'undefined') {
			observer = new ResizeObserver(measure)
			observer.observe(rootRef.value)
		}
		void nextTick(() => {
			isReady.value = true
		})
	})
	onBeforeUnmount(() => observer?.disconnect())

	return { isNarrow, isReady }
}
