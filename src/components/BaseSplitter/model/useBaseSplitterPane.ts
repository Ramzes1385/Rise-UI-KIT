import { ref } from 'vue'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'

export function useBaseSplitterPane() {
	const paneRef = ref<HTMLElement | null>(null)
	const { isScrollable } = useScrollableRegion({ elementRef: paneRef, orientation: 'both' })
	return { paneRef, isScrollable }
}
