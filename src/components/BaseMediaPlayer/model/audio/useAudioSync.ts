import { watch } from 'vue'
import type { MediaAudioSyncOptions } from '../../types/content/MediaAudio.types'

const DRIFT_LIMIT = 0.3

const PAUSE_EVENTS = ['pause', 'waiting', 'ended', 'emptied', 'error']

function syncTime(video: HTMLMediaElement, audio: HTMLMediaElement, limit = 0): void {
	if (Math.abs(audio.currentTime - video.currentTime) > limit) audio.currentTime = video.currentTime
}

function followVideo(video: HTMLMediaElement, audio: HTMLMediaElement) {
	const resume = (): void => {
		syncTime(video, audio)
		audio.playbackRate = video.playbackRate
		if (!video.paused) void audio.play().catch(() => undefined)
	}
	const listeners: Array<[string, () => void]> = [
		['play', resume],
		['playing', resume],
		['seeking', () => syncTime(video, audio)],
		['timeupdate', () => syncTime(video, audio, DRIFT_LIMIT)],
		[
			'ratechange',
			() => {
				audio.playbackRate = video.playbackRate
			},
		],
		...PAUSE_EVENTS.map(name => [name, () => audio.pause()] as [string, () => void]),
	]
	return { resume, listeners }
}

function stop(audio: HTMLAudioElement): void {
	if (!audio.hasAttribute('src')) return
	audio.pause()
	audio.removeAttribute('src')
	audio.load()
}

export function useAudioSync(options: MediaAudioSyncOptions): void {
	watch(
		() => [options.video.value, options.audio.value, options.src()] as const,
		([video, audio, src], _, onCleanup) => {
			if (!video || !audio) return
			if (!src) return stop(audio)
			if (audio.getAttribute('src') !== src) audio.src = src
			const { resume, listeners } = followVideo(video, audio)
			listeners.forEach(([name, listener]) => video.addEventListener(name, listener))
			audio.addEventListener('error', options.onError)
			resume()
			onCleanup(() => {
				listeners.forEach(([name, listener]) => video.removeEventListener(name, listener))
				audio.removeEventListener('error', options.onError)
			})
		},
		{ immediate: true },
	)
}
