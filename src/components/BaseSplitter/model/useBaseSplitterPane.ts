import { computed, ref } from 'vue'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'

export function useBaseSplitterPane() {
	const paneRef = ref<HTMLElement | null>(null)
	const vertical = useScrollableRegion({ elementRef: paneRef })
	const horizontal = useScrollableRegion({ elementRef: paneRef, orientation: 'horizontal' })
	return { paneRef, isScrollable: computed(() => vertical.isScrollable.value || horizontal.isScrollable.value) }
}
