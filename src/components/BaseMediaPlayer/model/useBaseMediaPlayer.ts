import type { Ref } from 'vue'
import { isSafeUrl } from '@utils/urlUtils'
import { formatMediaTime } from './mediaTime'
import { UI_PLAYER } from '@/locales/messages'
import { usePlayerTools } from './usePlayerTools'
import { useIdleControls } from './useIdleControls'
import { useMediaElement } from './useMediaElement'
import { useMediaHotkeys } from './useMediaHotkeys'
import { useMediaSources } from './useMediaSources'
import { usePlayerModels } from './usePlayerModels'
import { usePlayerCaptions } from './usePlayerCaptions'
import { usePlayerOverlays } from './usePlayerOverlays'
import { useMediaFullscreen } from './useMediaFullscreen'
import { formatMessage, formatNumber } from '@/locales/state'
import { TELEPORT_TARGET_KEY } from '@composables/useTeleportTarget'
import type { MediaState, MediaActions } from '../types/MediaCore.types'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import type { BaseMediaPlayerEmits, BaseMediaPlayerExpose, MediaPlayerProps } from '../types/BaseMediaPlayer.types'

const IMAGE_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

const LINK_PROTOCOLS = ['http:', 'https:'] as const

const CLASS_KEYS = ['root', 'media', 'overlay', 'controls', 'seek', 'volume', 'time', 'title', 'logo']

function safeUrl(url: string | undefined, protocols: readonly string[]): string | undefined {
	return url && isSafeUrl(url, protocols) ? url : undefined
}

function nextRate(rates: number[], current: number, direction: 1 | -1): number | undefined {
	const sorted = [...rates].sort((a, b) => a - b)
	return direction > 0 ? sorted.find(rate => rate > current) : sorted.filter(rate => rate < current).pop()
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

function usePlayerView(props: MediaPlayerProps, sources: ReturnType<typeof useMediaSources>) {
	return {
		src: computed(() => sources.activeSource.value?.src),
		posterSrc: computed(() => safeUrl(props.poster, IMAGE_PROTOCOLS)),
		logoSrc: computed(() => safeUrl(props.logo, IMAGE_PROTOCOLS)),
		logoLink: computed(() => safeUrl(props.logoHref, LINK_PROTOCOLS)),
		rootStyle: computed(() => ({ aspectRatio: props.aspectRatio })),
		rates: computed(() => [...props.playbackRates].sort((a, b) => a - b)),
		qualities: computed(() => sources.playableSources.value.filter(source => source.label)),
		selectQuality: sources.setSource,
	}
}

function usePlayerHotkeys(
	target: Readonly<Ref<HTMLElement | null>>,
	props: MediaPlayerProps,
	media: {
		state: Readonly<MediaState>
		actions: MediaActions
		toggleFullscreen: () => void
		toggleTheater: () => void
		toggleCaptions: () => void
	},
): void {
	const { state, actions } = media
	useMediaHotkeys(target, {
		isEnabled: () => props.hasKeyboardShortcuts,
		seekStep: () => props.seekStep,
		seekStepLarge: () => props.seekStepLarge,
		volumeStep: () => props.volumeStep,
		actions: {
			togglePlay: () => void actions.togglePlay(),
			seekBy: actions.seekBy,
			seekToFraction: fraction => actions.seek(state.duration * fraction),
			changeVolume: delta => actions.setVolume(state.volume + delta),
			toggleMute: actions.toggleMute,
			toggleFullscreen: media.toggleFullscreen,
			toggleTheater: media.toggleTheater,
			toggleCaptions: media.toggleCaptions,
			stepPlaybackRate(direction) {
				const rate = nextRate(props.playbackRates, state.playbackRate, direction)
				if (rate !== undefined) actions.setPlaybackRate(rate)
			},
		},
	})
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

function usePlayerIdle(props: MediaPlayerProps, elements: ReturnType<typeof usePlayerElements>, state: Readonly<MediaState>) {
	const isFocusInPanel = (): boolean =>
		[elements.controlsRef.value, elements.layer].some(panel => panel?.contains(document.activeElement))
	return useIdleControls(elements.rootRef, {
		timeout: () => props.idleTimeout,
		canHide: () => !state.isPaused && !isFocusInPanel(),
	}).isIdle
}

export function useBaseMediaPlayer(props: MediaPlayerProps, emit: BaseMediaPlayerEmits) {
	const elements = usePlayerElements()
	const { state, actions } = useMediaElement(elements.mediaRef)
	const sources = useMediaSources({
		sources: () => props.sources,
		allowedProtocols: () => props.allowedProtocols,
		media: elements.mediaRef,
	})
	const overlays = usePlayerOverlays(props, { state, activeSource: sources.activeSource })
	const models = usePlayerModels(props, emit, { state, actions })
	const { fullscreen, ...screen } = useScreenModes(elements, models.isTheater)
	const tools = usePlayerTools(props, emit, {
		state,
		actions,
		media: elements.mediaRef,
		activeSource: () => sources.activeSource.value,
		toggleFullscreen: screen.toggleFullscreen,
	})
	const captions = usePlayerCaptions(props, emit, { state, media: elements.mediaRef, root: elements.rootRef, flash: tools.flash })
	usePlayerHotkeys(elements.rootRef, props, {
		state,
		actions,
		toggleFullscreen: screen.toggleFullscreen,
		toggleTheater: models.toggleTheater,
		toggleCaptions: captions.toggleCaptions,
	})

	return {
		...useStandardBaseComponent('base-media-player', props, CLASS_KEYS),
		...useLabels(state),
		...usePlayerView(props, sources),
		...overlays,
		...models,
		...elements,
		...tools,
		...captions,
		...screen,
		state,
		actions,
		isIdle: usePlayerIdle(props, elements, state),
		togglePlay: () => void actions.togglePlay(),
		exposed: { ...actions, state, getMediaElement: () => elements.mediaRef.value } satisfies BaseMediaPlayerExpose,
		onMediaEvent: usePlayerEvents(props, emit, { src: () => sources.activeSource.value?.src, actions, overlays, fullscreen }),
	}
}
