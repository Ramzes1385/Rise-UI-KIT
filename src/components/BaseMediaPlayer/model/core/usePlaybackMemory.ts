import { ref, watch } from 'vue'
import type { MediaActions, MediaState } from '../../types/playback/MediaCore.types'

const SAVE_INTERVAL = 5000

const EDGE_SECONDS = 5

const STORAGE_PREFIX = 'rise-media:'

function readStorage(key: string): number {
	try {
		return Number(localStorage.getItem(key))
	} catch {
		return 0
	}
}

function writeStorage(key: string, time: number | null): void {
	try {
		if (time === null) localStorage.removeItem(key)
		else localStorage.setItem(key, String(Math.floor(time)))
	} catch {
		return
	}
}

function isInside(time: number, duration: number): boolean {
	return time > EDGE_SECONDS && time < duration - EDGE_SECONDS
}

function useAutoSave(state: Readonly<MediaState>, handlers: { save: (time: number | null) => void; onPlay: () => void }): void {
	let lastSavedAt = 0
	watch(
		() => state.currentTime,
		time => {
			if (Date.now() - lastSavedAt < SAVE_INTERVAL) return
			lastSavedAt = Date.now()
			handlers.save(time)
		},
	)
	watch(
		() => state.isPaused,
		isPaused => {
			lastSavedAt = Date.now()
			if (isPaused) handlers.save(state.isEnded ? null : state.currentTime)
			else handlers.onPlay()
		},
	)
}

export function usePlaybackMemory(options: {
	state: Readonly<MediaState>
	actions: MediaActions
	storageKey: () => string | undefined
	startTime: () => number | null
}) {
	const { state, actions } = options
	const resumeTime = ref<number | null>(null)
	let readyKey: string | null | undefined
	const key = (): string | null => (options.storageKey() ? `${STORAGE_PREFIX}${options.storageKey()}` : null)
	const save = (time: number | null): void => {
		const storageKey = key()
		if (storageKey && storageKey === readyKey) writeStorage(storageKey, time !== null && isInside(time, state.duration) ? time : null)
	}

	watch(
		() => Number.isFinite(state.duration),
		hasDuration => {
			const storageKey = key()
			if (!hasDuration || storageKey === readyKey) return
			const start = readyKey === undefined ? options.startTime() : null
			const saved = storageKey ? readStorage(storageKey) : 0
			readyKey = storageKey
			if (start !== null) actions.seek(start)
			else if (isInside(saved, state.duration)) resumeTime.value = saved
		},
	)
	watch(key, () => {
		resumeTime.value = null
	})
	useAutoSave(state, { save, onPlay: () => (resumeTime.value = null) })

	return {
		resumeTime,
		resume(): void {
			if (resumeTime.value !== null) actions.seek(resumeTime.value)
			resumeTime.value = null
			void actions.play()
		},
		dismissResume(): void {
			resumeTime.value = null
		},
	}
}
