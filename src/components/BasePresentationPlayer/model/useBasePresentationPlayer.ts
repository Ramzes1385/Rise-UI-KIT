import type { Ref } from 'vue'
import { safeUrl } from './timeline'
import { computed, ref, watch } from 'vue'
import { UI_PRESENTATION } from './messages'
import { useSlidePlayback } from './useSlidePlayback'
import { usePresentationScreen } from './usePresentationScreen'
import { usePresentationControls } from './usePresentationControls'
import { usePresentationNavigation } from './usePresentationNavigation'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { MediaIconName } from '@components/BaseMediaPlayer/types/controls/MediaIcon.types'
import type { BasePresentationPlayerEmits, BasePresentationPlayerProps } from '../types/BasePresentationPlayer.types'

const CLASS_KEYS = ['root', 'stage', 'controls']

const INTERACTIVE_SELECTOR = 'a[href], button, input, select, textarea, label, [tabindex], [contenteditable="true"]'

function nextRate(rates: number[], current: number, direction: 1 | -1): number {
	const sorted = [...rates].sort((a, b) => a - b)
	const candidates =
		direction > 0 ? sorted.filter(rate => rate > current + 0.001) : sorted.filter(rate => rate < current - 0.001).reverse()
	return candidates[0] ?? current
}

function useElements() {
	return {
		rootRef: ref<HTMLElement | null>(null),
		audioRef: ref<HTMLAudioElement | null>(null),
		videoRef: ref<HTMLVideoElement | null>(null),
	}
}

function usePlaybackFlow(props: BasePresentationPlayerProps, emit: BasePresentationPlayerEmits, elements: ReturnType<typeof useElements>) {
	const navigation = usePresentationNavigation(props, emit)
	const isPlaying = ref(false)
	const isFinished = ref(false)
	const hasStarted = ref(false)
	const playback = useSlidePlayback(props, {
		index: navigation.index,
		isPlaying,
		audioRef: elements.audioRef,
		videoRef: elements.videoRef,
		onSlideEnd: () => {
			if (navigation.index.value < navigation.count.value - 1) return navigation.setIndex(navigation.index.value + 1)
			isPlaying.value = false
			isFinished.value = true
		},
		onTrackSlide: navigation.setIndex,
	})
	const goTo = (index: number): void => {
		isFinished.value = false
		if (index === navigation.index.value) playback.seekInSlide(0)
		navigation.setIndex(index)
	}
	const play = (): void => {
		if (isFinished.value) goTo(0)
		hasStarted.value = true
		isPlaying.value = true
	}

	watch(isPlaying, value => (value ? emit('play') : emit('pause')))

	return {
		...navigation,
		playback,
		isPlaying,
		isFinished,
		hasStarted,
		goTo,
		play,
		pause: (): void => void (isPlaying.value = false),
		togglePlay: (): void => (isPlaying.value ? void (isPlaying.value = false) : play()),
		next: (): void => {
			if (navigation.index.value < navigation.count.value - 1) goTo(navigation.index.value + 1)
		},
		previous: (): void => {
			if (navigation.index.value > 0) goTo(navigation.index.value - 1)
		},
	}
}

function useStageView(flow: ReturnType<typeof usePlaybackFlow>, playLabel: Readonly<Ref<string>>) {
	const { playback } = flow
	return {
		slide: playback.slide,
		audioSrc: playback.audioSrc,
		videoSrc: playback.videoSrc,
		isVideoMuted: computed(() => playback.isShared.value || Boolean(playback.audioSrc.value)),
		imageSrc: computed(() => safeUrl(playback.slide.value?.image)),
		isWaiting: computed(() => flow.isPlaying.value && playback.state.isWaiting),
		isStartScreen: computed(() => !flow.isPlaying.value && (!flow.hasStarted.value || flow.isFinished.value)),
		playIcon: computed<MediaIconName>(() => {
			if (flow.isPlaying.value) return 'pause'
			return flow.isFinished.value ? 'replay' : 'play'
		}),
		playLabel: computed(() => (flow.isFinished.value && !flow.isPlaying.value ? UI_PRESENTATION.REPLAY : playLabel.value)),
		onStageClick(event: MouseEvent): void {
			if (!(event.target as Element).closest(INTERACTIVE_SELECTOR)) flow.togglePlay()
		},
		setVolume: playback.setVolume,
		toggleMute: playback.toggleMute,
		onMediaPlay: playback.onMediaPlay,
		onMediaPause: playback.onMediaPause,
	}
}

export function useBasePresentationPlayer(props: BasePresentationPlayerProps, emit: BasePresentationPlayerEmits) {
	const elements = useElements()
	const flow = usePlaybackFlow(props, emit, elements)
	const { playback } = flow
	const stepRate = (direction: 1 | -1): void => playback.setRate(nextRate(props.playbackRates ?? [], playback.rate.value, direction))
	const screen = usePresentationScreen(props, elements.rootRef, {
		media: () => playback.media.value,
		isPlaying: () => flow.isPlaying.value,
		volume: () => playback.volume.value,
		togglePlay: flow.togglePlay,
		next: flow.next,
		previous: flow.previous,
		goTo: flow.goTo,
		setVolume: playback.setVolume,
		toggleMute: playback.toggleMute,
		stepRate,
	})
	const controls = usePresentationControls(props, {
		index: () => flow.index.value,
		slideTime: () => playback.slideTime.value,
		slideDuration: () => playback.slideDuration.value,
		isPlaying: () => flow.isPlaying.value,
		isMuted: () => playback.isMuted.value,
		volume: () => playback.volume.value,
		rate: () => playback.rate.value,
		isFullscreen: () => screen.isFullscreen.value,
		goTo: flow.goTo,
		seekInSlide: playback.seekInSlide,
		setRate: playback.setRate,
	})

	return {
		...useStandardBaseComponent('base-presentation-player', props, CLASS_KEYS),
		...elements,
		...flow,
		...screen,
		...controls,
		...useStageView(flow, controls.playLabel),
		rootStyle: computed(() => ({ aspectRatio: props.aspectRatio })),
	}
}
