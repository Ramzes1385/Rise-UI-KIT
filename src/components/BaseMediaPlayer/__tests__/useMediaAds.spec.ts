import { nextTick, reactive, ref } from 'vue'
import { useMediaAdSegments } from '../model/useMediaAdSegments'
import { fakeMedia, withSetup } from './BaseMediaPlayer.test-utils'
import { isImageAd, useMediaAdBreaks } from '../model/useMediaAdBreaks'
import type { MediaActions, MediaState } from '../types/MediaCore.types'
import type { MediaAdBreak, MediaAdSegment } from '../types/MediaAds.types'

const IMAGE = { id: 'banner', src: '/ads/banner.png', duration: 4, skipAfter: 2, title: 'Спонсор', clickUrl: 'https://example.com/promo' }

const VIDEO = { id: 'clip', src: '/ads/clip.webm', type: 'video/webm' }

function mediaState(): MediaState {
	return reactive({
		currentTime: 0,
		duration: 100,
		isPaused: true,
		isEnded: false,
		isSeeking: false,
		volume: 0.5,
		isMuted: false,
	}) as MediaState
}

function setup(initialBreaks: MediaAdBreak[]) {
	vi.useFakeTimers()
	const state = mediaState()
	const actions = {
		play: vi.fn(async () => {
			state.isPaused = false
		}),
		pause: vi.fn(() => {
			state.isPaused = true
		}),
		seek: vi.fn(),
	} as unknown as MediaActions
	const main = document.createElement('video')
	const adElement = document.createElement('video')
	const ad = fakeMedia(adElement, { duration: 10 })
	const breaks = ref(initialBreaks)
	const adMedia = ref<HTMLVideoElement | null>(null)
	const emitAd = vi.fn()
	const { result, wrapper } = withSetup(() =>
		useMediaAdBreaks({ breaks: () => breaks.value, segments: () => [], state, actions, media: ref(main), adMedia, emitAd }),
	)
	const events = (): string[] => emitAd.mock.calls.map(([event]) => `${event.type}:${event.ad.id}`)
	return { result, wrapper, state, actions, main, adElement, ad, breaks, adMedia, emitAd, events }
}

