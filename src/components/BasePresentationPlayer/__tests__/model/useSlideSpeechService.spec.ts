import { nextTick, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { useSlideSpeechService } from '../../model/playback/useSlideSpeechService'
import { withSetup } from '@components/BaseMediaPlayer/__tests__/utils/BaseMediaPlayer.test-utils'
import type { PresentationSlide, PresentationSpeechProvider, PresentationSpeechRequest } from '../../types/BasePresentationPlayer.types'

interface Call {
	text: string
	request: PresentationSpeechRequest
	resolve: (result: Blob | string) => void
	reject: (error: unknown) => void
}

function fakeProvider() {
	const calls: Call[] = []
	const provider: PresentationSpeechProvider = {
		synthesize: vi.fn(
			(text: string, request: PresentationSpeechRequest) =>
				new Promise<Blob | string>((resolve, reject) => {
					calls.push({ text, request, resolve, reject })
					request.signal.addEventListener('abort', () => reject(request.signal.reason))
				}),
		),
	}
	return { provider, calls, texts: () => calls.map(call => call.text), last: () => calls.at(-1)! }
}

function spokenSlides(count: number, extra: Partial<PresentationSlide> = {}): PresentationSlide[] {
	return Array.from({ length: count }, (_, index) => ({
		id: `s${index + 1}`,
		title: `Слайд-${index + 1}`,
		speech: `Текст ${index + 1}`,
		...extra,
	}))
}

async function setup(slides: PresentationSlide[], extra: Partial<{ voice: string; isShared: boolean; isPrefetching: boolean }> = {}) {
	const fake = fakeProvider()
	const state = {
		provider: ref<PresentationSpeechProvider | undefined>(fake.provider),
		slides: ref(slides),
		index: ref(0),
		isShared: ref(extra.isShared ?? false),
		isPrefetching: ref(extra.isPrefetching ?? true),
		voice: ref(extra.voice),
		lang: ref('ru'),
	}
	const onError = vi.fn()
	const { result, wrapper } = withSetup(() =>
		useSlideSpeechService({
			provider: () => state.provider.value,
			slides: () => state.slides.value,
			index: () => state.index.value,
			isShared: () => state.isShared.value,
			isPrefetching: () => state.isPrefetching.value,
			voice: () => state.voice.value,
			lang: () => state.lang.value,
			onError,
		}),
	)
	await flushPromises()
	return { ...fake, state, onError, service: result, wrapper }
}

async function settle(): Promise<void> {
	await flushPromises()
	await nextTick()
	await flushPromises()
}

const audio = (text = 'a'): Blob => new Blob([text], { type: 'audio/mpeg' })

describe('useSlideSpeechService', () => {
	const createObjectURL = vi.fn((blob: Blob) => `blob:${blob.size}-${createObjectURL.mock.calls.length}`)
	const revokeObjectURL = vi.fn()

	beforeEach(() => {
		vi.useFakeTimers()
		vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }))
	})
	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
		createObjectURL.mockClear()
		revokeObjectURL.mockClear()
	})

	it('запрашивает текущий и следующий слайд с голосом, языком и номером; ответ становится адресом', async () => {
		const { texts, calls, service, onError } = await setup(spokenSlides(3), { voice: 'filipp' })
		expect(texts()).toEqual(['Текст 1', 'Текст 2'])
		expect(calls[0].request).toMatchObject({ voice: 'filipp', lang: 'ru', slide: 0 })
		expect(calls[1].request.slide).toBe(1)
		expect(service.isPending.value).toBe(true)
		expect(service.audioSrc.value).toBeUndefined()
		calls[0].resolve(audio())
		await settle()
		expect(service.audioSrc.value).toMatch(/^blob:/)
		expect(service.isPending.value).toBe(false)
		expect(service.isFallback.value).toBe(false)
		expect(onError).not.toHaveBeenCalled()
	})

	it('без показа грузится только текущий слайд; показ — ещё и следующий', async () => {
		const { texts, state } = await setup(spokenSlides(3), { isPrefetching: false })
		expect(texts()).toEqual(['Текст 1'])
		state.isPrefetching.value = true
		await nextTick()
		expect(texts()).toEqual(['Текст 1', 'Текст 2'])
	})

	it('одинаковые запросы склеиваются; готовый слайд берётся из кэша без нового запроса', async () => {
		const { texts, calls, state, service } = await setup(spokenSlides(3, { speech: 'Одна фраза' }))
		expect(texts()).toEqual(['Одна фраза'])
		calls[0].resolve(audio())
		await settle()
		const url = service.audioSrc.value
		state.index.value = 1
		await nextTick()
		expect(service.audioSrc.value).toBe(url)
		expect(texts()).toEqual(['Одна фраза'])
	})

	it('кэш хранит 8 записей: вытеснение снимает адрес через revokeObjectURL', async () => {
		const { calls, state } = await setup(spokenSlides(12), { isPrefetching: false })
		for (let index = 0; index < 9; index++) {
			state.index.value = index
			await nextTick()
			calls[index].resolve(audio(`${index}`))
			await settle()
		}
		expect(revokeObjectURL).toHaveBeenCalledTimes(1)
		expect(revokeObjectURL).toHaveBeenCalledWith(createObjectURL.mock.results[0].value)
	})

	it('смена слайда отменяет лишний запрос через signal без ошибки; запросы N и N+1 остаются', async () => {
		const { calls, state, onError } = await setup(spokenSlides(4))
		state.index.value = 2
		await nextTick()
		await settle()
		expect(calls[0].request.signal.aborted).toBe(true)
		expect(calls[1].request.signal.aborted).toBe(true)
		expect(calls.map(call => call.request.slide)).toEqual([0, 1, 2, 3])
		expect(calls[2].request.signal.aborted).toBe(false)
		expect(onError).not.toHaveBeenCalled()
	})

	it('отклонение поставщика — onError, откат слайда и повтор при следующем заходе', async () => {
		const { calls, texts, state, service, onError } = await setup(spokenSlides(3), { isPrefetching: false })
		const error = new Error('TTS 500')
		calls[0].reject(error)
		await settle()
		expect(onError).toHaveBeenCalledWith({ slide: 0, error })
		expect(service.isFallback.value).toBe(true)
		expect(service.isPending.value).toBe(false)
		expect(service.audioSrc.value).toBeUndefined()
		state.index.value = 1
		await nextTick()
		expect(service.isFallback.value).toBe(false)
		state.index.value = 0
		await nextTick()
		expect(texts()).toEqual(['Текст 1', 'Текст 2', 'Текст 1'])
		expect(service.isPending.value).toBe(true)
	})

	it('таймаут 15 с — TimeoutError в onError и откат; поздний ответ не учитывается', async () => {
		const { calls, service, onError } = await setup(spokenSlides(1))
		await vi.advanceTimersByTimeAsync(14_999)
		expect(onError).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(1)
		await settle()
		expect(onError).toHaveBeenCalledTimes(1)
		expect((onError.mock.calls[0][0] as { error: DOMException }).error.name).toBe('TimeoutError')
		expect(service.isFallback.value).toBe(true)
		calls[0].resolve(audio())
		await settle()
		expect(createObjectURL).not.toHaveBeenCalled()
	})

	it('ошибка предзагрузки следующего слайда — onError с его номером; на нём сразу откат, без запроса', async () => {
		const { calls, texts, state, service, onError } = await setup(spokenSlides(3))
		calls[1].reject(new Error('TTS 502'))
		await settle()
		expect(onError).toHaveBeenCalledWith({ slide: 1, error: expect.any(Error) })
		expect(service.isFallback.value).toBe(false)
		state.index.value = 1
		await nextTick()
		expect(service.isFallback.value).toBe(true)
		expect(texts()).toEqual(['Текст 1', 'Текст 2', 'Текст 3'])
	})

	it('поставщик, не слушающий signal: поздний ответ отменённого запроса не создаёт адрес', async () => {
		const resolvers: Array<(result: Blob) => void> = []
		const provider: PresentationSpeechProvider = {
			synthesize: vi.fn(() => new Promise<Blob>(resolve => resolvers.push(resolve))),
		}
		const index = ref(0)
		const onError = vi.fn()
		withSetup(() =>
			useSlideSpeechService({
				provider: () => provider,
				slides: () => spokenSlides(4),
				index: () => index.value,
				isShared: () => false,
				isPrefetching: () => false,
				voice: () => undefined,
				lang: () => 'ru',
				onError,
			}),
		)
		await settle()
		index.value = 3
		await settle()
		expect(resolvers).toHaveLength(2)
		resolvers[0](audio())
		await settle()
		expect(createObjectURL).not.toHaveBeenCalled()
		resolvers[1](audio())
		await settle()
		expect(createObjectURL).toHaveBeenCalledTimes(1)
		expect(onError).not.toHaveBeenCalled()
	})

	it('адрес строкой используется как есть; небезопасный адрес — ошибка', async () => {
		const { calls, service, onError } = await setup(spokenSlides(2), { isPrefetching: false })
		calls[0].resolve('/tts/1.mp3')
		await settle()
		expect(service.audioSrc.value).toBe('/tts/1.mp3')
		expect(createObjectURL).not.toHaveBeenCalled()
		const { calls: unsafeCalls, service: unsafeService, onError: unsafeError } = await setup(spokenSlides(1), { isPrefetching: false })
		unsafeCalls[0].resolve('javascript:alert(1)')
		await settle()
		expect(unsafeError).toHaveBeenCalledWith({ slide: 0, error: expect.any(TypeError) })
		expect(unsafeService.isFallback.value).toBe(true)
		expect(onError).not.toHaveBeenCalled()
	})

	it('смена голоса или поставщика сбрасывает кэш: адреса сняты, запрос повторяется', async () => {
		const { calls, texts, state, service } = await setup(spokenSlides(1), { voice: 'filipp' })
		calls[0].resolve(audio())
		await settle()
		state.voice.value = 'jane'
		await nextTick()
		expect(revokeObjectURL).toHaveBeenCalledTimes(1)
		expect(service.audioSrc.value).toBeUndefined()
		expect(texts()).toEqual(['Текст 1', 'Текст 1'])
		expect(calls[1].request.voice).toBe('jane')
		calls[1].resolve(audio())
		await settle()
		state.provider.value = fakeProvider().provider
		await nextTick()
		expect(revokeObjectURL).toHaveBeenCalledTimes(2)
		expect(service.isPending.value).toBe(true)
		state.provider.value = undefined
		await nextTick()
		expect(service.isPending.value).toBe(false)
	})

	it('без поставщика, при общей дорожке, у слайдов с audio или video и без текста запросов нет', async () => {
		const { texts: sharedTexts } = await setup(spokenSlides(2), { isShared: true })
		expect(sharedTexts()).toEqual([])
		const slides = [
			{ id: 'a', title: 'A', speech: '   ' },
			{ id: 'b', title: 'B', speech: 'Б', audio: '/b.mp3' },
			{ id: 'c', title: 'C', speech: 'В', video: '/c.mp4' },
			{ id: 'd', title: 'D' },
		]
		const { texts, state, service } = await setup(slides)
		expect(texts()).toEqual([])
		expect(service.isPending.value).toBe(false)
		state.index.value = 3
		await nextTick()
		expect(texts()).toEqual([])
	})

	it('размонтирование отменяет запросы и снимает адреса', async () => {
		const { calls, wrapper, onError } = await setup(spokenSlides(3))
		calls[0].resolve(audio())
		await settle()
		wrapper.unmount()
		await settle()
		expect(revokeObjectURL).toHaveBeenCalledTimes(1)
		expect(calls[1].request.signal.aborted).toBe(true)
		expect(onError).not.toHaveBeenCalled()
	})

	it('failMedia: ошибка <audio> на полученном адресе снимает запись, зовёт onError и даёт откат; без адреса — ничего', async () => {
		const { calls, service, onError } = await setup(spokenSlides(2), { isPrefetching: false })
		service.failMedia(new Error('decode'))
		expect(onError).not.toHaveBeenCalled()
		calls[0].resolve(audio())
		await settle()
		service.failMedia({ code: 'decode' })
		await settle()
		expect(revokeObjectURL).toHaveBeenCalledTimes(1)
		expect(onError).toHaveBeenCalledWith({ slide: 0, error: { code: 'decode' } })
		expect(service.isFallback.value).toBe(true)
		expect(service.audioSrc.value).toBeUndefined()
	})

	it('синхронное исключение поставщика — ошибка, а не падение', async () => {
		const provider: PresentationSpeechProvider = {
			synthesize: () => {
				throw new Error('no network')
			},
		}
		const onError = vi.fn()
		const { result } = withSetup(() =>
			useSlideSpeechService({
				provider: () => provider,
				slides: () => spokenSlides(1),
				index: () => 0,
				isShared: () => false,
				isPrefetching: () => false,
				voice: () => undefined,
				lang: () => 'ru',
				onError,
			}),
		)
		await settle()
		expect(onError).toHaveBeenCalledWith({ slide: 0, error: expect.any(Error) })
		expect(result.isFallback.value).toBe(true)
	})
})
