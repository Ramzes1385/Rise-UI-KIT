import { vi } from 'vitest'

export function fakeAudio(element: HTMLAudioElement, initial: { duration?: number; error?: { code: number } | null } = {}) {
	const values = { paused: true, currentTime: 0, duration: initial.duration ?? Number.NaN, playbackRate: 1, error: initial.error ?? null }
	const emit = (type: string): boolean => element.dispatchEvent(new Event(type))
	Object.defineProperties(element, {
		paused: { configurable: true, get: () => values.paused },
		duration: { configurable: true, get: () => values.duration },
		error: { configurable: true, get: () => values.error },
		currentTime: {
			configurable: true,
			get: () => values.currentTime,
			set: (time: number) => {
				values.currentTime = time
				emit('seeked')
			},
		},
		playbackRate: {
			configurable: true,
			get: () => values.playbackRate,
			set: (rate: number) => {
				values.playbackRate = rate
				emit('ratechange')
			},
		},
	})
	const play = vi.fn(async () => {
		values.paused = false
		emit('play')
	})
	const pause = vi.fn(() => {
		values.paused = true
		emit('pause')
	})
	Object.assign(element, { play, pause })
	return {
		values,
		play,
		pause,
		emit,
		update(patch: Partial<typeof values>, event?: string): void {
			Object.assign(values, patch)
			if (event) emit(event)
		},
	}
}
