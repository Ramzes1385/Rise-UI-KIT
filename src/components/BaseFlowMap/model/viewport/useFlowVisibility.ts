import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useFlowVisibility(element: Ref<HTMLElement | null>): { isVisible: Ref<boolean> } {
	const isVisible = ref(true)
	let isIntersecting = true
	let isTabActive = true
	let observer: IntersectionObserver | null = null

	function update(): void {
		isVisible.value = isIntersecting && isTabActive
	}

	function onVisibilityChange(): void {
		isTabActive = document.visibilityState !== 'hidden'
		update()
	}

	onMounted(() => {
		document.addEventListener('visibilitychange', onVisibilityChange)
		if (typeof IntersectionObserver === 'undefined' || !element.value) return
		observer = new IntersectionObserver(entries => {
			isIntersecting = entries.some(entry => entry.isIntersecting)
			update()
		})
		observer.observe(element.value)
	})

	onBeforeUnmount(() => {
		observer?.disconnect()
		if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibilityChange)
	})

	return { isVisible }
}
