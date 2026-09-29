import { onBeforeUnmount, ref } from 'vue'
import type { MediaSeekHint, MediaGesturesOptions } from '../types/MediaGestures.types'

const HOLD_DELAY = 500

const HINT_DURATION = 700

const BOOST_RATE = 2

const SIDE_SHARE = 1 / 3

export function useMediaGestures(options: MediaGesturesOptions) {
	const seekHint = ref<MediaSeekHint | null>(null)
	const isBoosted = ref(false)
	let holdTimer: ReturnType<typeof setTimeout> | undefined
	let hintTimer: ReturnType<typeof setTimeout> | undefined
	let restoreRate = 1
	let isClickSuppressed = false
	const seekFromSide = (side: MediaSeekHint['side']): void => {
		options.actions.seekBy(side === 'left' ? -options.seekStep() : options.seekStep())
		seekHint.value = { side, key: (seekHint.value?.key ?? 0) + 1 }
		clearTimeout(hintTimer)
		hintTimer = setTimeout(() => {
			seekHint.value = null
		}, HINT_DURATION)
	}
	onBeforeUnmount(() => [holdTimer, hintTimer].forEach(clearTimeout))

	return {
		seekHint,
		isBoosted,
		boostRate: BOOST_RATE,
		onFrameClick(): void {
			if (isClickSuppressed) isClickSuppressed = false
			else void options.actions.togglePlay()
		},
		onFrameDoubleClick(event: MouseEvent): void {
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
			const share = (event.clientX - rect.left) / rect.width
			if (share < SIDE_SHARE) seekFromSide('left')
			else if (share > 1 - SIDE_SHARE) seekFromSide('right')
			else options.toggleFullscreen()
		},
		onFramePointerDown(event: PointerEvent): void {
			if (event.button !== 0 || options.state.isPaused) return
			clearTimeout(holdTimer)
			holdTimer = setTimeout(() => {
				restoreRate = options.state.playbackRate
				isBoosted.value = true
				options.actions.setPlaybackRate(BOOST_RATE)
			}, HOLD_DELAY)
		},
		onFramePointerEnd(): void {
			clearTimeout(holdTimer)
			if (!isBoosted.value) return
			isBoosted.value = false
			isClickSuppressed = true
			options.actions.setPlaybackRate(restoreRate)
		},
	}
}
