import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'
import MediaSlider from '../../ui/controls/MediaSlider.vue'
import { fakeMedia } from '../utils/BaseMediaPlayer.test-utils'

const PRE_IMAGE = { id: 'banner', src: '/ads/banner.png', duration: 3, skipAfter: 1, clickUrl: 'https://example.com/promo' }

const VIDEO_AD = { id: 'clip', src: '/ads/clip.webm', type: 'video/webm' }

async function setup(props: Record<string, unknown> = {}) {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	const wrapper = mount(BaseMediaPlayer, { props: { sources: '/media/demo.webm', title: 'Демо', ...props }, attachTo: document.body })
	const video = wrapper.get('video').element as HTMLVideoElement
	const fake = fakeMedia(video, { duration: 60 })
	await nextTick()
	fake.emit('loadedmetadata')
	await nextTick()
	const adEvents = (): string[] =>
		(wrapper.emitted<[{ type: string; ad: { id: string } }]>('ad') ?? []).map(([event]) => `${event.type}:${event.ad.id}`)
	return { wrapper, video, fake, adEvents }
}

describe('BaseMediaPlayer: реклама', () => {
	afterEach(() => {
		vi.useRealTimers()
		document.body.innerHTML = ''
		vi.restoreAllMocks()
	})

	it('картинка перед видео: слой рекламы вместо панели, клавиши плеера не работают, пропуск возвращает запись', async () => {
		vi.useFakeTimers()
		const { wrapper, fake, adEvents } = await setup({ adBreaks: [{ at: 'pre', ads: [PRE_IMAGE] }] })

		await wrapper.get('.base-media-player__big-play').trigger('click')
		expect(wrapper.classes()).toContain('base-media-player--ad')
		expect(wrapper.get('[role="region"][aria-label="Реклама"]').text()).toContain('Пропустить через 1')
		expect(wrapper.get('.base-media-player__ad-media').attributes('src')).toBe('/ads/banner.png')
		await wrapper.trigger('keydown', { code: 'KeyK' })
		expect(fake.play).toHaveBeenCalledOnce()

		const link = wrapper.get('.base-media-player__ad-link')
		expect(link.attributes()).toMatchObject({
			href: 'https://example.com/promo',
			target: '_blank',
			rel: 'sponsored noopener noreferrer',
		})
		const surface = wrapper.get('.base-media-player__ad-surface')
		expect(surface.attributes()).toMatchObject({
			href: 'https://example.com/promo',
			target: '_blank',
			tabindex: '-1',
			'aria-hidden': 'true',
		})
		await surface.trigger('click')
		await link.trigger('click')
		await wrapper.get('.base-media-player__ad button[aria-label="Воспроизвести"]').trigger('click')
		vi.advanceTimersByTime(1000)
		await nextTick()
		await wrapper.get('.base-media-player__ad-skip').trigger('click')
		expect(wrapper.classes()).not.toContain('base-media-player--ad')
		expect(fake.play).toHaveBeenCalledTimes(2)
		expect(adEvents()).toEqual(['start:banner', 'click:banner', 'click:banner', 'skip:banner'])
		wrapper.unmount()
	})

	it('ролик в середине: события элемента объявления, метка паузы на шкале', async () => {
		const { wrapper, fake, adEvents } = await setup({ adBreaks: [{ at: 30, ads: [VIDEO_AD, { ...VIDEO_AD, id: 'broken' }] }] })
		expect(wrapper.findComponent(MediaSlider).props('markers')).toEqual([30])

		fake.update({ paused: false }, 'play')
		fake.update({ currentTime: 31 }, 'seeked')
		await nextTick()
		await nextTick()
		const adVideo = wrapper.get('video.base-media-player__ad-media')
		const element = adVideo.element as HTMLVideoElement
		Object.defineProperty(element, 'duration', { configurable: true, value: 8 })
		Object.defineProperty(element, 'currentTime', { configurable: true, value: 2 })
		await adVideo.trigger('loadedmetadata')
		await adVideo.trigger('timeupdate')
		expect(wrapper.get('.base-media-player__ad-progress').attributes('style')).toContain('width: 25%')
		Object.defineProperty(element, 'paused', { configurable: true, value: true })
		await adVideo.trigger('pause')
		expect(wrapper.find('.base-media-player__ad button[aria-label="Воспроизвести"]').exists()).toBe(true)
		await adVideo.trigger('play')
		await adVideo.trigger('ended')
		await nextTick()
		await wrapper.get('video.base-media-player__ad-media').trigger('error')
		expect(adEvents()).toEqual(['start:clip', 'complete:clip', 'start:broken', 'error:broken'])
		expect(wrapper.find('.base-media-player__ad').exists()).toBe(false)
		wrapper.unmount()
	})

	it('интеграция: отрезок на шкале, «Пропустить рекламу» вместо пропуска главы', async () => {
		const { wrapper, fake, adEvents } = await setup({
			adSegments: [{ id: 'sponsor', start: 10, end: 20, title: 'Бренд' }],
			chapters: [{ start: 0, end: 25, title: 'Опенинг', kind: 'intro' }],
		})
		expect(wrapper.findComponent(MediaSlider).props('highlights')).toEqual([[10, 20]])

		fake.update({ currentTime: 12 }, 'seeked')
		await nextTick()
		expect(wrapper.get('.base-media-player__ad-segment').text()).toContain('Реклама · Бренд')
		expect(wrapper.find('.base-media-player__skip').exists()).toBe(false)
		await wrapper.get('.base-media-player__ad-segment button').trigger('click')
		expect(fake.values.currentTime).toBe(20)
		await nextTick()
		expect(wrapper.find('.base-media-player__skip').exists()).toBe(true)
		expect(adEvents()).toEqual(['start:sponsor', 'skip:sponsor'])
		wrapper.unmount()
	})

	it('реклама после серии задерживает отсчёт до следующей серии', async () => {
		const episodes = [
			{ id: 'e1', title: 'Серия 1', sources: '/e1.webm', adBreaks: [{ at: 'post', ads: [VIDEO_AD] }] },
			{ id: 'e2', title: 'Серия 2', sources: '/e2.webm' },
		]
		const { wrapper, fake } = await setup({ sources: undefined, playlists: [{ id: 's1', title: 'Сезон 1', episodes }] })

		fake.update({ paused: true, ended: true }, 'ended')
		await nextTick()
		expect(wrapper.find('.base-media-player__ad').exists()).toBe(true)
		expect(wrapper.find('.base-media-player__next').exists()).toBe(false)
		await wrapper.get('video.base-media-player__ad-media').trigger('ended')
		await nextTick()
		expect(wrapper.get('.base-media-player__next-title').text()).toBe('Следующая серия через 5')
		wrapper.unmount()
	})

	it('пауза VAST: пока ответ сети загружается — индикатор загрузки вместо панели', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => new Promise(() => undefined)),
		)
		const { wrapper } = await setup({ adBreaks: [{ at: 'pre', vast: 'https://ads.example.com/vast' }] })

		await wrapper.get('.base-media-player__big-play').trigger('click')
		expect(wrapper.classes()).toContain('base-media-player--ad')
		expect(wrapper.get('[role="region"][aria-label="Реклама"]').find('[role="status"]').exists()).toBe(true)
		vi.unstubAllGlobals()
		wrapper.unmount()
	})
})
