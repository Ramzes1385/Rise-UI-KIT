import { computed, reactive, readonly, watch } from 'vue'
import type { MediaState, MediaActions, MediaErrorCode, MediaTimeRange, MediaElementRef, MediaPlayerError } from '../types/MediaCore.types'

const MEDIA_ERROR_BY_CODE: Record<number, MediaErrorCode> = { 1: 'aborted', 2: 'network', 3: 'decode', 4: 'unsupported' }

function readBuffered(media: HTMLMediaElement): MediaTimeRange[] {
	return Array.from({ length: media.buffered.length }, (_, index) => [media.buffered.start(index), media.buffered.end(index)] as const)
}

function readError(media: HTMLMediaElement): MediaPlayerError | null {
	const error = media.error
	return error ? { code: MEDIA_ERROR_BY_CODE[error.code] ?? 'unknown', cause: error } : null
}

function playError(cause: unknown): MediaPlayerError | null {
	const name = cause instanceof DOMException ? cause.name : ''
	if (name === 'AbortError') return null
	return { code: name === 'NotAllowedError' ? 'autoplay-blocked' : 'unknown', cause }
}

function clampTime(time: number, duration: number): number {
	const start = Math.max(0, time)
	return Number.isFinite(duration) ? Math.min(start, duration) : start
}

function syncState(state: MediaState, media: HTMLMediaElement): void {
	Object.assign(state, {
		currentTime: media.currentTime,
		duration: media.duration,
		buffered: readBuffered(media),
		isPaused: media.paused,
		isEnded: media.ended,
		isSeeking: media.seeking,
		playbackRate: media.playbackRate,
		error: readError(media),
	})
}

function eventHandlers(state: MediaState, onTimeUpdate: () => void): Record<string, (media: HTMLMediaElement) => void> {
	return {
		loadedmetadata: media => syncState(state, media),
		durationchange: media => Object.assign(state, { duration: media.duration }),
		timeupdate: onTimeUpdate,
		progress: media => Object.assign(state, { buffered: readBuffered(media) }),
		play: () => Object.assign(state, { isPaused: false, isEnded: false }),
		playing: () => Object.assign(state, { isWaiting: false }),
		pause: () => Object.assign(state, { isPaused: true }),
		ended: () => Object.assign(state, { isEnded: true, isPaused: true }),
		waiting: () => Object.assign(state, { isWaiting: true }),
		canplay: () => Object.assign(state, { isWaiting: false }),
		seeking: media => Object.assign(state, { isSeeking: true, currentTime: media.currentTime }),
		seeked: media => Object.assign(state, { isSeeking: false, currentTime: media.currentTime }),
		ratechange: media => Object.assign(state, { playbackRate: media.playbackRate }),
		error: media => Object.assign(state, { error: readError(media), isWaiting: false }),
		emptied: media => syncState(state, media),
	}
}

function useListeners(media: MediaElementRef, state: MediaState): void {
	let frame = 0
	watch(
		media,
		(element, _, onCleanup) => {
			if (!element) return
			syncState(state, element)
			const onTimeUpdate = (): void => {
				if (frame) return
				frame = requestAnimationFrame(() => {
					frame = 0
					state.currentTime = element.currentTime
				})
			}
			const listeners = Object.entries(eventHandlers(state, onTimeUpdate)).map(
				([name, handler]) => [name, () => handler(element)] as const,
			)
			listeners.forEach(([name, listener]) => element.addEventListener(name, listener))
			onCleanup(() => {
				cancelAnimationFrame(frame)
				frame = 0
				listeners.forEach(([name, listener]) => element.removeEventListener(name, listener))
			})
		},
		{ immediate: true },
	)
}

function useSoundListener(sound: MediaElementRef, state: MediaState): void {
	watch(
		sound,
		(element, _, onCleanup) => {
			if (!element) return
			const sync = (): void => {
				Object.assign(state, { volume: element.volume, isMuted: element.muted })
			}
			sync()
			element.addEventListener('volumechange', sync)
			onCleanup(() => element.removeEventListener('volumechange', sync))
		},
		{ immediate: true },
	)
}

function createPlay(state: MediaState, media: MediaElementRef): MediaActions['play'] {
	return async () => {
		const element = media.value
		if (!element) return
		if (state.error?.code === 'autoplay-blocked') state.error = null
		try {
			await element.play()
		} catch (cause) {
			const error = playError(cause)
			if (error) Object.assign(state, { error, isPaused: true })
		}
	}
}

function createSeek(state: MediaState, media: MediaElementRef): MediaActions['seek'] {
	return time => {
		const element = media.value
		const target = clampTime(time, state.duration)
		if (!element || !Number.isFinite(target)) return
		element.currentTime = target
		state.currentTime = element.currentTime
	}
}

function createRetry(state: MediaState, media: MediaElementRef, resume: (time: number) => void): MediaActions['retry'] {
	return () => {
		const element = media.value
		if (!element) return
		const time = state.currentTime
		state.error = null
		element.addEventListener('loadedmetadata', () => resume(time), { once: true })
		element.load()
	}
}

function createActions(state: MediaState, media: MediaElementRef, sound: MediaElementRef): MediaActions {
	const play = createPlay(state, media)
	const seek = createSeek(state, media)
	return {
		play,
		pause: () => media.value?.pause(),
		togglePlay: () => (state.isPaused ? play() : Promise.resolve(media.value?.pause())),
		seek,
		seekBy: delta => seek(state.currentTime + delta),
		setVolume(volume) {
			const element = sound.value
			if (!element) return
			element.volume = Math.min(1, Math.max(0, volume))
			if (volume > 0 && element.muted) element.muted = false
		},
		toggleMute() {
			if (sound.value) sound.value.muted = !sound.value.muted
		},
		setMuted(isMuted) {
			if (sound.value) sound.value.muted = isMuted
		},
		setPlaybackRate(rate) {
			if (media.value) media.value.playbackRate = rate
		},
		retry: createRetry(state, media, time => {
			seek(time)
			void play()
		}),
	}
}

export function useMediaElement(media: MediaElementRef, sound?: MediaElementRef) {
	const state = reactive<MediaState>({
		currentTime: 0,
		duration: Number.NaN,
		buffered: [],
		isPaused: true,
		isEnded: false,
		isSeeking: false,
		isWaiting: false,
		volume: 1,
		isMuted: false,
		playbackRate: 1,
		error: null,
	})
	const output = computed(() => sound?.value ?? media.value)
	useListeners(media, state)
	useSoundListener(output, state)
	return { state: readonly(state) as Readonly<MediaState>, actions: createActions(state, media, output) }
}
