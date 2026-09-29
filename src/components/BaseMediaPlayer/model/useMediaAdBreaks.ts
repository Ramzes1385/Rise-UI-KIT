import type { Ref } from 'vue'
import { isSafeUrl } from '@utils/urlUtils'
import { UI_PLAYER } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { resolveVast, sendPixels } from './vast'
import { computed, onBeforeUnmount, ref, shallowReactive, watch } from 'vue'
import type {
	MediaAdBreak,
	MediaAdsOptions,
	MediaAdPosition,
	MediaAdCreative,
	MediaAdEventType,
	MediaAdTrackingEvent,
} from '../types/MediaAds.types'

const IMAGE_TICK = 250

const DEFAULT_IMAGE_DURATION = 5

const VAST_TIMEOUT = 8000

const MEDIA_PLAYBACK_ERROR = 405

const QUARTILES: Array<[number, MediaAdTrackingEvent]> = [
	[0.25, 'firstQuartile'],
	[0.5, 'midpoint'],
	[0.75, 'thirdQuartile'],
]

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
	const resolved = shallowReactive(new Map<number, MediaAdCreative[]>())
	const breaks = computed(() =>
		(options.breaks() ?? []).map((adBreak, index) => ({
			...adBreak,
			ads: (resolved.get(index) ?? adBreak.ads ?? []).filter(isSafeAd),
		})),
	)
	const position = ref<MediaAdPosition | null>(null)
	const played = new Set<number>()
	watch(options.breaks, () => {
		played.clear()
		resolved.clear()
	})
	const currentBreak = computed(() => (position.value ? breaks.value[position.value.breakIndex] : null))
	return {
		breaks,
		resolved,
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

async function fetchXml(url: string): Promise<string> {
	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), VAST_TIMEOUT)
	try {
		const response = await fetch(url, { credentials: 'omit', signal: controller.signal })
		if (!response.ok) throw new Error(`HTTP ${response.status}`)
		return await response.text()
	} finally {
		clearTimeout(timer)
	}
}

function useVastLoader(options: MediaAdsOptions, queue: ReturnType<typeof useAdQueue>) {
	const isLoading = ref(false)
	return {
		isAdLoading: isLoading,
		async load(index: number, url: string): Promise<void> {
			isLoading.value = true
			const ads = await resolveVast(url, {
				fetchXml,
				canPlay: type => document.createElement('video').canPlayType(type) !== '',
				width: options.media.value?.clientWidth ?? 0,
				onError: (urls, errorCode) => sendPixels(urls, { errorCode }),
			})
			queue.resolved.set(index, ads)
			isLoading.value = false
		},
	}
}

function useAdTracking(options: MediaAdsOptions, queue: ReturnType<typeof useAdQueue>, elapsed: Readonly<Ref<number>>) {
	const quartiles = new Set<MediaAdTrackingEvent>()
	const send = (event: MediaAdTrackingEvent, errorCode?: number): void =>
		sendPixels(queue.currentAd.value?.tracking?.[event], { errorCode, adTime: elapsed.value })
	watch(
		() => options.state.isMuted,
		isMuted => queue.currentAd.value && send(isMuted ? 'mute' : 'unmute'),
	)
	return {
		reset: (): void => quartiles.clear(),
		send,
		progress(share: number): void {
			for (const [threshold, event] of QUARTILES) {
				if (share < threshold || quartiles.has(event)) continue
				quartiles.add(event)
				send(event)
			}
		},
	}
}

