import type { MegaMenuProps } from '../types/BaseMegaMenu.types'
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

const MIN_DRILL_DEPTH = 2

export function useMegaMenuWidth(rootRef: Ref<HTMLElement | null>, props: MegaMenuProps) {
	const width = ref(0)
	let observer: ResizeObserver | undefined

	function measure(): void {
		width.value = rootRef.value?.clientWidth ?? 0
	}

	onMounted(() => {
		measure()
		if (typeof ResizeObserver === 'undefined') return
		observer = new ResizeObserver(measure)
		observer.observe(rootRef.value as HTMLElement)
	})
	onBeforeUnmount(() => observer?.disconnect())

	const isNarrow = computed(() => {
		const limit = (props.drilldownBelow * props.sizeScale) / 100
		return limit > 0 && width.value > 0 && width.value < limit
	})

	return {
		drilldownDepth: computed((): number => (isNarrow.value ? Math.min(props.drilldownFrom, MIN_DRILL_DEPTH) : props.drilldownFrom)),
	}
}
