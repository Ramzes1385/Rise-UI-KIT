import { onBeforeUnmount, ref, watch } from 'vue'
import type { SlideTimerOptions } from '../types/PresentationModel.types'

const TICK_MS = 100

export function useSlideTimer(options: SlideTimerOptions) {
	const elapsed = ref(0)
	let timer: ReturnType<typeof setInterval> | undefined
	let last = 0

	const stop = (): void => {
		clearInterval(timer)
		timer = undefined
	}
	const tick = (): void => {
		const now = Date.now()
		const duration = options.duration()
		elapsed.value = Math.min(duration, elapsed.value + ((now - last) / 1000) * options.rate())
		last = now
		if (elapsed.value < duration) return
		stop()
		options.onEnd()
	}
	const isActive = (): boolean => options.isRunning() && options.duration() > elapsed.value

	watch(isActive, active => {
		stop()
		if (!active) return
		last = Date.now()
		timer = setInterval(tick, TICK_MS)
	})
	onBeforeUnmount(stop)

	return {
		elapsed,
		seek(time: number): void {
			elapsed.value = Math.min(options.duration(), Math.max(0, time))
		},
	}
}
