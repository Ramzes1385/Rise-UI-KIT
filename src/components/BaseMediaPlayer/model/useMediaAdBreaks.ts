import type { Ref } from 'vue'
import { isSafeUrl } from '@utils/urlUtils'
import { UI_PLAYER } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { MediaAdBreak, MediaAdsOptions, MediaAdPosition, MediaAdCreative, MediaAdEventType } from '../types/MediaAds.types'

const IMAGE_TICK = 250

const DEFAULT_IMAGE_DURATION = 5

const VIDEO_PROTOCOLS = ['http:', 'https:', 'blob:'] as const

const IMAGE_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

export function isImageAd(ad: MediaAdCreative): boolean {
	return ad.type ? ad.type.startsWith('image/') : /\.(avif|gif|jpe?g|png|svg|webp)(?:[?#]|$)/i.test(ad.src)
}

function isSafeAd(ad: MediaAdCreative): boolean {
	return isSafeUrl(ad.src, isImageAd(ad) ? IMAGE_PROTOCOLS : VIDEO_PROTOCOLS)
}

function isDue(adBreak: MediaAdBreak, time: number): boolean {
	return adBreak.at === 'pre' || (typeof adBreak.at === 'number' && adBreak.at <= time)
}

function useImageTimer(options: { elapsed: Ref<number>; isRunning: () => boolean; onTick: () => void }): void {
	let timer: ReturnType<typeof setInterval> | undefined
	watch(options.isRunning, isRunning => {
		clearInterval(timer)
		if (!isRunning) return
		timer = setInterval(() => {
			options.elapsed.value += IMAGE_TICK / 1000
			options.onTick()
		}, IMAGE_TICK)
	})
	onBeforeUnmount(() => clearInterval(timer))
}

function useAdQueue(options: MediaAdsOptions) {
	const breaks = computed(() => (options.breaks() ?? []).map(adBreak => ({ ...adBreak, ads: adBreak.ads.filter(isSafeAd) })))
	const position = ref<MediaAdPosition | null>(null)
	const played = new Set<number>()
	watch(breaks, () => played.clear())
	const currentBreak = computed(() => (position.value ? breaks.value[position.value.breakIndex] : null))
	return {
		breaks,
		position,
		played,
		currentBreak,
		currentAd: computed(() => (position.value ? (currentBreak.value?.ads[position.value.adIndex] ?? null) : null)),
		dueBreak(time: number): number | undefined {
			const due = breaks.value
				.map((adBreak, index) => ({ adBreak, index }))
				.filter(({ adBreak, index }) => !played.has(index) && isDue(adBreak, time))
			due.forEach(({ index }) => played.add(index))
			return due[due.length - 1]?.index
		},
	}
}

function useAdPlayback(options: MediaAdsOptions, queue: ReturnType<typeof useAdQueue>) {
	const elapsed = ref(0)
	const length = ref(0)
	const isAdPaused = ref(false)
	let resumeMain = false
	const emit = (type: MediaAdEventType): void => {
		const ad = queue.currentAd.value
		if (ad) options.emitAd({ type, ad, adBreak: queue.currentBreak.value ?? undefined })
	}
	const startAd = (): void => {
		const ad = queue.currentAd.value as MediaAdCreative
		elapsed.value = 0
		isAdPaused.value = false
		length.value = isImageAd(ad) ? (ad.duration ?? DEFAULT_IMAGE_DURATION) : 0
		emit('start')
	}
	const next = (type: MediaAdEventType): void => {
		const position = queue.position.value
		if (!position) return
		emit(type)
		const hasMore = position.adIndex + 1 < (queue.currentBreak.value?.ads.length ?? 0)
		const isPost = queue.currentBreak.value?.at === 'post'
		queue.position.value = hasMore ? { ...position, adIndex: position.adIndex + 1 } : null
		if (hasMore) startAd()
		else if (!isPost && resumeMain) void options.actions.play()
	}
	return {
		elapsed,
		length,
		isAdPaused,
		next,
		startBreak(index: number, shouldResume: boolean): void {
			if (!queue.breaks.value[index]?.ads.length) return
			resumeMain = shouldResume
			options.actions.pause()
			queue.position.value = { breakIndex: index, adIndex: 0 }
			startAd()
		},
		click(): void {
			emit('click')
			isAdPaused.value = true
			options.adMedia.value?.pause()
		},
	}
}

function useAdTriggers(options: MediaAdsOptions, queue: ReturnType<typeof useAdQueue>, playback: ReturnType<typeof useAdPlayback>): void {
	const startDue = (): void => {
		const index = queue.dueBreak(options.state.currentTime)
		if (index !== undefined) playback.startBreak(index, true)
	}
	watch(
		options.media,
		(element, _, onCleanup) => {
			if (!element) return
			element.addEventListener('play', startDue)
			onCleanup(() => element.removeEventListener('play', startDue))
		},
		{ immediate: true },
	)
	watch(
		() => options.state.currentTime,
		() => !queue.position.value && !options.state.isPaused && !options.state.isSeeking && startDue(),
	)
	watch(
		() => options.state.isEnded,
		isEnded => {
			const index = queue.breaks.value.findIndex((adBreak, position) => adBreak.at === 'post' && !queue.played.has(position))
			if (!isEnded || queue.position.value || index === -1) return
			queue.played.add(index)
			playback.startBreak(index, false)
		},
	)
}

function useAdVideo(options: MediaAdsOptions, queue: ReturnType<typeof useAdQueue>, playback: ReturnType<typeof useAdPlayback>): void {
	watch(
		() => [options.adMedia.value, queue.currentAd.value] as const,
		([element, ad]) => {
			if (!element || !ad || isImageAd(ad)) return
			element.volume = options.state.volume
			void element.play().catch(() => {
				element.muted = true
				return element.play().catch(() => playback.next('error'))
			})
		},
		{ flush: 'post' },
	)
	watch(
		() => options.state.volume,
		volume => {
			if (options.adMedia.value) options.adMedia.value.volume = volume
		},
	)
}

function useAdTexts(queue: ReturnType<typeof useAdQueue>, playback: ReturnType<typeof useAdPlayback>) {
	const ad = queue.currentAd
	const { elapsed, length } = playback
	const canSkip = computed(() => ad.value?.skipAfter !== undefined && elapsed.value >= ad.value.skipAfter)
	const total = computed(() => queue.currentBreak.value?.ads.length ?? 0)
	return {
		canSkipAd: canSkip,
		adLabel: computed(() => {
			const index = (queue.position.value?.adIndex ?? 0) + 1
			const label = total.value > 1 ? formatMessage(UI_PLAYER.AD_COUNT, { n: index, total: total.value }) : UI_PLAYER.AD
			return [label, ad.value?.title].filter(Boolean).join(' · ')
		}),
		adLink: computed(() => (ad.value?.clickUrl && isSafeUrl(ad.value.clickUrl, ['http:', 'https:']) ? ad.value.clickUrl : undefined)),
		adSkipText: computed(() =>
			ad.value?.skipAfter === undefined || canSkip.value
				? ''
				: formatMessage(UI_PLAYER.AD_SKIP_IN, { n: Math.ceil(ad.value.skipAfter - elapsed.value) }),
		),
		adProgressStyle: computed(() => ({ width: `${length.value > 0 ? Math.min(100, (elapsed.value / length.value) * 100) : 0}%` })),
	}
}

export function useMediaAdBreaks(options: MediaAdsOptions) {
	const queue = useAdQueue(options)
	const playback = useAdPlayback(options, queue)
	const { elapsed, length, isAdPaused } = playback
	const ad = queue.currentAd
	useAdTriggers(options, queue, playback)
	useAdVideo(options, queue, playback)
	useImageTimer({
		elapsed,
		isRunning: () => Boolean(ad.value && isImageAd(ad.value) && !isAdPaused.value),
		onTick: () => elapsed.value >= length.value && playback.next('complete'),
	})

	return {
		...useAdTexts(queue, playback),
		currentAd: ad,
		isAdPlaying: computed(() => ad.value !== null),
		isAdVideo: computed(() => Boolean(ad.value && !isImageAd(ad.value))),
		isAdPaused,
		adPauseLabel: computed(() => (isAdPaused.value ? UI_PLAYER.PLAY : UI_PLAYER.PAUSE)),
		adMarks: computed(() => queue.breaks.value.flatMap(adBreak => (typeof adBreak.at === 'number' ? [adBreak.at] : []))),
		skipAd: () => playback.next('skip'),
		completeAd: () => playback.next('complete'),
		failAd: () => playback.next('error'),
		clickAd: playback.click,
		toggleAdPause(): void {
			const element = options.adMedia.value
			if (element && !isImageAd(ad.value as MediaAdCreative)) void (element.paused ? element.play() : element.pause())
			else isAdPaused.value = !isAdPaused.value
		},
		onAdTime(event: Event): void {
			const element = event.target as HTMLVideoElement
			elapsed.value = element.currentTime
			length.value = Number.isFinite(element.duration) ? element.duration : 0
		},
		onAdPlayState(event: Event): void {
			isAdPaused.value = (event.target as HTMLVideoElement).paused
		},
	}
}
