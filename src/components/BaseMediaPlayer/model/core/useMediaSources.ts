import { computed, ref } from 'vue'
import { isSafeUrl } from '@utils/data/urlUtils'
import type { MediaSourceItem, MediaSourcesOptions } from '../../types/playback/MediaCore.types'

export const MEDIA_PROTOCOLS = ['http:', 'https:', 'blob:'] as const

const AUDIO_EXTENSIONS = /\.(?:mp3|m4a|aac|oga|ogg|opus|wav|flac|weba)(?:[?#]|$)/i

export function isAudioSource(item: MediaSourceItem | null | undefined): boolean {
	return Boolean(item && (item.type?.toLowerCase().startsWith('audio/') || AUDIO_EXTENSIONS.test(item.src)))
}

function normalizeSources(sources: MediaSourceItem[] | string | undefined, allowed: readonly string[]): MediaSourceItem[] {
	const list = typeof sources === 'string' ? [{ src: sources }] : (sources ?? [])
	return list.filter(item => isSafeUrl(item.src, allowed))
}

function isPlayable(media: HTMLMediaElement, item: MediaSourceItem, canPlay?: (item: MediaSourceItem) => boolean): boolean {
	return !item.type || media.canPlayType(item.type) !== '' || Boolean(canPlay?.(item))
}

export function firstPlayable(
	sources: MediaSourceItem[] | string | undefined,
	allowed: readonly string[],
	media: HTMLMediaElement,
): MediaSourceItem | undefined {
	return normalizeSources(sources, allowed).find(item => isPlayable(media, item))
}

function resumeAfterSwitch(media: HTMLMediaElement): void {
	const time = media.currentTime
	const wasPlaying = !media.paused
	media.addEventListener(
		'loadedmetadata',
		() => {
			media.currentTime = time
			if (wasPlaying) void media.play().catch(() => undefined)
		},
		{ once: true },
	)
}

export function useMediaSources(options: MediaSourcesOptions) {
	const selectedSrc = ref<string | null>(null)
	const sources = computed(() => normalizeSources(options.sources(), options.allowedProtocols?.() ?? MEDIA_PROTOCOLS))
	const playableSources = computed(() => {
		const media = options.media.value
		return media ? sources.value.filter(item => isPlayable(media, item, options.canPlay)) : []
	})
	const activeSource = computed<MediaSourceItem | null | undefined>(() => {
		if (!options.media.value) return undefined
		return playableSources.value.find(item => item.src === selectedSrc.value) ?? playableSources.value[0] ?? null
	})

	return {
		sources,
		playableSources,
		activeSource,
		setSource(item: MediaSourceItem): void {
			if (item.src === activeSource.value?.src) return
			if (options.media.value) resumeAfterSwitch(options.media.value)
			selectedSrc.value = item.src
		},
	}
}
