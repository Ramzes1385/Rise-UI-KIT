import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ROADMAP_SIDE_MIN_WIDTH } from '../../types/internal/roadmapView.types'
import type { RoadmapDetailsMode, UseRoadmapNarrowOptions } from '../../types/internal/roadmapView.types'

export function useRoadmapNarrow(options: UseRoadmapNarrowOptions) {
	const width = ref<number | null>(null)
	let observer: ResizeObserver | null = null

	function measure(value: number): void {
		width.value = value > 0 ? value : null
	}

	onMounted(() => {
		const element = options.rootRef.value
		if (!element) return
		measure(element.getBoundingClientRect().width)
		if (typeof ResizeObserver === 'undefined') return
		observer = new ResizeObserver(entries => measure(entries[0]?.contentRect.width ?? 0))
		observer.observe(element)
	})
	onBeforeUnmount(() => observer?.disconnect())

	const isNarrow = computed(() => width.value !== null && width.value < options.narrowWidth())
	const detailsMode = computed((): RoadmapDetailsMode => {
		const position = options.detailsPosition()
		if (position !== 'auto') return position
		return width.value === null || width.value > (options.sideMinWidth?.() ?? ROADMAP_SIDE_MIN_WIDTH) ? 'side' : 'sheet'
	})

	return { width, isNarrow, detailsMode }
}
