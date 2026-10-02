import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): Ref<boolean> {
	const isReduced = ref(false)
	let query: MediaQueryList | null = null

	function handleChange(event: MediaQueryListEvent): void {
		isReduced.value = event.matches
	}

	onMounted(() => {
		if (typeof window.matchMedia !== 'function') return
		query = window.matchMedia(REDUCED_MOTION_QUERY)
		isReduced.value = query.matches
		query.addEventListener('change', handleChange)
	})

	onBeforeUnmount(() => {
		query?.removeEventListener('change', handleChange)
		query = null
	})

	return isReduced
}

export function useMarqueeSize(viewportRef: Ref<HTMLElement | null>, trackRef: Ref<HTMLElement | null>, isVertical: () => boolean) {
	const viewportSize = ref(0)
	const groupSize = ref(0)
	let observer: ResizeObserver | null = null

	function measure(): void {
		const viewport = viewportRef.value!
		const group = trackRef.value!.firstElementChild as HTMLElement
		viewportSize.value = isVertical() ? viewport.clientHeight : viewport.clientWidth
		groupSize.value = isVertical() ? group.offsetHeight : group.offsetWidth
	}

	onMounted(() => {
		measure()
		observer = new ResizeObserver(measure)
		observer.observe(viewportRef.value!)
		observer.observe(trackRef.value!)
	})

	onBeforeUnmount(() => {
		observer?.disconnect()
		observer = null
	})

	return { viewportSize, groupSize, measure }
}