describe('useMediaAdBreaks', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('картинка перед видео: пауза записи, «Пропустить через», пропуск и продолжение', async () => {
		const { result, main, actions, events } = setup([{ id: 'pre', at: 'pre', ads: [IMAGE] }])

		main.dispatchEvent(new Event('play'))
		expect(actions.pause).toHaveBeenCalledOnce()
		expect(result.currentAd.value).toEqual(IMAGE)
		expect([result.isAdPlaying.value, result.isAdVideo.value]).toEqual([true, false])
		expect(result.adLabel.value).toBe('Реклама · Спонсор')
		expect(result.adLink.value).toBe('https://example.com/promo')
		expect(result.adSkipText.value).toBe('Пропустить через 2')
		await nextTick()
		vi.advanceTimersByTime(1000)
		expect(result.adProgressStyle.value).toEqual({ width: '25%' })
		vi.advanceTimersByTime(1000)
		expect([result.canSkipAd.value, result.adSkipText.value]).toEqual([true, ''])
		result.skipAd()
		expect(result.isAdPlaying.value).toBe(false)
		expect(actions.play).toHaveBeenCalledOnce()
		main.dispatchEvent(new Event('play'))
		expect(events()).toEqual(['start:banner', 'skip:banner'])
	})

	it('пауза из картинки и ролика: картинка досматривается, ролик играет с громкостью плеера', async () => {
		const { result, main, adMedia, adElement, ad, actions, events, state } = setup([
			{ at: 'pre', ads: [{ ...IMAGE, skipAfter: undefined }, VIDEO] },
		])

		main.dispatchEvent(new Event('play'))
		expect(result.adLabel.value).toBe('Реклама · 1 из 2 · Спонсор')
		expect(result.adSkipText.value).toBe('')
		await nextTick()
		vi.advanceTimersByTime(4000)
		expect(result.currentAd.value).toEqual(VIDEO)
		expect(result.adLabel.value).toBe('Реклама · 2 из 2')
		adMedia.value = adElement
		await nextTick()
		expect(ad.play).toHaveBeenCalledOnce()
		expect(adElement.volume).toBe(0.5)
		state.volume = 0.8
		await nextTick()
		expect(adElement.volume).toBe(0.8)
		ad.update({ currentTime: 5 })
		result.onAdTime({ target: adElement } as unknown as Event)
		expect(result.adProgressStyle.value).toEqual({ width: '50%' })
		result.completeAd()
		expect(actions.play).toHaveBeenCalledOnce()
		expect(events()).toEqual(['start:banner', 'complete:banner', 'start:clip', 'complete:clip'])
	})

	it('ролик без разрешения на звук запускается без звука; иначе — ошибка и следующее объявление', async () => {
		const { result, main, adMedia, adElement, ad, events } = setup([{ at: 'pre', ads: [VIDEO, { ...VIDEO, id: 'second' }] }])
		ad.play.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'))
		adMedia.value = adElement

		main.dispatchEvent(new Event('play'))
		await nextTick()
		await vi.waitFor(() => expect(ad.play).toHaveBeenCalledTimes(2))
		expect(adElement.muted).toBe(true)
		ad.play.mockRejectedValue(new DOMException('blocked', 'NotAllowedError'))
		result.failAd()
		await nextTick()
		await vi.waitFor(() => expect(events()).toEqual(['start:clip', 'error:clip', 'start:second', 'error:second']))
		expect(result.isAdPlaying.value).toBe(false)
	})

	it('в середине: пауза на своей секунде, перемотка через несколько пауз — только последняя', async () => {
		const breaks = [
			{ id: 'm1', at: 20, ads: [{ ...VIDEO, id: 'a' }] },
			{ id: 'm2', at: 40, ads: [{ ...VIDEO, id: 'b' }] },
			{ id: 'm3', at: 80, ads: [{ ...VIDEO, id: 'c' }] },
		]
		const { result, state, actions, events } = setup(breaks)

		expect(result.adMarks.value).toEqual([20, 40, 80])
		state.isPaused = false
		state.currentTime = 10
		await nextTick()
		state.isSeeking = true
		state.currentTime = 50
		await nextTick()
		expect(result.isAdPlaying.value).toBe(false)
		state.isSeeking = false
		state.currentTime = 50.2
		await nextTick()
		expect(result.currentAd.value?.id).toBe('b')
		result.skipAd()
		expect(actions.play).toHaveBeenCalledOnce()
		state.currentTime = 81
		await nextTick()
		expect(events()).toEqual(['start:b', 'skip:b', 'start:c'])
	})

	it('после видео: без продолжения записи; новый список — реклама снова; пустые паузы пропускаются', async () => {
		const { result, state, actions, breaks, main, events } = setup([
			{ at: 'post', ads: [{ ...VIDEO, id: 'post' }] },
			{ at: 'pre', ads: [{ src: 'javascript:alert(1)' }] },
		])

		main.dispatchEvent(new Event('play'))
		expect(result.isAdPlaying.value).toBe(false)
		state.isEnded = true
		await nextTick()
		expect(result.currentAd.value?.id).toBe('post')
		result.completeAd()
		expect(actions.play).not.toHaveBeenCalled()
		state.isEnded = false
		await nextTick()
		state.isEnded = true
		await nextTick()
		expect(result.isAdPlaying.value).toBe(false)

		breaks.value = [{ at: 'post', ads: [{ ...VIDEO, id: 'post' }] }]
		await nextTick()
		state.isEnded = false
		await nextTick()
		state.isEnded = true
		await nextTick()
		expect(events()).toEqual(['start:post', 'complete:post', 'start:post'])
	})

	it('переход по ссылке ставит объявление на паузу; кнопка паузы у ролика и картинки', async () => {
		const { result, main, adMedia, adElement, ad, events } = setup([{ at: 'pre', ads: [VIDEO, IMAGE] }])
		adMedia.value = adElement
		main.dispatchEvent(new Event('play'))
		await nextTick()

		result.clickAd()
		expect(ad.pause).toHaveBeenCalledOnce()
		expect(result.isAdPaused.value).toBe(true)
		expect(result.adPauseLabel.value).toBe('Воспроизвести')
		result.toggleAdPause()
		expect(ad.play).toHaveBeenCalledTimes(2)
		ad.update({ paused: false })
		result.onAdPlayState({ target: adElement } as unknown as Event)
		expect(result.adPauseLabel.value).toBe('Пауза')
		ad.update({ paused: false })
		result.toggleAdPause()
		expect(ad.pause).toHaveBeenCalledTimes(2)

		result.completeAd()
		adMedia.value = null
		result.toggleAdPause()
		expect(result.isAdPaused.value).toBe(true)
		vi.advanceTimersByTime(10_000)
		expect(result.isAdPlaying.value).toBe(true)
		result.onAdTime({ target: { currentTime: 1, duration: Number.NaN } } as unknown as Event)
		expect(result.adProgressStyle.value).toEqual({ width: '0%' })
		expect(events()).toEqual(['start:clip', 'click:clip', 'complete:clip', 'start:banner'])
	})

	it('небезопасная ссылка не выводится; тип картинки — по MIME или расширению', () => {
		const { result, main } = setup([{ at: 'pre', ads: [{ ...IMAGE, clickUrl: 'javascript:alert(1)' }] }])
		main.dispatchEvent(new Event('play'))

		expect(result.adLink.value).toBeUndefined()
		expect(isImageAd({ src: '/a.JPG?x=1' })).toBe(true)
		expect(isImageAd({ src: '/a', type: 'image/avif' })).toBe(true)
		expect(isImageAd({ src: '/a.mp4' })).toBe(false)
		result.completeAd()
		result.skipAd()
		result.clickAd()
		expect(result.isAdPaused.value).toBe(true)
	})
})

