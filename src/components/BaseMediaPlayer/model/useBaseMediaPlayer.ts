import type { Ref } from 'vue'
import { UI_PLAYER } from './messages'
import { useMediaMini } from './useMediaMini'
import { computed, provide, watch } from 'vue'
import { usePlayerCast } from './usePlayerCast'
import { usePlayerTools } from './usePlayerTools'
import { useSeekPreview } from './useSeekPreview'
import { useAmbientLight } from './useAmbientLight'
import { useIdleControls } from './useIdleControls'
import { usePlayerModels } from './usePlayerModels'
import { useMediaRotation } from './useMediaRotation'
import { usePlayerHotkeys } from './usePlayerHotkeys'
import { withFrameItems } from './useMediaContextMenu'
import { usePlayerCaptions } from './usePlayerCaptions'
import { PLAYER_CONTEXT_KEY } from './usePlayerContext'
import { usePlayerOverlays } from './usePlayerOverlays'
import { useMediaFullscreen } from './useMediaFullscreen'
import { useMediaAudioTracks } from './useMediaAudioTracks'
import { useLabels, usePlayerBase } from './usePlayerSetup'
import type { MediaEventLogEntry } from '../types/MediaStatsPanel.types'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { MEDIA_PROTOCOLS, type useMediaSources } from './useMediaSources'
import { usePlayerEpisodes, usePlayerPlaylist } from './usePlayerPlaylist'
import type { MediaAudioProvider, MediaAudioTrackItem } from '../types/MediaAudio.types'
import type { MediaState, MediaActions, MediaSourceItem } from '../types/MediaCore.types'
import { lowestSource, usePlayerAds, usePlayerClips, usePlayerNotices } from './usePlayerInserts'
import type { BaseMediaPlayerEmits, BaseMediaPlayerExpose, MediaPlayerProps } from '../types/BaseMediaPlayer.types'

const CLASS_KEYS = ['root', 'media', 'overlay', 'controls', 'seek', 'volume', 'time', 'title', 'logo']

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
		elements: ReturnType<typeof usePlayerBase>['elements']
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

function useScreenModes(
	props: MediaPlayerProps,
	elements: ReturnType<typeof usePlayerBase>['elements'],
	player: { isTheater: Readonly<Ref<boolean>>; state: Readonly<MediaState>; actions: MediaActions },
) {
	const fullscreen = useMediaFullscreen(elements.rootRef, elements.mediaRef)
	const isFullscreen = (): boolean => fullscreen.isFullscreen.value
	const { rootRef: root, mediaRef: media } = elements
	return {
		fullscreen,
		toggleFullscreen: (): void => void fullscreen.toggle(),
		isFullscreen: fullscreen.isFullscreen,
		isFullscreenSupported: fullscreen.isSupported,
		fullscreenLabel: computed(() => (fullscreen.isFullscreen.value ? UI_PLAYER.EXIT_FULLSCREEN : UI_PLAYER.FULLSCREEN)),
		theaterLabel: computed(() => (player.isTheater.value ? UI_PLAYER.EXIT_THEATER : UI_PLAYER.THEATER)),
		...useMediaMini({ root, isEnabled: () => props.hasMiniPlayer, isFullscreen, state: player.state, pause: player.actions.pause }),
		...useMediaRotation({ media, isFullscreen }),
		...useAmbientLight({ media, state: player.state }),
	}
}

function usePlayerIdle(
	props: MediaPlayerProps,
	elements: ReturnType<typeof usePlayerBase>['elements'],
	player: { state: Readonly<MediaState>; isAudio: Readonly<Ref<boolean>>; isPanelOpen: () => boolean },
) {
	const isFocusInPanel = (): boolean =>
		[elements.controlsRef.value, elements.layer].some(panel => panel?.contains(document.activeElement))
	const isPointerOnPanel = (): boolean => Boolean(elements.controlsRef.value?.matches(':hover'))
	const isBusy = (): boolean => player.isAudio.value || player.state.isPaused || player.isPanelOpen()
	return useIdleControls(elements.rootRef, {
		timeout: () => props.idleTimeout,
		canHide: () => !isBusy() && !isFocusInPanel() && !isPointerOnPanel(),
	}).isIdle
}

function usePlayerExtras(
	props: MediaPlayerProps,
	emit: BaseMediaPlayerEmits,
	player: {
		state: Readonly<MediaState>
		actions: MediaActions
		elements: ReturnType<typeof usePlayerBase>['elements']
		series: ReturnType<typeof usePlayerPlaylist>
		activeSource: () => MediaSourceItem | null | undefined
		toggleFullscreen: () => void
		isCasting: () => boolean
		events: () => MediaEventLogEntry[]
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
		events: player.events,
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
		elements: ReturnType<typeof usePlayerBase>['elements']
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

export function createPlayerContext(props: MediaPlayerProps, playerEmit: BaseMediaPlayerEmits) {
	const { elements, state, actions, eventLog, emit, series, sources, hls, view, cover, overlays } = usePlayerBase(props, playerEmit)
	const models = usePlayerModels(props, emit, { state, actions })
	const { fullscreen, ...screen } = useScreenModes(props, elements, { isTheater: models.isTheater, state, actions })
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
		events: () => eventLog.value,
	})
	usePlayerKeys(elements.rootRef, props, { state, actions, screen, models, cast, isAudio: view.isAudioMode, ...extras })
	const retryPlayback = (): void => (hls.isHlsActive.value ? hls.retryHls() : actions.retry())

	return {
		...useStandardBaseComponent('base-media-player', props, CLASS_KEYS),
		props,
		...useLabels(state),
		...cover,
		...view,
		...overlays,
		...models,
		...elements,
		...extrasContext(extras),
		contextItems: withFrameItems(extras.tools.contextItems, { ...screen, isAudio: view.isAudioMode }),
		...usePlayerPreview(props, { state, series, sources, isAudio: view.isAudioMode }),
		...usePlayerAudio(props, emit, { elements, flash: extras.tools.flash, stream: hls.hlsAudio, tracks: series.content.audioTracks }),
		...screen,
		state,
		actions,
		isIdle: usePlayerIdle(props, elements, {
			state,
			isAudio: view.isAudioMode,
			isPanelOpen: () => extras.episodes.isEpisodesOpen.value,
		}),
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
