import type { Ref } from 'vue'
import { UI_PLAYER } from '@/locales/messages'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { MediaPlayerProps } from '../types/BaseMediaPlayer.types'
import type { MediaState, MediaErrorCode, MediaSourceItem, MediaPlayerError } from '../types/MediaCore.types'

const BUFFERING_DELAY = 500

const NO_SOURCE_ERROR: MediaPlayerError = { code: 'unsupported' }

const ERROR_MESSAGES: Record<MediaErrorCode, () => string> = {
	aborted: () => UI_PLAYER.ERROR_ABORTED,
	network: () => UI_PLAYER.ERROR_NETWORK,
	decode: () => UI_PLAYER.ERROR_DECODE,
	unsupported: () => UI_PLAYER.ERROR_UNSUPPORTED,
	'autoplay-blocked': () => UI_PLAYER.ERROR_AUTOPLAY,
	unknown: () => UI_PLAYER.ERROR_UNKNOWN,
}

function useBuffering(state: Readonly<MediaState>): Ref<boolean> {
	const isBuffering = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined
	watch(
		() => state.isWaiting && !state.isPaused,
		isWaiting => {
			clearTimeout(timer)
			isBuffering.value = false
			if (isWaiting)
				timer = setTimeout(() => {
					isBuffering.value = true
				}, BUFFERING_DELAY)
		},
	)
	onBeforeUnmount(() => clearTimeout(timer))
	return isBuffering
}

export function usePlayerOverlays(
	props: MediaPlayerProps,
	{ state, activeSource }: { state: Readonly<MediaState>; activeSource: Readonly<Ref<MediaSourceItem | null | undefined>> },
) {
	const hasStarted = ref(false)
	const error = computed(() => state.error ?? (activeSource.value === null ? NO_SOURCE_ERROR : null))
	const isAutoplayBlocked = computed(() => error.value?.code === 'autoplay-blocked')
	const overlayError = computed(() => (isAutoplayBlocked.value ? null : error.value))
	return {
		error,
		overlayError,
		isAutoplayBlocked,
		errorMessage: computed(() => error.value && ERROR_MESSAGES[error.value.code]()),
		canRetry: computed(() => Boolean(overlayError.value && activeSource.value)),
		isBuffering: useBuffering(state),
		isStartScreen: computed(
			() => !hasStarted.value && state.isPaused && !overlayError.value && (!props.isAutoplay || isAutoplayBlocked.value),
		),
		markStarted(): void {
			hasStarted.value = true
		},
	}
}
