import type { Ref } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const DEFAULT_BREAKPOINT = 640

export function useRoadmap3DSize(getBreakpoint: () => number | undefined, rootRef: Readonly<Ref<HTMLElement | null>>) {
	const width = ref(0)
	let observer: ResizeObserver | null = null

	onMounted(() => {
		const root = rootRef.value
		if (!root || typeof ResizeObserver === 'undefined') return
		width.value = root.clientWidth
		observer = new ResizeObserver(() => (width.value = root.clientWidth))
		observer.observe(root)
	})
	onBeforeUnmount(() => observer?.disconnect())

	return { isCompact: computed(() => width.value > 0 && width.value < (getBreakpoint() ?? DEFAULT_BREAKPOINT)) }
}