function useAdSequence(options: MediaAdsOptions, queue: ReturnType<typeof useAdQueue>) {
	const elapsed = ref(0)
	const length = ref(0)
	const isAdPaused = ref(false)
	const tracking = useAdTracking(options, queue, elapsed)
	const resume = { main: false }
	const emit = (type: MediaAdEventType): void => {
		const ad = queue.currentAd.value
		if (!ad) return
		options.emitAd({ type, ad, adBreak: queue.currentBreak.value ?? undefined })
		if (type === 'start') tracking.send('impression')
		tracking.send(type, type === 'error' ? MEDIA_PLAYBACK_ERROR : undefined)
	}
	const startAd = (): void => {
		const ad = queue.currentAd.value as MediaAdCreative
		elapsed.value = 0
		isAdPaused.value = false
		length.value = isImageAd(ad) ? (ad.duration ?? DEFAULT_IMAGE_DURATION) : 0
		tracking.reset()
		emit('start')
	}
	return {
		elapsed,
		length,
		isAdPaused,
		tracking,
		resume,
		emit,
		startAd,
		next(type: MediaAdEventType): void {
			const position = queue.position.value
			if (!position) return
			emit(type)
			const hasMore = position.adIndex + 1 < (queue.currentBreak.value?.ads.length ?? 0)
			const isPost = queue.currentBreak.value?.at === 'post'
			queue.position.value = hasMore ? { ...position, adIndex: position.adIndex + 1 } : null
			if (hasMore) startAd()
			else if (!isPost && resume.main) void options.actions.play()
		},
	}
}

function useAdPlayback(options: MediaAdsOptions, queue: ReturnType<typeof useAdQueue>) {
	const sequence = useAdSequence(options, queue)
	const vast = useVastLoader(options, queue)
	const startBreak = (index: number, shouldResume: boolean): void => {
		const adBreak = queue.breaks.value[index]
		const needsVast = Boolean(adBreak.vast) && !queue.resolved.has(index)
		if (!needsVast && adBreak.ads.length === 0) {
			if (queue.resolved.has(index) && shouldResume && adBreak.at !== 'post') void options.actions.play()
			return
		}
		sequence.resume.main = shouldResume
		options.actions.pause()
		if (needsVast) {
			void vast.load(index, adBreak.vast as string).then(() => startBreak(index, shouldResume))
			return
		}
		queue.position.value = { breakIndex: index, adIndex: 0 }
		sequence.startAd()
	}
	return {
		...sequence,
		isAdLoading: vast.isAdLoading,
		startBreak,
		click(): void {
			sequence.emit('click')
			sequence.isAdPaused.value = true
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
		onTick: () => {
			playback.tracking.progress(elapsed.value / length.value)
			if (elapsed.value >= length.value) playback.next('complete')
		},
	})

	return {
		...useAdTexts(queue, playback),
		currentAd: ad,
		isAdPlaying: computed(() => ad.value !== null || playback.isAdLoading.value),
		isAdLoading: playback.isAdLoading,
		isAdVideo: computed(() => Boolean(ad.value && !isImageAd(ad.value))),
		isAdPaused,
		adPauseLabel: computed(() => (isAdPaused.value ? UI_PLAYER.PLAY : UI_PLAYER.PAUSE)),
		adMarks: computed(() => queue.breaks.value.flatMap(adBreak => (typeof adBreak.at === 'number' ? [adBreak.at] : []))),
		skipAd: () => playback.next('skip'),
		completeAd: () => playback.next('complete'),
		failAd: () => playback.next('error'),
		clickAd: playback.click,
		toggleAdPause(): void {
			playback.tracking.send(isAdPaused.value ? 'resume' : 'pause')
			const element = options.adMedia.value
			if (element && !isImageAd(ad.value as MediaAdCreative)) void (element.paused ? element.play() : element.pause())
			else isAdPaused.value = !isAdPaused.value
		},
		onAdTime(event: Event): void {
			const element = event.target as HTMLVideoElement
			elapsed.value = element.currentTime
			length.value = Number.isFinite(element.duration) ? element.duration : 0
			if (length.value > 0) playback.tracking.progress(elapsed.value / length.value)
		},
		onAdPlayState(event: Event): void {
			isAdPaused.value = (event.target as HTMLVideoElement).paused
		},
	}
}
