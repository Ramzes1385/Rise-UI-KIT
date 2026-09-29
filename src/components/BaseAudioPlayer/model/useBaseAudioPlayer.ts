import { UI_AUDIO } from '@/locales/messages'
import { isSafeUrl } from '@utils/data/urlUtils'
import { formatMessage, formatNumber } from '@/locales/state'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { decodeWaveformPeaks, formatMediaTime } from '@utils/media/mediaUtils'
import type { AudioPlayerError, BaseAudioPlayerEmits, BaseAudioPlayerProps } from '../types/BaseAudioPlayer.types'

const PROTOCOLS = ['http:', 'https:', 'blob:', 'data:']

const FLAT_PEAK = 0.3

const SEEK_TOLERANCE = 0.5

const MEDIA_ERRORS: Record<number, AudioPlayerError['code']> = { 2: 'network', 3: 'decode', 4: 'not-supported' }

let playing: HTMLAudioElement | null = null

function takeTurn(element: HTMLAudioElement, isExclusive: boolean | undefined): void {
	const previous = playing
	playing = element
	if (isExclusive && previous && previous !== element) previous.pause()
}

function usePeaks(props: BaseAudioPlayerProps) {
	const decoded = ref<number[] | null>(null)
	watch(
		() => [props.peaks ? null : props.src, props.bars] as const,
		([src, bars], _, onCleanup) => {
			let isActive = true
			onCleanup(() => {
				isActive = false
			})
			decoded.value = null
			if (src && isSafeUrl(src, PROTOCOLS))
				void decodeWaveformPeaks(src, bars ?? 48).then(peaks => isActive && (decoded.value = peaks))
		},
		{ immediate: true },
	)
	return computed(() => props.peaks ?? decoded.value ?? Array.from({ length: props.bars ?? 48 }, () => FLAT_PEAK))
}

function useAudioState(audioRef: Readonly<{ value: HTMLAudioElement | null }>, emit: BaseAudioPlayerEmits) {
	const state = reactive({
		isPaused: true,
		hasStarted: false,
		currentTime: 0,
		duration: Number.NaN,
		rate: 1,
		error: null as AudioPlayerError | null,
	})
	const fail = (error: AudioPlayerError): void => {
		state.error = error
		emit('error', error)
	}
	return {
		state,
		fail,
		handlers: {
			onPlay(): void {
				Object.assign(state, { isPaused: false, hasStarted: true, error: null })
				emit('play')
			},
			onPause(): void {
				state.isPaused = true
				emit('pause')
			},
			onEnded: (): void => emit('ended'),
			onTimeUpdate(): void {
				state.currentTime = audioRef.value?.currentTime ?? 0
				emit('update:currentTime', state.currentTime)
			},
			onDurationChange(): void {
				state.duration = audioRef.value?.duration ?? Number.NaN
			},
			onRateChange(): void {
				state.rate = audioRef.value?.playbackRate ?? 1
			},
			onError(): void {
				const code = audioRef.value?.error?.code ?? 0
				fail({ code: MEDIA_ERRORS[code] ?? 'unknown', cause: audioRef.value?.error })
			},
		},
	}
}

function useAudioActions(
	props: BaseAudioPlayerProps,
	audio: {
		ref: Readonly<{ value: HTMLAudioElement | null }>
		fail: (error: AudioPlayerError) => void
		state: { currentTime: number }
	},
) {
	const play = async (): Promise<void> => {
		const element = audio.ref.value
		if (!element || props.isDisabled) return
		takeTurn(element, props.isExclusive)
		await element.play().catch((cause: unknown) => {
			audio.fail({ code: (cause as DOMException | undefined)?.name === 'NotAllowedError' ? 'not-allowed' : 'unknown', cause })
		})
	}
	const pause = (): void => audio.ref.value?.pause()
	return {
		play,
		pause,
		togglePlay: (): Promise<void> | void => (audio.ref.value?.paused === false ? pause() : play()),
		seek(time: number): void {
			if (!audio.ref.value || props.isDisabled) return
			audio.ref.value.currentTime = time
			audio.state.currentTime = time
		},
	}
}

function useRate(props: BaseAudioPlayerProps, audioRef: Readonly<{ value: HTMLAudioElement | null }>, rate: () => number) {
	const rates = computed(() => props.playbackRates ?? [1, 1.5, 2])
	return {
		hasRates: computed(() => rates.value.length > 1),
		rateText: computed(() => `${formatNumber(rate())}×`),
		rateLabel: computed(() => formatMessage(UI_AUDIO.SPEED, { rate: formatNumber(rate()) })),
		nextRate(): void {
			const index = rates.value.indexOf(rate())
			if (audioRef.value) audioRef.value.playbackRate = rates.value[(index + 1) % rates.value.length]
		},
	}
}

export function useBaseAudioPlayer(props: BaseAudioPlayerProps, emit: BaseAudioPlayerEmits) {
	const audioRef = ref<HTMLAudioElement | null>(null)
	const { state, fail, handlers } = useAudioState(audioRef, emit)
	const actions = useAudioActions(props, { ref: audioRef, fail, state })
	const duration = computed(() => (Number.isFinite(state.duration) ? state.duration : (props.duration ?? 0)))
	watch(
		() => props.currentTime,
		time => time !== undefined && Math.abs(time - state.currentTime) > SEEK_TOLERANCE && actions.seek(time),
	)
	onBeforeUnmount(() => {
		if (playing === audioRef.value) playing = null
	})
	return {
		...useStandardBaseComponent('base-audio-player', props, ['root', 'button', 'waveform', 'time', 'rate']),
		...handlers,
		...actions,
		...useRate(props, audioRef, () => state.rate),
		audioRef,
		state,
		duration,
		peaks: usePeaks(props),
		safeSrc: computed(() => (isSafeUrl(props.src, PROTOCOLS) ? props.src : undefined)),
		playLabel: computed(() => (state.isPaused ? UI_AUDIO.PLAY : UI_AUDIO.PAUSE)),
		timeText: computed(() =>
			state.hasStarted
				? `${formatMediaTime(state.currentTime, duration.value)} / ${formatMediaTime(duration.value)}`
				: formatMediaTime(duration.value),
		),
		exposed: { play: actions.play, pause: actions.pause, getMediaElement: () => audioRef.value },
	}
}
