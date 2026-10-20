import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Roadmap3DTourOptions } from '../../types/internal/roadmap3dCompose.types'

export const TOUR_STEP_MS = 2600

export function useRoadmapTour(options: Roadmap3DTourOptions) {
	const isPlaying = ref(false)
	const step = ref(0)
	let timer: ReturnType<typeof setTimeout> | undefined
	const total = computed(() => options.getCount())

	function clear(): void {
		clearTimeout(timer)
		timer = undefined
	}

	function show(): void {
		options.focusAt(step.value)
		clear()
		timer = setTimeout(next, TOUR_STEP_MS)
	}

	function next(): void {
		if (step.value >= total.value - 1) return stop()
		step.value += 1
		show()
	}

	function start(isSilent = false): void {
		if (total.value === 0 || isPlaying.value) return
		isPlaying.value = true
		if (!isSilent) options.onChange(true)
		const current = options.getFocusedIndex()
		step.value = current >= 0 && current < total.value - 1 ? current : 0
		show()
	}

	function stop(isSilent = false): void {
		clear()
		if (!isPlaying.value) return
		isPlaying.value = false
		if (!isSilent) options.onChange(false)
	}

	function sync(value: boolean): void {
		if (value) start(true)
		else stop(true)
	}

	function move(delta: 1 | -1): void {
		const target = step.value + delta
		if (target < 0 || target >= total.value) return
		step.value = target
		if (isPlaying.value) show()
		else options.focusAt(target)
	}

	watch(() => options.getRequested(), sync)
	onMounted(() => sync(options.getRequested()))
	onBeforeUnmount(clear)
	return { isPlaying, step, total, start, stop, move, toggle: () => (isPlaying.value ? stop() : start()) }
}
