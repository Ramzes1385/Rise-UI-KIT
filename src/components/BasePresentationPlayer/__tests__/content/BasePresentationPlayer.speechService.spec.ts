import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { UI_PRESENTATION } from '../../model/player/messages'
import BasePresentationPlayer from '../../ui/BasePresentationPlayer.vue'
import MediaSlider from '@components/BaseMediaPlayer/ui/controls/MediaSlider.vue'
import { domException, fakeMedia } from '@components/BaseMediaPlayer/__tests__/utils/BaseMediaPlayer.test-utils'
import type { PresentationSlide, PresentationSpeechProvider, PresentationSpeechRequest } from '../../types/BasePresentationPlayer.types'
import { advance, mountContent, removeSpeech, statusText, stubSpeech, type ContentWrapper } from '../utils/presentationContent.test-utils'

const RU = { name: 'Милена', voiceURI: 'ru-milena', lang: 'ru-RU' }

const LOADER = '.base-media-player__loader'

function serviceSlides(extra: Partial<PresentationSlide> = {}): PresentationSlide[] {
	return [
		{ id: 'a', title: 'Первый', image: '/a.png', speech: 'Текст первого слайда', ...extra },
		{ id: 'b', title: 'Второй', image: '/b.png', speech: 'Текст второго слайда', ...extra },
		{ id: 'c', title: 'Третий', image: '/c.png', speech: 'Текст третьего слайда', ...extra },
	]
}

function delayedProvider(ms = 100) {
	const requests: PresentationSpeechRequest[] = []
	const texts: string[] = []
	const provider: PresentationSpeechProvider = {
		synthesize: vi.fn(async (text: string, request: PresentationSpeechRequest) => {
			texts.push(text)
			requests.push(request)
			await new Promise(resolve => setTimeout(resolve, ms))
			return new Blob([text], { type: 'audio/mpeg' })
		}),
	}
	return { provider, texts, requests }
}

function failingProvider(error: unknown = new Error('TTS 500')): PresentationSpeechProvider {
	return { synthesize: vi.fn(async () => Promise.reject(error)) }
}

function audioOf(wrapper: ContentWrapper, duration: number) {
	const media = fakeMedia(wrapper.find('audio').element as HTMLAudioElement, { duration })
	media.emit('loadedmetadata')
	return media
}

const seekSlider = (wrapper: ContentWrapper) => wrapper.findAllComponents(MediaSlider)[0]

