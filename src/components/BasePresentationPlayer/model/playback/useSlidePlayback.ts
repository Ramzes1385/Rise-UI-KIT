import { computed, ref, watch } from 'vue'
import { useSlideTimer } from './useSlideTimer'
import { useSlideSpeech } from './useSlideSpeech'
import { useLocale } from '@composables/app/useLocale'
import { indexAtTime, safeUrl, slideSpan, trackStarts } from './timeline'
import type { SlidePlaybackOptions } from '../../types/PresentationModel.types'
import { useMediaElement } from '@components/BaseMediaPlayer/model/core/useMediaElement'
import type { BasePresentationPlayerProps } from '../../types/BasePresentationPlayer.types'

function useSlideSources(props: BasePresentationPlayerProps, options: SlidePlaybackOptions) {
	const slide = computed(() => props.slides[options.index.value])
	const isShared = computed(() => Boolean(safeUrl(props.audio)))
	const audioSrc = computed(() => (isShared.value ? safeUrl(props.audio) : safeUrl(slide.value?.audio)))
	const videoSrc = computed(() => safeUrl(slide.value?.video))
	const media = computed<HTMLMediaElement | null>(() => {
		if (isShared.value || audioSrc.value) return options.audioRef.value
		return videoSrc.value ? options.videoRef.value : null
	})
	const speechText = computed(() => (isShared.value || audioSrc.value || videoSrc.value ? undefined : slide.value?.speech))
	return { slide, isShared, audioSrc, videoSrc, media, speechText }
}

function useSettings() {
	const rate = ref(1)
	const volume = ref(1)
	const isMuted = ref(false)
	return {
		rate,
		volume,
		isMuted,
		apply(element: HTMLMediaElement): void {
			element.playbackRate = rate.value
			element.volume = volume.value
			element.muted = isMuted.value
		},
	}
}

function useTrack(props: BasePresentationPlayerProps, duration: () => number) {
	const starts = computed(() => trackStarts(props.slides))
	return {
		starts,
		span: (index: number) => slideSpan(starts.value, index, duration()),
		indexAt: (time: number) => indexAtTime(starts.value, time),
	}
}

function useSlideClock(parts: {
	sources: ReturnType<typeof useSlideSources>
	state: ReturnType<typeof useMediaElement>['state']
	track: ReturnType<typeof useTrack>
	index: () => number
	timer: ReturnType<typeof useSlideTimer>
	isSpeech: () => boolean
}) {
	const { sources, state, track, index, timer } = parts
	return {
		slideTime: computed(() => {
			if (!sources.media.value) return timer.elapsed.value
			if (!sources.isShared.value) return state.currentTime
			return Math.max(0, state.currentTime - track.span(index())[0])
		}),
		slideDuration: computed(() => {
			if (!sources.media.value) return parts.isSpeech() ? Number.NaN : (sources.slide.value?.duration ?? Number.NaN)
			if (!sources.isShared.value) return state.duration
			const [start, end] = track.span(index())
			return end - start
		}),
	}
}

function watchTrack(
	parts: { sources: ReturnType<typeof useSlideSources>; media: ReturnType<typeof useMediaElement>; track: ReturnType<typeof useTrack> },
	options: SlidePlaybackOptions,
): void {
	const { sources, track } = parts
	const { state, actions } = parts.media
	watch(options.index, index => {
		if (sources.isShared.value && track.indexAt(state.currentTime) !== index) actions.seek(track.starts.value[index] ?? 0)
	})
	watch(
		() => state.currentTime,
		time => {
			const index = track.indexAt(time)
			const isMoving = options.isPlaying.value && !state.isSeeking
			if (sources.isShared.value && isMoving && index !== options.index.value) options.onTrackSlide(index)
		},
	)
	watch(
		() => state.isEnded,
		isEnded => {
			if (isEnded) options.onSlideEnd()
		},
	)
	watch(
		() => state.error,
		error => {
			if (error) options.isPlaying.value = false
		},
	)
}

function useSound(
	sources: ReturnType<typeof useSlideSources>,
	{ actions }: ReturnType<typeof useMediaElement>,
	isPlaying: SlidePlaybackOptions['isPlaying'],
) {
	const settings = useSettings()
	const sync = (): void => {
		const element = sources.media.value
		if (!element) return
		settings.apply(element)
		if (isPlaying.value) void actions.play()
		else actions.pause()
	}
	watch([sources.media, sources.audioSrc, sources.videoSrc, isPlaying], sync, { flush: 'post' })
	return {
		rate: settings.rate,
		volume: settings.volume,
		isMuted: settings.isMuted,
		setRate(rate: number): void {
			settings.rate.value = rate
			actions.setPlaybackRate(rate)
		},
		setVolume(volume: number): void {
			settings.volume.value = Math.min(1, Math.max(0, volume))
			if (volume > 0) settings.isMuted.value = false
			sync()
		},
		toggleMute(): void {
			settings.isMuted.value = !settings.isMuted.value
			sync()
		},
		onMediaPlay(event: Event): void {
			if (event.target === sources.media.value) isPlaying.value = true
		},
		onMediaPause(event: Event): void {
			const element = event.target as HTMLMediaElement
			if (element === sources.media.value && !element.ended) isPlaying.value = false
		},
	}
}

function useSpeech(
	props: BasePresentationPlayerProps,
	parts: { sources: ReturnType<typeof useSlideSources>; sound: ReturnType<typeof useSound> },
	options: SlidePlaybackOptions,
) {
	const { sources, sound } = parts
	const { locale } = useLocale()
	const speech = useSlideSpeech({
		text: () => sources.speechText.value,
		key: () => sources.slide.value?.id,
		isRunning: () => options.isPlaying.value && options.isVisible.value,
		rate: () => sound.rate.value,
		volume: () => sound.volume.value,
		isMuted: () => sound.isMuted.value,
		voice: () => props.speechVoice,
		lang: () => locale.value,
		onEnd: () => options.onSlideEnd(),
	})
	watch(speech.isSpeech, (isSpeech, wasSpeech) => {
		if (wasSpeech && !isSpeech && !((sources.slide.value?.duration ?? 0) > 0)) options.onSlideEnd()
	})
	return speech.isSpeech
}

export function useSlidePlayback(props: BasePresentationPlayerProps, options: SlidePlaybackOptions) {
	const sources = useSlideSources(props, options)
	const media = useMediaElement(sources.media)
	const sound = useSound(sources, media, options.isPlaying)
	const track = useTrack(props, () => media.state.duration)
	const isSpeech = useSpeech(props, { sources, sound }, options)
	const hasClock = computed(() =>
		Boolean(sources.audioSrc.value || sources.videoSrc.value || isSpeech.value || (sources.slide.value?.duration ?? 0) > 0),
	)
	const timer = useSlideTimer({
		duration: () => (sources.media.value || isSpeech.value ? Number.NaN : (sources.slide.value?.duration ?? Number.NaN)),
		rate: () => sound.rate.value,
		isRunning: () => options.isPlaying.value && options.isVisible.value,
		onEnd: options.onSlideEnd,
	})
	watch(options.index, () => timer.seek(0))
	watchTrack({ sources, media, track }, options)

	return {
		...sources,
		...sound,
		hasClock,
		isSpeech,
		...useSlideClock({ sources, state: media.state, track, index: () => options.index.value, timer, isSpeech: () => isSpeech.value }),
		state: media.state,
		seekInSlide(time: number): void {
			if (!sources.media.value) return timer.seek(time)
			const offset = sources.isShared.value ? track.span(options.index.value)[0] : 0
			media.actions.seek(offset + Math.max(0, time))
		},
	}
}
