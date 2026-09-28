import type { Ref } from 'vue'
import { isSafeUrl } from '@utils/urlUtils'
import { formatMediaTime } from './mediaTime'
import { useIdleControls } from './useIdleControls'
import { useMediaElement } from './useMediaElement'
import { useMediaHotkeys } from './useMediaHotkeys'
import { useMediaSources } from './useMediaSources'
import { computed, onMounted, ref, watch } from 'vue'
import { UI_PLAYER, UI_TEXT } from '@/locales/messages'
import { useMediaFullscreen } from './useMediaFullscreen'
import { formatMessage, formatNumber } from '@/locales/state'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseMediaPlayerEmits, BaseMediaPlayerExpose, MediaPlayerProps } from '../types/BaseMediaPlayer.types'
import type { MediaState, MediaActions, MediaErrorCode, MediaSourceItem, MediaPlayerError } from '../types/MediaCore.types'

const POSTER_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

const NO_SOURCE_ERROR: MediaPlayerError = { code: 'unsupported' }

const ERROR_MESSAGES: Record<MediaErrorCode, () => string> = {
	aborted: () => UI_PLAYER.ERROR_ABORTED,
	network: () => UI_PLAYER.ERROR_NETWORK,
	decode: () => UI_PLAYER.ERROR_DECODE,
	unsupported: () => UI_PLAYER.ERROR_UNSUPPORTED,
	'autoplay-blocked': () => UI_PLAYER.ERROR_AUTOPLAY,
	unknown: () => UI_PLAYER.ERROR_UNKNOWN,
}

function nextRate(rates: number[], current: number, direction: 1 | -1): number | undefined {
	const sorted = [...rates].sort((a, b) => a - b)
	return direction > 0 ? sorted.find(rate => rate > current) : sorted.filter(rate => rate < current).pop()
}

function useLabels(state: Readonly<MediaState>) {
	const isSilent = computed(() => state.isMuted || state.volume === 0)
	return {
		isSilent,
		playLabel: computed(() => (state.isPaused ? UI_PLAYER.PLAY : UI_PLAYER.PAUSE)),
		muteLabel: computed(() => (isSilent.value ? UI_PLAYER.UNMUTE : UI_PLAYER.MUTE)),
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

function usePlayerHotkeys(
	target: Readonly<Ref<HTMLElement | null>>,
	props: MediaPlayerProps,
	{ state, actions, toggleFullscreen }: { state: Readonly<MediaState>; actions: MediaActions; toggleFullscreen: () => void },
): void {
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
			toggleFullscreen,
			stepPlaybackRate(direction) {
				const rate = nextRate(props.playbackRates, state.playbackRate, direction)
				if (rate !== undefined) actions.setPlaybackRate(rate)
			},
		},
	})
}

function usePlayerErrors(
	state: Readonly<MediaState>,
	actions: MediaActions,
	activeSource: Readonly<Ref<MediaSourceItem | null | undefined>>,
) {
	const error = computed(() => state.error ?? (activeSource.value === null ? NO_SOURCE_ERROR : null))
	return {
		error,
		errorMessage: computed(() => error.value && ERROR_MESSAGES[error.value.code]()),
		errorAction: computed(() => {
			if (!state.error || !activeSource.value) return null
			if (state.error.code === 'autoplay-blocked') return { label: UI_PLAYER.PLAY, run: () => void actions.play() }
			return { label: UI_TEXT.RETRY, run: actions.retry }
		}),
	}
}

export function useBaseMediaPlayer(props: MediaPlayerProps, emit: BaseMediaPlayerEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const mediaRef = ref<HTMLVideoElement | null>(null)
	const controlsRef = ref<HTMLElement | null>(null)
	const { state, actions } = useMediaElement(mediaRef)
	const { activeSource } = useMediaSources({
		sources: () => props.sources,
		allowedProtocols: () => props.allowedProtocols,
		media: mediaRef,
	})
	const fullscreen = useMediaFullscreen(rootRef, mediaRef)
	const toggleFullscreen = (): void => void fullscreen.toggle()
	const { isIdle } = useIdleControls(rootRef, {
		timeout: () => props.idleTimeout,
		canHide: () => !state.isPaused && !controlsRef.value?.contains(document.activeElement),
	})
	const errors = usePlayerErrors(state, actions, activeSource)

	usePlayerHotkeys(rootRef, props, { state, actions, toggleFullscreen })
	watch(errors.error, value => value && emit('error', value), { immediate: true })
	onMounted(() => {
		if (props.isAutoplay) void actions.play()
	})

	return {
		...useStandardBaseComponent('base-media-player', props, ['root', 'media', 'overlay', 'controls', 'seek', 'volume', 'time']),
		...useLabels(state),
		...errors,
		rootRef,
		mediaRef,
		controlsRef,
		state,
		actions,
		isIdle,
		togglePlay: () => void actions.togglePlay(),
		toggleFullscreen,
		isFullscreen: fullscreen.isFullscreen,
		isFullscreenSupported: fullscreen.isSupported,
		fullscreenLabel: computed(() => (fullscreen.isFullscreen.value ? UI_PLAYER.EXIT_FULLSCREEN : UI_PLAYER.FULLSCREEN)),
		src: computed(() => activeSource.value?.src),
		posterSrc: computed(() => (props.poster && isSafeUrl(props.poster, POSTER_PROTOCOLS) ? props.poster : undefined)),
		rootStyle: computed(() => ({ aspectRatio: props.aspectRatio })),
		exposed: { ...actions, state, getMediaElement: () => mediaRef.value } satisfies BaseMediaPlayerExpose,
		onMediaEvent: { play: () => emit('play'), pause: () => emit('pause'), ended: () => emit('ended') },
	}
}
