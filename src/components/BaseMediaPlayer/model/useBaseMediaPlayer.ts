import type { Ref } from 'vue'
import { isSafeUrl } from '@utils/urlUtils'
import { usePlayerCast } from './usePlayerCast'
import { usePlayerTools } from './usePlayerTools'
import { useSeekPreview } from './useSeekPreview'
import { useIdleControls } from './useIdleControls'
import { useMediaElement } from './useMediaElement'
import { usePlayerModels } from './usePlayerModels'
import { formatMediaTime } from '@utils/mediaUtils'
import { usePlayerHotkeys } from './usePlayerHotkeys'
import { usePlayerCaptions } from './usePlayerCaptions'
import { PLAYER_CONTEXT_KEY } from './usePlayerContext'
import { usePlayerOverlays } from './usePlayerOverlays'
import { useMediaFullscreen } from './useMediaFullscreen'
import { useMediaAudioTracks } from './useMediaAudioTracks'
import { isHlsSource, useHlsAdapter } from './useHlsAdapter'
import { UI_PLAYER, formatMessage, formatNumber } from './messages'
import { TELEPORT_TARGET_KEY } from '@composables/useTeleportTarget'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { usePlayerEpisodes, usePlayerPlaylist } from './usePlayerPlaylist'
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { isAudioSource, MEDIA_PROTOCOLS, useMediaSources } from './useMediaSources'
import type { MediaAudioProvider, MediaAudioTrackItem } from '../types/MediaAudio.types'
import type { MediaState, MediaActions, MediaSourceItem } from '../types/MediaCore.types'
import { lowestSource, usePlayerAds, usePlayerClips, usePlayerNotices } from './usePlayerInserts'
import type { BaseMediaPlayerEmits, BaseMediaPlayerExpose, MediaPlayerProps } from '../types/BaseMediaPlayer.types'

const IMAGE_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

const LINK_PROTOCOLS = ['http:', 'https:'] as const

const CLASS_KEYS = ['root', 'media', 'overlay', 'controls', 'seek', 'volume', 'time', 'title', 'logo']

function safeUrl(url: string | undefined, protocols: readonly string[]): string | undefined {
	return url && isSafeUrl(url, protocols) ? url : undefined
}