describe('useMediaAdSegments', () => {
	function setup(segments: MediaAdSegment[]) {
		const state = mediaState()
		const actions = { seek: vi.fn() } as unknown as MediaActions
		const emitAd = vi.fn()
		const { result } = withSetup(() => useMediaAdSegments({ segments: () => segments, state, actions, emitAd }))
		const events = (): string[] => emitAd.mock.calls.map(([event]) => `${event.type}:${event.ad.id}`)
		return { result, state, actions, events }
	}

	it('отрезок на шкале, «Пропустить рекламу» после задержки, пропуск и досмотр', async () => {
		const { result, state, actions, events } = setup([
			{ id: 'b', start: 60, end: 70 },
			{ id: 'a', start: 10, end: 30, title: 'Бренд', skipAfter: 5 },
			{ id: 'broken', start: 50, end: 40 },
		])

		expect(result.adSegmentRanges.value).toEqual([
			[10, 30],
			[60, 70],
		])
		state.currentTime = 12
		await nextTick()
		expect(result.adSegmentLabel.value).toBe('Реклама · Бренд')
		expect(result.canSkipAdSegment.value).toBe(false)
		state.currentTime = 16
		expect(result.canSkipAdSegment.value).toBe(true)
		result.skipAdSegment()
		expect(actions.seek).toHaveBeenCalledWith(30)
		state.currentTime = 30
		await nextTick()
		state.currentTime = 61
		await nextTick()
		state.currentTime = 70
		await nextTick()
		expect(result.adSegmentLabel.value).toBe('Реклама')
		result.skipAdSegment()
		expect(events()).toEqual(['start:a', 'skip:a', 'start:b', 'complete:b'])
	})
})

