import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { PresentationProgressSource } from '../../types/PresentationModel.types'
import type { BasePresentationPlayerEmits, BasePresentationPlayerProps } from '../../types/BasePresentationPlayer.types'

const TICK_MS = 250

function useWatchedTime(isCounting: () => boolean) {
	const watched = ref(0)
	let timer: ReturnType<typeof setInterval> | undefined
	let last = 0
	const stop = (): void => {
		clearInterval(timer)
		timer = undefined
	}
	watch(isCounting, counting => {
		stop()
		if (!counting) return
		last = Date.now()
		timer = setInterval(() => {
			const now = Date.now()
			watched.value += (now - last) / 1000
			last = now
		}, TICK_MS)
	})
	onBeforeUnmount(stop)
	return watched
}

function useCompletion(props: BasePresentationPlayerProps, emit: BasePresentationPlayerEmits) {
	const completedIds = ref<string[]>([])
	const isCompleted = (index: number): boolean => completedIds.value.includes(props.slides[index]?.id ?? '')
	const completedCount = computed(() => props.slides.filter((_, index) => isCompleted(index)).length)
	return {
		completedIds,
		completedCount,
		isCompleted,
		firstOpen: computed(() => {
			const open = props.slides.findIndex((_, index) => !isCompleted(index))
			return open === -1 ? props.slides.length - 1 : open
		}),
		restore(ids: string[]): void {
			completedIds.value = [...new Set([...completedIds.value, ...ids])]
		},
		complete(index: number): void {
			const slide = props.slides[index]
			if (!slide || isCompleted(index)) return
			completedIds.value = [...completedIds.value, slide.id]
			emit('slide-complete', { id: slide.id, index, at: Date.now() })
			emit('progress', { completed: completedCount.value, total: props.slides.length })
			if (completedCount.value === props.slides.length) emit('complete')
		},
	}
}

function useSlideState(props: BasePresentationPlayerProps, source: PresentationProgressSource) {
	const isMediaDone = ref(!source.hasClock())
	const isAnswered = ref(false)
	const held = ref<{ target: number; resume: boolean } | null>(null)
	const watched = useWatchedTime(() => source.isVisible() && (source.isPlaying() || held.value !== null))
	watch(
		source.index,
		() => {
			watched.value = 0
			held.value = null
			isAnswered.value = false
			isMediaDone.value = !source.hasClock()
		},
		{ flush: 'sync' },
	)
	const isInteractive = computed(() => Boolean(props.slides[source.index()]?.isInteractive))
	const minDuration = computed(() => Math.max(0, props.slides[source.index()]?.minDuration ?? 0))
	return {
		isMediaDone,
		isAnswered,
		isInteractive,
		held,
		watched,
		minDuration,
		isSlideDone: computed(() => isMediaDone.value && watched.value >= minDuration.value && (!isInteractive.value || isAnswered.value)),
	}
}

function useFinishMedia(
	state: ReturnType<typeof useSlideState>,
	source: PresentationProgressSource,
	rules: { isRestricted: () => boolean; complete: (index: number) => void },
) {
	const { isRestricted } = rules
	return (target: number, isTrack: boolean): void => {
		state.isMediaDone.value = true
		if (state.isSlideDone.value) rules.complete(source.index())
		if (state.isSlideDone.value || (!isRestricted() && !state.isInteractive.value)) return source.advanceTo(target, false)
		if (state.isInteractive.value) return source.pause()
		state.held.value = { target, resume: isTrack }
		if (isTrack) source.pause()
	}
}

export function usePresentationProgress(
	props: BasePresentationPlayerProps,
	emit: BasePresentationPlayerEmits,
	source: PresentationProgressSource,
) {
	const state = useSlideState(props, source)
	const completion = useCompletion(props, emit)
	const isRestricted = computed(() => props.navigation === 'linear' || props.navigation === 'strict')
	const finishMedia = useFinishMedia(state, source, { isRestricted: () => isRestricted.value, complete: completion.complete })

	watch(
		() => [source.index(), state.isSlideDone.value] as const,
		([index, done]) => {
			if (!done) return
			completion.complete(index)
			const target = state.held.value
			state.held.value = null
			if (target) source.advanceTo(target.target, target.resume)
		},
		{ immediate: true },
	)

	return {
		...completion,
		watched: state.watched,
		minDuration: state.minDuration,
		isMediaDone: state.isMediaDone,
		isAwaitingAnswer: computed(() => state.isInteractive.value && !state.isAnswered.value),
		isRestricted,
		canGoTo: (index: number): boolean => !isRestricted.value || index <= completion.firstOpen.value,
		answer(): void {
			if (state.isInteractive.value) state.isAnswered.value = true
		},
		onMediaEnd(): void {
			finishMedia(source.index() + 1, false)
		},
		onTrackEnd(target: number): void {
			finishMedia(target, true)
		},
	}
}