function useLabels(state: Readonly<MediaState>) {
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

function usePlayerView(props: MediaPlayerProps, view: { poster: () => string | undefined; isAudio: Readonly<Ref<boolean>> }) {
	return {
		posterSrc: computed(() => safeUrl(view.poster(), IMAGE_PROTOCOLS)),
		logoSrc: computed(() => safeUrl(props.logo, IMAGE_PROTOCOLS)),
		logoLink: computed(() => safeUrl(props.logoHref, LINK_PROTOCOLS)),
		rootStyle: computed(() => (view.isAudio.value ? {} : { aspectRatio: props.aspectRatio })),
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

function usePlayerEvents(
	props: MediaPlayerProps,
	emit: BaseMediaPlayerEmits,
	player: {
		src: () => string | undefined
		actions: MediaActions
		overlays: ReturnType<typeof usePlayerOverlays>
		fullscreen: ReturnType<typeof useMediaFullscreen>
	},
) {
	watch(player.overlays.error, value => value && emit('error', value), { immediate: true })
	watch(player.fullscreen.isFullscreen, value => emit('fullscreen-change', value))
	let hasAutoplayed = false
	watch(
		player.src,
		src => {
			if (!src || hasAutoplayed || !props.isAutoplay) return
			hasAutoplayed = true
			void player.actions.play()
		},
		{ flush: 'post' },
	)
	return {
		play: () => {
			player.overlays.markStarted()
			emit('play')
		},
		pause: () => emit('pause'),
		ended: () => emit('ended'),
	}
}

function usePlayerAudio(
	props: MediaPlayerProps,
	emit: BaseMediaPlayerEmits,
	player: {
		elements: ReturnType<typeof usePlayerElements>
		flash: (message: string) => void
		stream: MediaAudioProvider
		tracks: () => MediaAudioTrackItem[] | undefined
	},
) {
	return useMediaAudioTracks({
		tracks: player.tracks,
		audioTrack: () => props.audioTrack,
		allowedProtocols: () => props.allowedProtocols ?? MEDIA_PROTOCOLS,
		video: player.elements.mediaRef,
		audio: player.elements.audioRef,
		sound: player.elements.soundRef,
		emitTrack: id => emit('update:audioTrack', id),
		flash: player.flash,
		stream: player.stream,
	})
}

function useScreenModes(elements: ReturnType<typeof usePlayerElements>, isTheater: Readonly<Ref<boolean>>) {
	const fullscreen = useMediaFullscreen(elements.rootRef, elements.mediaRef)
	return {
		fullscreen,
		toggleFullscreen: (): void => void fullscreen.toggle(),
		isFullscreen: fullscreen.isFullscreen,
		isFullscreenSupported: fullscreen.isSupported,
		fullscreenLabel: computed(() => (fullscreen.isFullscreen.value ? UI_PLAYER.EXIT_FULLSCREEN : UI_PLAYER.FULLSCREEN)),
		theaterLabel: computed(() => (isTheater.value ? UI_PLAYER.EXIT_THEATER : UI_PLAYER.THEATER)),
	}
}

function usePlayerIdle(
	props: MediaPlayerProps,
	elements: ReturnType<typeof usePlayerElements>,
	player: { state: Readonly<MediaState>; isAudio: Readonly<Ref<boolean>> },
) {
	const isFocusInPanel = (): boolean =>
		[elements.controlsRef.value, elements.layer].some(panel => panel?.contains(document.activeElement))
	const isPointerOnPanel = (): boolean => Boolean(elements.controlsRef.value?.matches(':hover'))
	return useIdleControls(elements.rootRef, {
		timeout: () => props.idleTimeout,
		canHide: () => !player.isAudio.value && !player.state.isPaused && !isFocusInPanel() && !isPointerOnPanel(),
	}).isIdle
}

function usePlayerExtras(
	props: MediaPlayerProps,
	emit: BaseMediaPlayerEmits,
	player: {
		state: Readonly<MediaState>
		actions: MediaActions
		elements: ReturnType<typeof usePlayerElements>
		series: ReturnType<typeof usePlayerPlaylist>
		activeSource: () => MediaSourceItem | null | undefined
		toggleFullscreen: () => void
		isCasting: () => boolean
	},
) {
	const { state, actions, elements, series } = player
	const tools = usePlayerTools(props, emit, {
		state,
		actions,
		media: elements.mediaRef,
		activeSource: player.activeSource,
		audioSource: () => elements.soundRef.value?.currentSrc || null,
		storageKey: series.content.storageKey,
		toggleFullscreen: player.toggleFullscreen,
	})
	const captions = usePlayerCaptions(props, emit, {
		state,
		media: elements.mediaRef,
		root: elements.rootRef,
		flash: tools.flash,
		tracks: series.content.tracks,
	})
	const ads = usePlayerAds(emit, { state, actions, elements, series })
	const clips = usePlayerClips(props, { state, actions, elements, series, ads })
	const isHeld = (): boolean => ads.isAdPlaying.value || clips.isClipHeld.value
	return {
		tools,
		captions,
		ads,
		clips,
		notices: usePlayerNotices(props, emit, { state, series }),
		episodes: usePlayerEpisodes(props, { ...series, state, actions, isHeld, isCasting: player.isCasting }),
	}
}

function usePlayerCasting(
	props: MediaPlayerProps,
	player: {
		state: Readonly<MediaState>
		actions: MediaActions
		elements: ReturnType<typeof usePlayerElements>
		series: ReturnType<typeof usePlayerPlaylist>
		activeSource: () => MediaSourceItem | null | undefined
		title: () => string
	},
) {
	const cast = usePlayerCast({
		media: player.elements.mediaRef,
		state: player.state,
		receiverId: () => props.castReceiverId,
		content: () => ({ source: player.activeSource(), title: player.title(), poster: player.series.content.poster() }),
		pauseLocal: player.actions.pause,
		resumeLocal(time, isPlaying) {
			player.actions.seek(time)
			if (isPlaying) void player.actions.play()
		},
	})
	watch(
		() => player.series.playlist.currentEpisode.value?.id,
		() => cast.loadCast(0),
		{ flush: 'post' },
	)
	return cast
}

function createExpose(player: {
	state: Readonly<MediaState>
	actions: MediaActions
	media: Readonly<Ref<HTMLVideoElement | null>>
	retry: () => void
	notices: { awardAchievement: (id: string) => void }
}): BaseMediaPlayerExpose {
	return {
		...player.actions,
		retry: player.retry,
		state: player.state,
		getMediaElement: () => player.media.value,
		awardAchievement: player.notices.awardAchievement,
	}
}

function extrasContext(extras: ReturnType<typeof usePlayerExtras>) {
	return { ...extras.tools, ...extras.captions, ...extras.episodes, ...extras.ads, ...extras.clips, ...extras.notices }
}

function usePlayerKeys(
	root: Readonly<Ref<HTMLElement | null>>,
	props: MediaPlayerProps,
	player: Omit<Parameters<typeof usePlayerHotkeys>[2], 'ads'> & ReturnType<typeof usePlayerExtras>,
): void {
	const isInsertPlaying = computed(() => player.ads.isAdPlaying.value || player.clips.isClipPlaying.value)
	usePlayerHotkeys(root, props, { ...player, ads: { isAdPlaying: isInsertPlaying } })
}

function usePlayerPreview(
	props: MediaPlayerProps,
	player: {
		state: Readonly<MediaState>
		series: ReturnType<typeof usePlayerPlaylist>
		sources: ReturnType<typeof useMediaSources>
		isAudio: Readonly<Ref<boolean>>
	},
) {
	const { sources } = player
	return useSeekPreview({
		thumbnails: player.series.content.thumbnails,
		source: () => lowestSource(sources.playableSources.value) ?? sources.activeSource.value,
		isEnabled: () => props.hasSeekPreview && !player.isAudio.value,
		duration: () => player.state.duration,
		crossorigin: () => props.crossorigin,
		Hls: () => props.hls,
		hlsConfig: () => props.hlsConfig,
	})
}

export function createPlayerContext(props: MediaPlayerProps, emit: BaseMediaPlayerEmits) {
	const elements = usePlayerElements()
	const { state, actions } = useMediaElement(elements.mediaRef, elements.soundRef)
	const series = usePlayerPlaylist(props, emit)
	const { sources, hls, view } = usePlayerSources(props, { media: elements.mediaRef, sources: series.content.sources })
	const overlays = usePlayerOverlays(props, { state, activeSource: sources.activeSource, adapterError: hls.hlsError })
	const models = usePlayerModels(props, emit, { state, actions })
	const { fullscreen, ...screen } = useScreenModes(elements, models.isTheater)
	const activeSource = (): MediaSourceItem | null | undefined => sources.activeSource.value
	const accessibleName = computed(() => [props.title, series.playlist.currentEpisode.value?.title].filter(Boolean).join('. '))
	const cast = usePlayerCasting(props, { state, actions, elements, series, activeSource, title: () => accessibleName.value })
	const extras = usePlayerExtras(props, emit, {
		state,
		actions,
		elements,
		series,
		activeSource,
		toggleFullscreen: screen.toggleFullscreen,
		isCasting: () => cast.isCastConnected.value,
	})
	usePlayerKeys(elements.rootRef, props, { state, actions, screen, models, cast, isAudio: view.isAudioMode, ...extras })
	const retryPlayback = (): void => (hls.isHlsActive.value ? hls.retryHls() : actions.retry())

	return {
		...useStandardBaseComponent('base-media-player', props, CLASS_KEYS),
		props,
		...useLabels(state),
		...usePlayerView(props, { poster: series.content.poster, isAudio: view.isAudioMode }),
		...view,
		...overlays,
		...models,
		...elements,
		...extrasContext(extras),
		...usePlayerPreview(props, { state, series, sources, isAudio: view.isAudioMode }),
		...usePlayerAudio(props, emit, { elements, flash: extras.tools.flash, stream: hls.hlsAudio, tracks: series.content.audioTracks }),
		...screen,
		state,
		actions,
		isIdle: usePlayerIdle(props, elements, { state, isAudio: view.isAudioMode }),
		togglePlay: () => void actions.togglePlay(),
		retryPlayback,
		accessibleName,
		...cast,
		toggleCast: () => void cast.toggleCast().then(isStarted => isStarted || extras.tools.flash(UI_PLAYER.CAST_FAILED)),
		exposed: createExpose({ state, actions, media: elements.mediaRef, retry: retryPlayback, notices: extras.notices }),
		onMediaEvent: usePlayerEvents(props, emit, { src: () => sources.activeSource.value?.src, actions, overlays, fullscreen }),
	}
}

export function useBaseMediaPlayer(props: MediaPlayerProps, emit: BaseMediaPlayerEmits) {
	const context = createPlayerContext(props, emit)
	provide(PLAYER_CONTEXT_KEY, context)
	return context
}