const VAST_XML = `<VAST version="4.0"><Ad id="net"><InLine>
	<Impression>https://t.example.com/imp</Impression>
	<Creatives><Creative><Linear skipoffset="00:00:05">
		<Duration>00:00:20</Duration>
		<TrackingEvents>
			<Tracking event="start">https://t.example.com/start</Tracking>
			<Tracking event="firstQuartile">https://t.example.com/q1</Tracking>
			<Tracking event="midpoint">https://t.example.com/q2</Tracking>
			<Tracking event="pause">https://t.example.com/pause</Tracking>
			<Tracking event="resume">https://t.example.com/resume</Tracking>
			<Tracking event="mute">https://t.example.com/mute</Tracking>
			<Tracking event="unmute">https://t.example.com/unmute</Tracking>
			<Tracking event="complete">https://t.example.com/complete</Tracking>
		</TrackingEvents>
		<VideoClicks><ClickTracking>https://t.example.com/click</ClickTracking></VideoClicks>
		<MediaFiles><MediaFile delivery="progressive" type="video/webm" width="640">https://cdn.example.com/net.webm</MediaFile></MediaFiles>
	</Linear></Creative></Creatives>
</InLine></Ad></VAST>`

describe('useMediaAdBreaks: VAST', () => {
	let pixels: string[]

	beforeEach(() => {
		pixels = []
		vi.stubGlobal(
			'Image',
			class {
				set src(value: string) {
					pixels.push(value.replace('https://t.example.com/', ''))
				}
			},
		)
		vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('maybe')
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
		vi.useRealTimers()
	})

	it('пауза VAST: загрузка, объявление из ответа сети, пиксели показа, квартилей, паузы, звука, клика и досмотра', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response(VAST_XML)),
		)
		const { result, main, state, actions, adMedia, adElement, ad } = setup([{ id: 'network', at: 'pre', vast: '/vast' }])
		vi.useRealTimers()

		main.dispatchEvent(new Event('play'))
		expect(actions.pause).toHaveBeenCalledOnce()
		expect([result.isAdLoading.value, result.isAdPlaying.value]).toEqual([true, true])
		await vi.waitFor(() => expect(result.currentAd.value?.src).toBe('https://cdn.example.com/net.webm'))
		expect(result.isAdLoading.value).toBe(false)
		expect(pixels).toEqual(['imp', 'start'])

		adMedia.value = adElement
		ad.update({ currentTime: 5, duration: 20 })
		result.onAdTime({ target: adElement } as unknown as Event)
		result.onAdTime({ target: adElement } as unknown as Event)
		result.toggleAdPause()
		ad.update({ paused: true })
		result.onAdPlayState({ target: adElement } as unknown as Event)
		result.toggleAdPause()
		state.isMuted = true
		await nextTick()
		state.isMuted = false
		await nextTick()
		result.clickAd()
		ad.update({ currentTime: 10 })
		result.onAdTime({ target: adElement } as unknown as Event)
		result.completeAd()
		expect(pixels).toEqual(['imp', 'start', 'q1', 'pause', 'resume', 'mute', 'unmute', 'click', 'q2', 'complete'])
		expect(actions.play).toHaveBeenCalledOnce()
	})

	it('пустой ответ, ошибка сервера и таймаут — запись продолжается без рекламы', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async (url: string, init: RequestInit) => {
				if (url === '/empty') return new Response('<VAST version="4.0"/>')
				if (url === '/down') return new Response('', { status: 500 })
				return new Promise((_, reject) =>
					init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))),
				)
			}),
		)
		const empty = setup([{ at: 'pre', vast: '/empty' }])
		vi.useRealTimers()
		empty.main.dispatchEvent(new Event('play'))
		await vi.waitFor(() => expect(empty.actions.play).toHaveBeenCalledOnce())
		expect(empty.result.isAdPlaying.value).toBe(false)

		const down = setup([{ at: 'pre', vast: '/down' }])
		vi.useRealTimers()
		down.main.dispatchEvent(new Event('play'))
		await vi.waitFor(() => expect(down.actions.play).toHaveBeenCalledOnce())

		const slow = setup([{ at: 'post', vast: '/slow' }])
		slow.state.isEnded = true
		await nextTick()
		expect(slow.result.isAdLoading.value).toBe(true)
		await vi.advanceTimersByTimeAsync(8000)
		await vi.waitFor(() => expect(slow.result.isAdLoading.value).toBe(false))
		expect(slow.actions.play).not.toHaveBeenCalled()
	})
})