describe('BasePresentationPlayer — озвучка сервисом (speechProvider)', () => {
	const createObjectURL = vi.fn((blob: Blob) => `blob:${blob.size}-${createObjectURL.mock.calls.length}`)
	const revokeObjectURL = vi.fn()

	beforeEach(() => {
		vi.useFakeTimers()
		vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }))
	})
	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
		createObjectURL.mockClear()
		revokeObjectURL.mockClear()
		removeSpeech()
	})

	it('первый слайд грузится до показа; при показе — лоадер, затем адрес в <audio>, play и предзагрузка следующего', async () => {
		const { provider, texts, requests } = delayedProvider()
		const wrapper = await mountContent({ slides: serviceSlides(), speechProvider: provider, speechVoice: 'filipp' })
		await advance(0)
		expect(texts).toEqual(['Текст первого слайда'])
		expect(requests[0]).toMatchObject({ voice: 'filipp', lang: 'ru', slide: 0 })
		expect(wrapper.find(LOADER).exists()).toBe(false)
		wrapper.vm.play()
		await advance(0)
		expect(wrapper.find(LOADER).exists()).toBe(true)
		expect(texts).toEqual(['Текст первого слайда', 'Текст второго слайда'])
		await advance(100)
		expect(wrapper.find('audio').attributes('src')).toMatch(/^blob:/)
		expect(wrapper.find(LOADER).exists()).toBe(false)
		expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
		expect(wrapper.emitted('speech-error')).toBeUndefined()
	})

	it('конец озвучки — slide-complete и следующий слайд из кэша без лоадера; предзагрузка третьего', async () => {
		const { provider, texts } = delayedProvider()
		const wrapper = await mountContent({ slides: serviceSlides(), speechProvider: provider })
		wrapper.vm.play()
		await advance(100)
		const first = wrapper.find('audio').attributes('src')
		const audio = audioOf(wrapper, 3)
		audio.update({ ended: true, paused: true, currentTime: 3 }, 'ended')
		await advance(0)
		expect(wrapper.emitted('slide-complete')?.[0][0]).toMatchObject({ id: 'a', index: 0 })
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		expect(wrapper.find('audio').attributes('src')).toMatch(/^blob:/)
		expect(wrapper.find('audio').attributes('src')).not.toBe(first)
		expect(wrapper.find(LOADER).exists()).toBe(false)
		expect(texts).toEqual(['Текст первого слайда', 'Текст второго слайда', 'Текст третьего слайда'])
	})

	it('пока озвучка грузится, таймер duration стоит и «Следующий слайд» в linear закрыта «после озвучки»', async () => {
		const { provider } = delayedProvider(2000)
		const wrapper = await mountContent({ slides: serviceSlides({ duration: 1 }), speechProvider: provider, navigation: 'linear' })
		wrapper.vm.play()
		await advance(1500)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		await wrapper.get(`button[aria-label="${UI_PRESENTATION.NEXT}"]`).trigger('click')
		expect(statusText(wrapper)).toBe(UI_PRESENTATION.LOCKED_AUDIO)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
	})

	it('ошибка поставщика — speech-error и откат на синтез браузера с голосом по языку кита; показ продолжается', async () => {
		const speech = stubSpeech([RU])
		const error = new Error('TTS 500')
		const wrapper = await mountContent({ slides: serviceSlides(), speechProvider: failingProvider(error), speechVoice: 'filipp' })
		wrapper.vm.play()
		await advance(0)
		expect(wrapper.emitted('speech-error')?.[0][0]).toEqual({ slide: 0, error })
		expect(wrapper.emitted('pause')).toBeUndefined()
		expect(speech.engine.speak).toHaveBeenCalledTimes(1)
		expect(speech.last()).toMatchObject({ text: 'Текст первого слайда', lang: 'ru-RU' })
		expect(speech.last()?.voice?.name).toBe(RU.name)
	})

	it('ошибка без синтеза браузера и без duration — слайд пройден и показ идёт дальше', async () => {
		removeSpeech()
		const wrapper = await mountContent({ slides: serviceSlides(), speechProvider: failingProvider() })
		wrapper.vm.play()
		await advance(0)
		expect(wrapper.emitted('slide-complete')?.[0][0]).toMatchObject({ id: 'a' })
		expect(wrapper.emitted('update:slide')?.[0]).toEqual([1])
		expect(wrapper.emitted('speech-error')).toHaveLength(3)
		expect(wrapper.emitted('complete')).toHaveLength(1)
	})

	it('ошибка до показа без синтеза браузера — слайд не листается сам; конец слайда — при нажатии «Пуск»', async () => {
		removeSpeech()
		const wrapper = await mountContent({ slides: serviceSlides(), speechProvider: failingProvider() })
		await advance(0)
		expect(wrapper.emitted('speech-error')).toHaveLength(1)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		expect(wrapper.emitted('slide-complete')).toBeUndefined()
		await advance(5000)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		wrapper.vm.play()
		await advance(0)
		expect(wrapper.emitted('slide-complete')?.[0][0]).toMatchObject({ id: 'a' })
		expect(wrapper.emitted('update:slide')?.[0]).toEqual([1])
	})

	it('ошибка до показа, затем смена слайда вручную — отложенный конец сброшен', async () => {
		removeSpeech()
		const provider: PresentationSpeechProvider = {
			synthesize: vi.fn(async (_text: string, request: PresentationSpeechRequest) =>
				request.slide === 0 ? Promise.reject(new Error('TTS 500')) : new Blob(['ok'], { type: 'audio/mpeg' }),
			),
		}
		const wrapper = await mountContent({ slides: serviceSlides(), speechProvider: provider })
		await advance(0)
		wrapper.vm.goTo(1)
		await advance(0)
		wrapper.vm.play()
		await advance(0)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		expect(wrapper.find('audio').attributes('src')).toMatch(/^blob:/)
	})

	it('ошибка без синтеза браузера, но с duration — слайд идёт по таймеру', async () => {
		removeSpeech()
		const wrapper = await mountContent({ slides: serviceSlides({ duration: 2 }), speechProvider: failingProvider() })
		wrapper.vm.play()
		await advance(1000)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		await advance(1100)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
	})

	it('таймаут 15 с — speech-error с TimeoutError и откат', async () => {
		const speech = stubSpeech([RU])
		const provider: PresentationSpeechProvider = {
			synthesize: vi.fn(
				(_text: string, request: PresentationSpeechRequest) =>
					new Promise<Blob>((_, reject) => request.signal.addEventListener('abort', () => reject(request.signal.reason))),
			),
		}
		const wrapper = await mountContent({ slides: serviceSlides().slice(0, 1), speechProvider: provider })
		wrapper.vm.play()
		await advance(14_000)
		expect(wrapper.emitted('speech-error')).toBeUndefined()
		await advance(1_100)
		const payload = wrapper.emitted('speech-error')?.[0][0] as { slide: number; error: DOMException }
		expect(payload.slide).toBe(0)
		expect(payload.error.name).toBe('TimeoutError')
		expect(speech.engine.speak).toHaveBeenCalledTimes(1)
	})

	it('ошибка <audio> на полученном адресе — speech-error, адрес снят и откат; показ не встаёт', async () => {
		const speech = stubSpeech([RU])
		const { provider } = delayedProvider()
		const wrapper = await mountContent({ slides: serviceSlides(), speechProvider: provider })
		wrapper.vm.play()
		await advance(100)
		const audio = audioOf(wrapper, 3)
		audio.update({ error: { code: 3 } as MediaError }, 'error')
		await advance(0)
		expect(wrapper.emitted('speech-error')?.[0][0]).toMatchObject({ slide: 0, error: { code: 'decode' } })
		expect(revokeObjectURL).toHaveBeenCalledTimes(1)
		expect(wrapper.find('audio').attributes('src')).toBeUndefined()
		expect(wrapper.emitted('pause')).toBeUndefined()
		expect(speech.engine.speak).toHaveBeenCalledTimes(1)
	})

	it('автозапуск заблокирован браузером — пауза показа без speech-error и без отката', async () => {
		stubSpeech([RU])
		const { provider } = delayedProvider()
		const wrapper = await mountContent({ slides: serviceSlides(), speechProvider: provider })
		wrapper.vm.play()
		await advance(100)
		const audio = audioOf(wrapper, 3)
		audio.play.mockRejectedValueOnce(domException('NotAllowedError'))
		wrapper.vm.pause()
		await advance(0)
		wrapper.vm.play()
		await advance(0)
		expect(wrapper.emitted('pause')).toHaveLength(2)
		expect(wrapper.emitted('speech-error')).toBeUndefined()
		expect(wrapper.find('audio').attributes('src')).toMatch(/^blob:/)
	})

	it('strict: перемотка синтезированной озвучки вперёд — не дальше достигнутой позиции', async () => {
		const { provider } = delayedProvider()
		const wrapper = await mountContent({ slides: serviceSlides(), speechProvider: provider, navigation: 'strict' })
		wrapper.vm.play()
		await advance(100)
		const audio = audioOf(wrapper, 10)
		audio.update({ currentTime: 3 }, 'timeupdate')
		await advance(50)
		seekSlider(wrapper).vm.$emit('update:modelValue', 0.8)
		await advance(0)
		expect(audio.values.currentTime).toBeCloseTo(3)
		seekSlider(wrapper).vm.$emit('update:modelValue', 0.1)
		await advance(0)
		expect(audio.values.currentTime).toBeCloseTo(1)
	})

	it('скорость показа применяется к <audio> озвучки, а не уходит в запрос', async () => {
		const { provider, requests } = delayedProvider()
		const wrapper = await mountContent({ slides: serviceSlides(), speechProvider: provider })
		await wrapper.get('[role="region"]').trigger('keydown', { key: '>', code: 'Period', shiftKey: true })
		wrapper.vm.play()
		await advance(100)
		expect(requests[0]).not.toHaveProperty('rate')
		expect((wrapper.find('audio').element as HTMLAudioElement).playbackRate).toBe(1.25)
	})

	it('скрытая вкладка — следующий слайд не грузится заранее, текущий грузится', async () => {
		const { provider, texts } = delayedProvider()
		Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
		const wrapper = await mountContent({ slides: serviceSlides(), speechProvider: provider })
		wrapper.vm.play()
		await advance(100)
		expect(texts).toEqual(['Текст первого слайда'])
		Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
		document.dispatchEvent(new Event('visibilitychange'))
		await advance(0)
		expect(texts).toEqual(['Текст первого слайда', 'Текст второго слайда'])
	})

	it('у слайда с audio или video поставщик не вызывается; общая дорожка выключает озвучку слайдов', async () => {
		const { provider, texts } = delayedProvider()
		await mountContent({ slides: serviceSlides({ audio: '/a.webm' }), speechProvider: provider })
		await advance(0)
		await mountContent({ slides: serviceSlides(), speechProvider: provider, audio: '/track.webm' })
		await advance(0)
		expect(texts).toEqual([])
	})

	it('размонтирование снимает адреса и отменяет запросы', async () => {
		const { provider, requests } = delayedProvider(1000)
		const wrapper = await mountContent({ slides: serviceSlides(), speechProvider: provider })
		wrapper.vm.play()
		await advance(0)
		wrapper.unmount()
		expect(requests.every(request => request.signal.aborted)).toBe(true)
		expect(wrapper.emitted('speech-error')).toBeUndefined()
	})

	it('слайд с речью, затем слайд с audio без duration — переход не перескакивает дальше', async () => {
		stubSpeech([RU])
		const slides: PresentationSlide[] = [
			{ id: 'a', title: 'Речь', image: '/a.png', speech: 'Текст' },
			{ id: 'b', title: 'Запись', image: '/b.png', audio: '/b.webm' },
			{ id: 'c', title: 'Третий', image: '/c.png', duration: 5 },
		]
		const wrapper = await mountContent({ slides })
		wrapper.vm.play()
		await advance(0)
		wrapper.vm.goTo(1)
		await advance(0)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		expect(wrapper.emitted('slide-complete')?.some(([value]) => (value as { id: string }).id === 'b')).toBeFalsy()
	})

	it('SSR: без window запросов нет, HTML рендерится', async () => {
		const { provider, texts } = delayedProvider()
		vi.stubGlobal('window', undefined)
		const html = await renderToString(
			createSSRApp({ render: () => h(BasePresentationPlayer, { title: 'Курс', slides: serviceSlides(), speechProvider: provider }) }),
		)
		expect(html).toContain('base-presentation-player')
		expect(texts).toEqual([])
	})
})
