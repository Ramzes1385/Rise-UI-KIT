import { ref } from 'vue'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'

export function useDashboardGridBody() {
	const bodyRef = ref<HTMLElement | null>(null)
	const { isScrollable } = useScrollableRegion({ elementRef: bodyRef })
	return { bodyRef, isScrollable }
}
