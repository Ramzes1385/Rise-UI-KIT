/** Composable: viewport слайдера — элемент и его размер по оси прокрутки, обновляемый ResizeObserver */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { UseSliderViewportReturn } from './types/useSlider.types'

/** Описание: элемент viewport и его размер по оси прокрутки; `measure` читает размер напрямую из DOM */
function useSliderViewport(isVertical: () => boolean): UseSliderViewportReturn {
	const viewportRef = ref<HTMLElement | null>(null)
	const viewportSize = ref(0)
	let resizeObserver: ResizeObserver | null = null

	function measure(): number {
		if (!viewportRef.value) return 0
		return isVertical() ? viewportRef.value.clientHeight : viewportRef.value.clientWidth
	}

	function updateViewportSize(): void {
		viewportSize.value = measure()
	}

	onMounted(() => {
		if (!viewportRef.value) return
		updateViewportSize()
		resizeObserver = new ResizeObserver(updateViewportSize)
		resizeObserver.observe(viewportRef.value)
	})

	onBeforeUnmount(() => {
		resizeObserver?.disconnect()
		resizeObserver = null
	})

	return { viewportRef, viewportSize, measure }
}

export { useSliderViewport }
