import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { safeUrl } from '../playback/timeline'
import { UI_PRESENTATION, formatMessage } from './messages'
import { usePresentationFlow } from './usePresentationFlow'
import { usePresentationScreen } from './usePresentationScreen'
import { usePresentationControls } from './usePresentationControls'
import { usePresentationLock } from '../progress/usePresentationLock'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { MediaIconName } from '@components/BaseMediaPlayer/types/controls/MediaIcon.types'
import type { BasePresentationPlayerEmits, BasePresentationPlayerProps } from '../../types/BasePresentationPlayer.types'

const CLASS_KEYS = ['root', 'stage', 'controls']

const INTERACTIVE_SELECTOR = 'a[href], button, input, select, textarea, label, [tabindex], [contenteditable="true"]'

function nextRate(rates: number[], current: number, direction: 1 | -1): number {
	const sorted = [...rates].sort((a, b) => a - b)
	const candidates =
		direction > 0 ? sorted.filter(rate => rate > current + 0.001) : sorted.filter(rate => rate < current - 0.001).reverse()
	return candidates[0] ?? current
}

function useStageView(flow: ReturnType<typeof usePresentationFlow>, playLabel: Readonly<Ref<string>>) {
	const { playback } = flow
	return {
		slide: playback.slide,
		audioSrc: playback.audioSrc,
		videoSrc: playback.videoSrc,
		isVideoMuted: computed(() => playback.isShared.value || Boolean(playback.audioSrc.value)),
		imageSrc: computed(() => safeUrl(playback.slide.value?.image)),
		isWaiting: computed(() => flow.isPlaying.value && playback.state.isWaiting),
		isStartScreen: computed(() => !flow.isPlaying.value && !flow.hasStarted.value && flow.storage.resumeIndex.value === null),
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

function useProgressView(props: BasePresentationPlayerProps, flow: ReturnType<typeof usePresentationFlow>) {
	const { progress, storage } = flow
	return {
		isDoneScreen: computed(() => flow.isFinished.value && !flow.isPlaying.value),
		doneTitle: computed(() =>
			progress.completedCount.value === props.slides.length ? UI_PRESENTATION.DONE : UI_PRESENTATION.FINISHED,
		),
		doneText: computed(() =>
			formatMessage(UI_PRESENTATION.DONE_TEXT, { completed: progress.completedCount.value, total: props.slides.length }),
		),
		resumeIndex: storage.resumeIndex,
		resumeText: computed(() =>
			storage.resumeIndex.value === null ? '' : formatMessage(UI_PRESENTATION.RESUME, { n: storage.resumeIndex.value + 1 }),
		),
		resume: storage.resume,
		dismissResume: storage.dismissResume,
	}
}

function useLock(flow: ReturnType<typeof usePresentationFlow>) {
	const { playback, progress } = flow
	return usePresentationLock({
		index: () => flow.index.value,
		count: () => flow.count.value,
		slideTime: () => playback.slideTime.value,
		slideDuration: () => playback.slideDuration.value,
		rate: () => playback.rate.value,
		watched: () => progress.watched.value,
		minDuration: () => progress.minDuration.value,
		isMediaDone: () => progress.isMediaDone.value,
		canGoTo: progress.canGoTo,
		next: flow.next,
	})
}

export function useBasePresentationPlayer(props: BasePresentationPlayerProps, emit: BasePresentationPlayerEmits) {
	const elements = {
		rootRef: ref<HTMLElement | null>(null),
		audioRef: ref<HTMLAudioElement | null>(null),
		videoRef: ref<HTMLVideoElement | null>(null),
	}
	const flow = usePresentationFlow(props, emit, elements)
	const { playback } = flow
	const lock = useLock(flow)
	const screen = usePresentationScreen(props, elements.rootRef, {
		media: () => playback.media.value,
		isPlaying: () => flow.isPlaying.value,
		volume: () => playback.volume.value,
		togglePlay: flow.togglePlay,
		next: lock.next,
		previous: flow.previous,
		goTo: index => void flow.goTo(index),
		setVolume: playback.setVolume,
		toggleMute: playback.toggleMute,
		stepRate: direction => flow.setRate(nextRate(flow.rates(), playback.rate.value, direction)),
	})
	const controls = usePresentationControls(props, {
		index: () => flow.index.value,
		slideTime: () => playback.slideTime.value,
		slideDuration: () => playback.slideDuration.value,
		isPlaying: () => flow.isPlaying.value,
		isMuted: () => playback.isMuted.value,
		volume: () => playback.volume.value,
		rate: () => playback.rate.value,
		rates: flow.rates,
		isFullscreen: () => screen.isFullscreen.value,
		goTo: index => void flow.goTo(index),
		seekInSlide: flow.seekInSlide,
		setRate: flow.setRate,
	})

	return {
		...useStandardBaseComponent('base-presentation-player', props, CLASS_KEYS),
		...elements,
		...flow,
		...screen,
		...controls,
		...lock,
		...useStageView(flow, controls.playLabel),
		...useProgressView(props, flow),
		statusText: computed(() => lock.flash.value || controls.statusText.value),
		rootStyle: computed(() => ({ aspectRatio: props.aspectRatio })),
	}
}
