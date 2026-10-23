import { createFetchSpeechProvider } from '../speechProviderUtils'
import type { PresentationSpeechRequest } from '@components/BasePresentationPlayer/types/BasePresentationPlayer.types'

function request(extra: Partial<PresentationSpeechRequest> = {}): PresentationSpeechRequest {
	return { lang: 'ru', slide: 2, signal: new AbortController().signal, ...extra }
}

const audioResponse = (blob: Blob) => ({ ok: true, status: 200, blob: async () => blob })

const callOf = (fetchMock: { mock: { calls: unknown[][] } }): [string, RequestInit] => fetchMock.mock.calls[0] as [string, RequestInit]

const initOf = (fetchMock: { mock: { calls: unknown[][] } }): RequestInit => callOf(fetchMock)[1]

describe('createFetchSpeechProvider', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('POST JSON { text, voice, lang, format } на адрес посредника, ответ — Blob', async () => {
		const blob = new Blob(['audio'], { type: 'audio/mpeg' })
		const fetchMock = vi.fn(async () => audioResponse(blob))
		vi.stubGlobal('fetch', fetchMock)
		const provider = createFetchSpeechProvider({ url: '/api/tts', format: 'mp3' })
		const signal = new AbortController().signal
		const result = await provider.synthesize('Привет', request({ voice: 'filipp', signal }))
		expect(result).toBeInstanceOf(Blob)
		expect(await (result as Blob).text()).toBe('audio')
		const init = initOf(fetchMock)
		expect(callOf(fetchMock)[0]).toBe('/api/tts')
		expect(init.method).toBe('POST')
		expect(init.signal).toBe(signal)
		expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
		expect(JSON.parse(init.body as string)).toEqual({ text: 'Привет', voice: 'filipp', lang: 'ru', format: 'mp3' })
	})

	it('без voice и format поля не отправляются; свои заголовки добавляются к Content-Type', async () => {
		const fetchMock = vi.fn(async () => audioResponse(new Blob(['a'])))
		vi.stubGlobal('fetch', fetchMock)
		const provider = createFetchSpeechProvider({ url: '/api/tts', headers: { Authorization: 'Bearer token' } })
		await provider.synthesize('Текст', request())
		const init = initOf(fetchMock)
		expect(init.headers).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer token' })
		expect(JSON.parse(init.body as string)).toEqual({ text: 'Текст', lang: 'ru' })
	})

	it('свой Content-Type (в любом регистре) не подменяется', async () => {
		const fetchMock = vi.fn(async () => audioResponse(new Blob(['a'])))
		vi.stubGlobal('fetch', fetchMock)
		const provider = createFetchSpeechProvider({ url: '/api/tts', headers: { 'content-type': 'application/vnd.app+json' } })
		await provider.synthesize('Текст', request())
		expect(initOf(fetchMock).headers).toEqual({ 'content-type': 'application/vnd.app+json' })
	})

	it('ответ не ok — ошибка «TTS <статус>»', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('fail', { status: 502 })),
		)
		const provider = createFetchSpeechProvider({ url: '/api/tts' })
		await expect(provider.synthesize('Текст', request())).rejects.toThrow('TTS 502')
	})

	it('отмена по signal пробрасывается отклонением fetch', async () => {
		const controller = new AbortController()
		vi.stubGlobal(
			'fetch',
			vi.fn(
				(_url: string, init: RequestInit) =>
					new Promise((_, reject) => init.signal?.addEventListener('abort', () => reject(init.signal?.reason))),
			),
		)
		const provider = createFetchSpeechProvider({ url: '/api/tts' })
		const pending = provider.synthesize('Текст', request({ signal: controller.signal }))
		controller.abort()
		await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
	})
})
