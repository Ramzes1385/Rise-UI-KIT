import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { useSlidePlayback } from '../playback/useSlidePlayback'
import { useDocumentVisible } from '../playback/useDocumentVisible'
import { usePresentationStorage } from '../progress/usePresentationStorage'
import { usePresentationProgress } from '../progress/usePresentationProgress'
import { usePresentationNavigation } from '../playback/usePresentationNavigation'
import type { PresentationElements, SlidePlaybackOptions } from '../../types/PresentationModel.types'
import type { BasePresentationPlayerEmits, BasePresentationPlayerProps } from '../../types/BasePresentationPlayer.types'

function useStrictRules(props: BasePresentationPlayerProps, playback: ReturnType<typeof useSlidePlayback>, index: () => number) {
	const reached = ref(0)
	const isStrict = (): boolean => props.navigation === 'strict'
	const maxRate = (): number => (isStrict() ? Math.max(0.25, props.maxRate ?? 1) : Number.POSITIVE_INFINITY)
	watch(index, () => (reached.value = 0))
	watch(playback.slideTime, time => (reached.value = Math.max(reached.value, time)))
	watch([() => props.navigation, () => props.maxRate], () => {
		if (playback.rate.value > maxRate()) playback.setRate(maxRate())
	})
	return {
		rates: (): number[] => (props.playbackRates ?? []).filter(rate => rate <= maxRate()),
		setRate: (rate: number): void => playback.setRate(Math.min(rate, maxRate())),
		clampSeek: (time: number, isCompleted: boolean): number => (isStrict() && !isCompleted ? Math.min(time, reached.value) : time),
	}
}

function useFlowState(
	props: BasePresentationPlayerProps,
	emit: BasePresentationPlayerEmits,
	options: PresentationElements & Pick<SlidePlaybackOptions, 'onSlideEnd' | 'onTrackSlide'>,
) {
	const navigation = usePresentationNavigation(props, emit)
	const isVisible = useDocumentVisible()
	const isPlaying = ref(false)
	const playback = useSlidePlayback(props, {
		index: navigation.index,
		isPlaying,
		isVisible,
		audioRef: options.audioRef,
		videoRef: options.videoRef,
		onSlideEnd: options.onSlideEnd,
		onTrackSlide: options.onTrackSlide,
		onSpeechError: value => emit('speech-error', value),
	})
	return { navigation, isVisible, isPlaying, playback }
}

function useAdvance(state: ReturnType<typeof useFlowState>) {
	const { navigation, isPlaying } = state
	const isFinished = ref(false)
	return {
		isFinished,
		advanceTo(target: number, resume: boolean): void {
			if (target >= navigation.count.value) {
				isPlaying.value = false
				isFinished.value = true
				return
			}
			navigation.setIndex(target)
			if (resume) isPlaying.value = true
		},
	}
}

function useCommands(
	state: ReturnType<typeof useFlowState>,
	flags: { isFinished: Ref<boolean>; hasStarted: Ref<boolean>; canGoTo: (index: number) => boolean },
) {
	const goTo = (target: number): boolean => {
		if (!flags.canGoTo(target)) return false
		flags.isFinished.value = false
		if (target === state.navigation.index.value) state.playback.seekInSlide(0)
		state.navigation.setIndex(target)
		return true
	}
	return {
		goTo,
		play(): void {
			if (flags.isFinished.value) goTo(0)
			flags.hasStarted.value = true
			state.isPlaying.value = true
		},
	}
}

export function usePresentationFlow(props: BasePresentationPlayerProps, emit: BasePresentationPlayerEmits, elements: PresentationElements) {
	const state = useFlowState(props, emit, {
		...elements,
		onSlideEnd: () => progress.onMediaEnd(),
		onTrackSlide: index => progress.onTrackEnd(index),
	})
	const { navigation, isVisible, isPlaying, playback } = state
	const { isFinished, advanceTo } = useAdvance(state)
	const hasStarted = ref(false)
	const index = (): number => navigation.index.value
	const progress = usePresentationProgress(props, emit, {
		index,
		isPlaying: () => isPlaying.value,
		isVisible: () => isVisible.value,
		hasClock: () => playback.hasClock.value,
		advanceTo,
		pause: () => void (isPlaying.value = false),
	})
	const strict = useStrictRules(props, playback, index)
	const { goTo, play } = useCommands(state, { isFinished, hasStarted, canGoTo: progress.canGoTo })

	watch(isPlaying, value => (value ? emit('play') : emit('pause')))
	watch(isVisible, visible => {
		if (!visible && props.navigation === 'strict') isPlaying.value = false
	})

	return {
		...navigation,
		playback,
		progress,
		storage: usePresentationStorage(props, {
			index,
			completed: () => progress.completedIds.value,
			isFinished: () => isFinished.value,
			restore: progress.restore,
			goTo,
		}),
		isPlaying,
		isFinished,
		hasStarted,
		goTo,
		play,
		rates: strict.rates,
		setRate: strict.setRate,
		seekInSlide: (time: number): void => playback.seekInSlide(strict.clampSeek(time, progress.isCompleted(index()))),
		pause: (): void => void (isPlaying.value = false),
		togglePlay: (): void => (isPlaying.value ? void (isPlaying.value = false) : play()),
		next: (): boolean => index() >= navigation.count.value - 1 || goTo(index() + 1),
		previous: (): void => void (index() > 0 && goTo(index() - 1)),
	}
}
