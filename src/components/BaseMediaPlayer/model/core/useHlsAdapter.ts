import { computed, ref, shallowRef, watch } from 'vue'
import { UI_PLAYER, formatMessage, formatNumber } from '../messages'
import type { MediaAudioProvider } from '../../types/content/MediaAudio.types'
import type { MediaPlayerError, MediaSourceItem } from '../../types/playback/MediaCore.types'
import type {
	MediaHlsLevel,
	MediaHlsOptions,
	MediaHlsInstance,
	MediaHlsErrorData,
	MediaQualityOption,
	MediaHlsConstructor,
} from '../../types/playback/MediaHls.types'

export const HLS_TYPE = 'application/vnd.apple.mpegurl'

const REFRESH_EVENTS = ['hlsManifestParsed', 'hlsLevelsUpdated', 'hlsLevelSwitched', 'hlsAudioTracksUpdated', 'hlsAudioTrackSwitched']

const AUDIO_PREFIX = 'hls-audio:'

const LEVEL_PREFIX = 'hls:'

export function isHlsSource(item: MediaSourceItem): boolean {
	return /mpegurl/i.test(item.type ?? '') || /\.m3u8(?:[?#]|$)/i.test(item.src)
}

function levelLabel(level: MediaHlsLevel): string {
	if (level.height) return `${level.height}p`
	return level.name || formatMessage(UI_PLAYER.BITRATE, { n: formatNumber(Math.round((level.bitrate ?? 0) / 1000)) })
}

function levelOptions(levels: MediaHlsLevel[]): MediaQualityOption[] {
	return levels
		.map((level, index) => ({ level, index }))
		.sort((a, b) => (b.level.height ?? 0) - (a.level.height ?? 0) || (b.level.bitrate ?? 0) - (a.level.bitrate ?? 0))
		.map(({ level, index }) => ({ id: `${LEVEL_PREFIX}${index}`, label: levelLabel(level) }))
}

export function createHls(Hls: MediaHlsConstructor, config: Record<string, unknown> | undefined): MediaHlsInstance {
	const hls = new (Hls as unknown as new (config: Record<string, unknown>) => MediaHlsInstance)({ ...config })
	hls.subtitleDisplay = false
	return hls
}

function restartAt(media: HTMLMediaElement, time: number): void {
	media.addEventListener(
		'loadedmetadata',
		() => {
			media.currentTime = time
			void media.play().catch(() => undefined)
		},
		{ once: true },
	)
}

function useHlsRecovery(instance: Readonly<{ value: MediaHlsInstance | null }>) {
	const error = ref<MediaPlayerError | null>(null)
	const recovered = new Set<string>()
	return {
		error,
		reset(): void {
			recovered.clear()
			error.value = null
		},
		onError(data: MediaHlsErrorData): void {
			const hls = instance.value
			if (!data.fatal || !hls) return
			const isNetwork = data.type === 'networkError'
			if (!recovered.has(data.type) && (isNetwork || data.type === 'mediaError')) {
				recovered.add(data.type)
				return isNetwork ? hls.startLoad() : hls.recoverMediaError()
			}
			error.value = { code: isNetwork ? 'network' : 'decode', cause: data }
		},
	}
}

function useHlsAudio(instance: Readonly<{ value: MediaHlsInstance | null }>, version: Readonly<{ value: number }>, refresh: () => void) {
	const tracks = computed(() => (version.value >= 0 ? [...(instance.value?.audioTracks ?? [])] : []))
	return {
		options: computed(() =>
			tracks.value.length < 2
				? []
				: tracks.value.map((track, index) => ({
						id: `${AUDIO_PREFIX}${index}`,
						label: track.name || track.lang || formatMessage(UI_PLAYER.AUDIO_TRACK, { n: index + 1 }),
					})),
		),
		activeId: computed(() => (version.value >= 0 && instance.value ? `${AUDIO_PREFIX}${instance.value.audioTrack}` : null)),
		enable(id: string): void {
			if (instance.value) instance.value.audioTrack = Number(id.slice(AUDIO_PREFIX.length))
			refresh()
		},
	} satisfies MediaAudioProvider
}

function useHlsQuality(instance: Readonly<{ value: MediaHlsInstance | null }>, version: Readonly<{ value: number }>, refresh: () => void) {
	const levels = computed(() => (version.value >= 0 ? [...(instance.value?.levels ?? [])] : []))
	const currentLabel = (): string => {
		const level = levels.value[instance.value?.currentLevel ?? -1]
		return level ? `${UI_PLAYER.QUALITY_AUTO} (${levelLabel(level)})` : UI_PLAYER.QUALITY_AUTO
	}
	return {
		options: computed<MediaQualityOption[]>(() =>
			levels.value.length < 2 ? [] : [{ id: 'auto', label: currentLabel() }, ...levelOptions(levels.value)],
		),
		activeId: computed(() => {
			const hls = version.value >= 0 ? instance.value : null
			return !hls || hls.autoLevelEnabled ? 'auto' : `${LEVEL_PREFIX}${hls.currentLevel}`
		}),
		select(id: string): void {
			if (instance.value) instance.value.currentLevel = id === 'auto' ? -1 : Number(id.slice(LEVEL_PREFIX.length))
			refresh()
		},
	}
}

export function useHlsAdapter(options: MediaHlsOptions) {
	const instance = shallowRef<MediaHlsInstance | null>(null)
	const version = ref(0)
	const attempt = ref(0)
	const refresh = (): void => {
		version.value++
	}
	const recovery = useHlsRecovery(instance)
	const isActive = computed(() => {
		const Hls = options.Hls()
		const source = options.source()
		const media = options.media.value
		return Boolean(Hls && source && media && isHlsSource(source) && media.canPlayType(HLS_TYPE) === '' && Hls.isSupported())
	})
	watch(
		() => [isActive.value, options.source()?.src, attempt.value] as const,
		([active, src], _, onCleanup) => {
			const media = options.media.value
			if (!active || !src || !media) return
			const hls = createHls(options.Hls() as MediaHlsConstructor, options.config())
			REFRESH_EVENTS.forEach(name => hls.on(name, refresh))
			hls.on('hlsError', (_event, data) => recovery.onError(data))
			hls.attachMedia(media)
			hls.loadSource(src)
			instance.value = hls
			onCleanup(() => {
				hls.destroy()
				instance.value = null
			})
		},
		{ immediate: true },
	)

	return {
		isHlsActive: isActive,
		hlsError: recovery.error,
		hlsAudio: useHlsAudio(instance, version, refresh),
		hlsQuality: useHlsQuality(instance, version, refresh),
		retryHls(): void {
			const media = options.media.value
			if (media) restartAt(media, media.currentTime)
			recovery.reset()
			attempt.value++
		},
	}
}
