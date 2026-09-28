import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MediaActions, MediaState } from '../types/MediaCore.types'
import type { PlayerModelSync, MediaPlayerProps, BaseMediaPlayerEmits } from '../types/BaseMediaPlayer.types'

const TIME_EMIT_INTERVAL = 250

const TIME_TOLERANCE = 0.5

const VALUE_TOLERANCE = 0.001

function syncModel<T>(model: PlayerModelSync<T>): void {
	const applyProp = (value: T | undefined): void => {
		if (value !== undefined && !model.isSame(value, model.current())) model.apply(value)
	}
	onMounted(() => {
		if (!model.skipOnMount?.()) applyProp(model.prop())
	})
	watch(model.prop, applyProp)
	watch(model.current, model.emit)
}

function useTimeModel(
	props: MediaPlayerProps,
	emit: BaseMediaPlayerEmits,
	{ state, actions }: { state: Readonly<MediaState>; actions: MediaActions },
): void {
	let lastEmitAt = 0
	let timer: ReturnType<typeof setTimeout> | undefined
	const flush = (): void => {
		clearTimeout(timer)
		timer = undefined
		lastEmitAt = Date.now()
		emit('update:currentTime', state.currentTime)
	}
	syncModel({
		prop: () => props.currentTime,
		current: () => state.currentTime,
		apply: actions.seek,
		emit: () => {
			const wait = TIME_EMIT_INTERVAL - (Date.now() - lastEmitAt)
			if (wait <= 0) flush()
			else if (!timer) timer = setTimeout(flush, wait)
		},
		isSame: (a, b) => Math.abs(a - b) <= TIME_TOLERANCE,
	})
	onBeforeUnmount(() => clearTimeout(timer))
}

function useTheater(props: MediaPlayerProps, emit: BaseMediaPlayerEmits) {
	const localTheater = ref(false)
	const isTheater = computed(() => props.isTheater ?? localTheater.value)
	return {
		isTheater,
		toggleTheater(): void {
			localTheater.value = !isTheater.value
			emit('update:isTheater', localTheater.value)
		},
	}
}

export function usePlayerModels(
	props: MediaPlayerProps,
	emit: BaseMediaPlayerEmits,
	media: { state: Readonly<MediaState>; actions: MediaActions },
) {
	const { state, actions } = media
	const isClose = (a: number, b: number): boolean => Math.abs(a - b) < VALUE_TOLERANCE
	useTimeModel(props, emit, media)
	syncModel({
		prop: () => props.volume,
		current: () => state.volume,
		apply: actions.setVolume,
		emit: value => emit('update:volume', value),
		isSame: isClose,
	})
	syncModel({
		prop: () => props.isMuted,
		current: () => state.isMuted,
		apply: actions.setMuted,
		emit: value => emit('update:isMuted', value),
		isSame: (a, b) => a === b,
		skipOnMount: () => Boolean(props.isAutoplay),
	})
	syncModel({
		prop: () => props.playbackRate,
		current: () => state.playbackRate,
		apply: actions.setPlaybackRate,
		emit: value => emit('update:playbackRate', value),
		isSame: isClose,
	})
	return useTheater(props, emit)
}
