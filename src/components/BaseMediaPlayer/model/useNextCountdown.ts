import { onBeforeUnmount, ref, watch } from 'vue'
import type { MediaNextCountdownOptions } from '../types/MediaPlaylist.types'

const TICK = 1000

export function useNextCountdown(options: MediaNextCountdownOptions) {
	const remaining = ref<number | null>(null)
	let timer: ReturnType<typeof setInterval> | undefined
	const stop = (): void => {
		clearInterval(timer)
		remaining.value = null
	}
	const tick = (): void => {
		remaining.value = (remaining.value ?? 1) - 1
		if (remaining.value > 0) return
		stop()
		options.playNext()
	}
	watch(
		() => options.state.isEnded,
		isEnded => {
			stop()
			if (!isEnded || !options.isEnabled() || !options.hasNext()) return
			if (options.seconds() <= 0) return options.playNext()
			remaining.value = options.seconds()
			timer = setInterval(tick, TICK)
		},
	)
	watch(options.isEnabled, isEnabled => !isEnabled && stop())
	onBeforeUnmount(stop)

	return {
		nextCountdown: remaining,
		cancelNext: stop,
		playNextNow(): void {
			stop()
			options.playNext()
		},
	}
}
