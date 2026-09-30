import { computed, ref } from 'vue'
import { isSafeUrl } from '@utils/data/urlUtils'
import type { MediaSourceItem, MediaSourcesOptions, MediaSwitchSnapshot } from '../../types/playback/MediaCore.types'

export const MEDIA_PROTOCOLS = ['http:', 'https:', 'blob:'] as const

const AUDIO_EXTENSIONS = /\.(?:mp3|m4a|aac|oga|ogg|opus|wav|flac|weba)(?:[?#]|$)/i

export function isAudioSource(item: MediaSourceItem | null | undefined): boolean {
	return Boolean(item && (item.type?.toLowerCase().startsWith('audio/') || AUDIO_EXTENSIONS.test(item.src)))
}

export function sourceHeight(item: MediaSourceItem): number {
	return item.height ?? Number.parseInt(item.label ?? '', 10)
}

export function sizedSources(list: MediaSourceItem[]): MediaSourceItem[] {
	return list.filter(item => Number.isFinite(sourceHeight(item))).sort((a, b) => sourceHeight(a) - sourceHeight(b))
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

function pickAuto(list: MediaSourceItem[], target: number): MediaSourceItem | undefined {
	const sized = sizedSources(list)
	if (sized.length < 2 || target <= 0) return undefined
	return sized.find(item => sourceHeight(item) >= target) ?? sized.at(-1)
}

function useSwitchResume() {
	let pending: MediaSwitchSnapshot | null = null
	let listener: (() => void) | null = null
	return (media: HTMLMediaElement): void => {
		const snapshot = pending ?? { time: media.currentTime, isPlaying: !media.paused, rate: media.playbackRate }
		if (listener) media.removeEventListener('loadedmetadata', listener)
		pending = snapshot
		listener = (): void => {
			pending = null
			listener = null
			media.currentTime = snapshot.time
			media.playbackRate = snapshot.rate
			if (snapshot.isPlaying) void media.play().catch(() => undefined)
		}
		media.addEventListener('loadedmetadata', listener, { once: true })
	}
}

function usePreferredSource(playableSources: Readonly<{ value: MediaSourceItem[] }>) {
	const selected = ref<MediaSourceItem | null>(null)
	const find = (wanted: MediaSourceItem): MediaSourceItem | undefined =>
		playableSources.value.find(item => item.src === wanted.src) ??
		playableSources.value.find(item => Boolean(wanted.label) && item.label === wanted.label)
	return {
		selected,
		preferred: computed(() => (selected.value ? find(selected.value) : undefined)),
	}
}

export function useMediaSources(options: MediaSourcesOptions) {
	const isAuto = ref(true)
	const targetHeight = ref(0)
	const resume = useSwitchResume()
	const sources = computed(() => normalizeSources(options.sources(), options.allowedProtocols?.() ?? MEDIA_PROTOCOLS))
	const playableSources = computed(() => {
		const media = options.media.value
		return media ? sources.value.filter(item => isPlayable(media, item, options.canPlay)) : []
	})
	const { selected, preferred } = usePreferredSource(playableSources)
	const autoSource = computed(() => pickAuto(playableSources.value, targetHeight.value))
	const activeSource = computed<MediaSourceItem | null | undefined>(() => {
		if (!options.media.value) return undefined
		const chosen = isAuto.value ? autoSource.value : preferred.value
		return chosen ?? playableSources.value[0] ?? null
	})
	const switchTo = (change: () => void): void => {
		const before = activeSource.value?.src
		change()
		if (options.media.value && before && activeSource.value?.src !== before) resume(options.media.value)
	}

	return {
		sources,
		playableSources,
		activeSource,
		hasAutoQuality: computed(() => sizedSources(playableSources.value).length > 1),
		isAutoQuality: computed(() => isAuto.value),
		setSource(item: MediaSourceItem): void {
			switchTo(() => {
				isAuto.value = false
				selected.value = item
			})
		},
		setAutoQuality(): void {
			switchTo(() => {
				isAuto.value = true
			})
		},
		setTargetHeight(height: number): void {
			if (height <= targetHeight.value) return
			switchTo(() => {
				targetHeight.value = height
			})
		},
	}
}
