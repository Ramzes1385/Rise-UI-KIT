import type { Ref } from 'vue'
import { isSafeUrl } from '@utils/urlUtils'
import { formatMediaTime } from '@utils/mediaUtils'
import { usePlayerOverlays } from './usePlayerOverlays'
import { useMediaElement } from '../core/useMediaElement'
import { useMediaEventLog } from '../core/useMediaEventLog'
import { usePlayerPlaylist } from '../playlist/usePlayerPlaylist'
import { isHlsSource, useHlsAdapter } from '../core/useHlsAdapter'
import { UI_PLAYER, formatMessage, formatNumber } from '../messages'
import { TELEPORT_TARGET_KEY } from '@composables/useTeleportTarget'
import { isAudioSource, useMediaSources } from '../core/useMediaSources'
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import type { MediaState, MediaSourceItem } from '../../types/playback/MediaCore.types'
import type { BaseMediaPlayerEmits, MediaPlayerProps } from '../../types/BaseMediaPlayer.types'

const IMAGE_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

const LINK_PROTOCOLS = ['http:', 'https:'] as const

function safeUrl(url: string | undefined, protocols: readonly string[]): string | undefined {
	return url && isSafeUrl(url, protocols) ? url : undefined
}

export function useLabels(state: Readonly<MediaState>) {
	return {
		playLabel: computed(() => (state.isPaused ? UI_PLAYER.PLAY : UI_PLAYER.PAUSE)),
		muteLabel: computed(() => (state.isMuted || state.volume === 0 ? UI_PLAYER.UNMUTE : UI_PLAYER.MUTE)),
		currentTimeText: computed(() => formatMediaTime(state.currentTime, state.duration)),
		durationText: computed(() => formatMediaTime(state.duration)),
		seekValueText: computed(() =>
			formatMessage(UI_PLAYER.TIME, {
				current: formatMediaTime(state.currentTime, state.duration),
				duration: formatMediaTime(state.duration),
			}),
		),
		volumeValue: computed(() => (state.isMuted ? 0 : state.volume)),
		volumeValueText: computed(() => formatNumber(state.isMuted ? 0 : state.volume, { style: 'percent', maximumFractionDigits: 0 })),
	}
}

function usePlayerSources(
	props: MediaPlayerProps,
	player: { media: Readonly<Ref<HTMLVideoElement | null>>; sources: () => MediaSourceItem[] | string | undefined },
) {
	const { media } = player
	const sources = useMediaSources({
		sources: player.sources,
		allowedProtocols: () => props.allowedProtocols,
		media,
		canPlay: item => isHlsSource(item) && Boolean(props.hls?.isSupported()),
	})
	const hls = useHlsAdapter({ Hls: () => props.hls, config: () => props.hlsConfig, media, source: () => sources.activeSource.value })
	const fileQualities = computed(() =>
		sources.playableSources.value.filter(source => source.label).map(source => ({ id: source.src, label: source.label as string })),
	)
	return {
		sources,
		hls,
		view: {
			src: computed(() => (hls.isHlsActive.value ? undefined : sources.activeSource.value?.src)),
			qualities: computed(() => (hls.isHlsActive.value ? hls.hlsQuality.options.value : fileQualities.value)),
			activeQualityId: computed(() => (hls.isHlsActive.value ? hls.hlsQuality.activeId.value : sources.activeSource.value?.src)),
			isAudioMode: computed(() => props.mode === 'audio' || (props.mode === 'auto' && isAudioSource(sources.activeSource.value))),
			selectQuality(id: string): void {
				if (hls.isHlsActive.value) return hls.hlsQuality.select(id)
				const source = sources.playableSources.value.find(item => item.src === id)
				if (source) sources.setSource(source)
			},
		},
	}
}

function accentStyle(color: string | undefined): Record<string, string> {
	return color ? { '--media-primary': color, '--media-primary-strong': `color-mix(in oklab, ${color} 72%, black)` } : {}
}

function usePlayerView(props: MediaPlayerProps, series: ReturnType<typeof usePlayerPlaylist>, isAudio: Readonly<Ref<boolean>>) {
	const posterSrc = computed(() => safeUrl(series.content.poster(), IMAGE_PROTOCOLS))
	const posterVideoSrc = computed(() => safeUrl(series.content.posterVideo(), IMAGE_PROTOCOLS))
	return {
		posterSrc,
		posterVideoSrc,
		hasCover: (): boolean => Boolean(posterSrc.value || posterVideoSrc.value),
		logoSrc: computed(() => safeUrl(props.logo, IMAGE_PROTOCOLS)),
		logoLink: computed(() => safeUrl(props.logoHref, LINK_PROTOCOLS)),
		rootStyle: computed(() => ({
			...accentStyle(props.accentColor),
			...(isAudio.value ? {} : { aspectRatio: props.aspectRatio, '--media-aspect': props.aspectRatio }),
		})),
		rates: computed(() => [...props.playbackRates].sort((a, b) => a - b)),
	}
}

function useTeleportLayer(root: Readonly<Ref<HTMLElement | null>>): HTMLElement | null {
	const layer = typeof document === 'undefined' ? null : document.createElement('div')
	layer?.classList.add('base-media-player__layer')
	provide(TELEPORT_TARGET_KEY, layer ?? 'body')
	onMounted(() => layer && root.value?.append(layer))
	onBeforeUnmount(() => layer?.remove())
	return layer
}

function usePlayerElements() {
	const rootRef = ref<HTMLElement | null>(null)
	return {
		rootRef,
		mediaRef: ref<HTMLVideoElement | null>(null),
		audioRef: ref<HTMLAudioElement | null>(null),
		adMediaRef: ref<HTMLVideoElement | null>(null),
		clipMediaRef: ref<HTMLVideoElement | null>(null),
		soundRef: ref<HTMLMediaElement | null>(null),
		controlsRef: ref<HTMLElement | null>(null),
		layer: useTeleportLayer(rootRef),
	}
}

export function usePlayerBase(props: MediaPlayerProps, playerEmit: BaseMediaPlayerEmits) {
	const elements = usePlayerElements()
	const { state, actions } = useMediaElement(elements.mediaRef, elements.soundRef)
	const { eventLog, logEmits } = useMediaEventLog({ media: elements.mediaRef, state })
	const emit = logEmits(playerEmit)
	const series = usePlayerPlaylist(props, emit)
	const { sources, hls, view } = usePlayerSources(props, { media: elements.mediaRef, sources: series.content.sources })
	const cover = usePlayerView(props, series, view.isAudioMode)
	const overlays = usePlayerOverlays(props, {
		state,
		activeSource: sources.activeSource,
		adapterError: hls.hlsError,
		hasCover: cover.hasCover,
	})
	return { elements, state, actions, eventLog, emit, series, sources, hls, view, cover, overlays }
}
