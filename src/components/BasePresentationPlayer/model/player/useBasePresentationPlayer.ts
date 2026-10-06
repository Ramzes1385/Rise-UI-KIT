import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { safeUrl } from '../playback/timeline'
import { useUi } from '@composables/base/useUi'
import { useMotion } from '@composables/app/useMotion'
import { UI_PRESENTATION, formatMessage } from './messages'
import { usePresentationFlow } from './usePresentationFlow'
import { usePresentationScreen } from './usePresentationScreen'
import { usePresentationControls } from './usePresentationControls'
import { UI_ARIA } from '@components/BaseMediaPlayer/model/messages'
import { usePresentationLock } from '../progress/usePresentationLock'
import { usePresentationPanel } from '../content/usePresentationPanel'
import { PRESENTATION_LOCK_ICON } from '../../types/PresentationModel.types'
import { usePresentationCaptions } from '../content/usePresentationCaptions'
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
		isWaiting: computed(() => flow.isPlaying.value && playback.isWaiting.value),
		isStartScreen: computed(() => !flow.isPlaying.value && !flow.hasStarted.value && flow.storage.resumeIndex.value === null),
		playIcon: computed<MediaIconName>(() => {
			if (flow.isPlaying.value) return 'pause'
			return flow.isFinished.value ? 'replay' : 'play'
		}),
		playLabel: computed(() => (flow.isFinished.value && !flow.isPlaying.value ? UI_PRESENTATION.REPLAY : playLabel.value)),
		onStageClick(event: MouseEvent): void {
			const stage = event.currentTarget as Element
			const hit = (event.target as Element).closest(INTERACTIVE_SELECTOR)
			if (!hit || hit === stage || !stage.contains(hit)) flow.togglePlay()
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
		isAwaitingAnswer: () => progress.isAwaitingAnswer.value,
		canGoTo: progress.canGoTo,
		next: flow.next,
	})
}

function useContentView(
	props: BasePresentationPlayerProps,
	emit: BasePresentationPlayerEmits,
	parts: { flow: ReturnType<typeof usePresentationFlow>; lock: ReturnType<typeof useLock>; root: () => HTMLElement | null },
) {
	const { flow, lock } = parts
	const { playback, progress } = flow
	const captions = usePresentationCaptions(props, emit, {
		index: () => flow.index.value,
		isShared: () => playback.isShared.value,
		time: () => (playback.isShared.value ? playback.state.currentTime : playback.slideTime.value),
	})
	const panel = usePresentationPanel(props, {
		root: parts.root,
		index: () => flow.index.value,
		isCompleted: progress.isCompleted,
		canGoTo: progress.canGoTo,
		goTo: index => void flow.goTo(index),
		onLocked: () => lock.next(),
	})
	return {
		...captions,
		...panel,
		UI_ARIA,
		PRESENTATION_LOCK_ICON,
		slideActions: computed(() => ({ complete: progress.answer, isCompleted: progress.isCompleted(flow.index.value) })),
	}
}

function useStageMotion(index: () => number, root: Readonly<Ref<HTMLElement | null>>) {
	const motion = useMotion(root)
	const isBackward = ref(false)
	watch(index, (current, previous) => {
		isBackward.value = current < previous
	})
	return {
		isBackward,
		panelDuration: computed(() => ({ enter: motion.duration('slow') * 2.4, leave: motion.duration('base') * 1.2 })),
	}
}

function useElements() {
	return {
		rootRef: ref<HTMLElement | null>(null),
		audioRef: ref<HTMLAudioElement | null>(null),
		videoRef: ref<HTMLVideoElement | null>(null),
	}
}

export function useBasePresentationPlayer(props: BasePresentationPlayerProps, emit: BasePresentationPlayerEmits) {
	const elements = useElements()
	const flow = usePresentationFlow(props, emit, elements)
	const { playback } = flow
	const lock = useLock(flow)
	const content = useContentView(props, emit, { flow, lock, root: () => elements.rootRef.value })
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
		toggleCaptions: () => content.toggleCaptions(),
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
		ui: useUi(props, 'base-presentation-player'),
		...useStageMotion(() => flow.index.value, elements.rootRef),
		...elements,
		...flow,
		...screen,
		...controls,
		...lock,
		...useStageView(flow, controls.playLabel),
		...useProgressView(props, flow),
		...content,
		statusText: computed(() => lock.flash.value || controls.statusText.value),
		rootStyle: computed(() => ({ aspectRatio: props.aspectRatio })),
	}
}
