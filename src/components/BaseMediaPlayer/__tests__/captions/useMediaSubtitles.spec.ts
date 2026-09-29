import { nextTick, reactive, ref } from 'vue'
import { withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { useMediaSubtitles } from '../../model/captions/useMediaSubtitles'
import type { MediaTextTrackItem } from '../../types/content/MediaSubtitles.types'

const RU = { src: '/subs/ru.vtt', label: 'Русский', srclang: 'ru', isDefault: true }

const EN = { src: '/subs/en.srt', label: 'English', srclang: 'en' }

const FILES: Record<string, string> = {
	'/subs/ru.vtt': 'WEBVTT\n\n00:00.000 --> 00:02.000\nПервая\n\n00:02.000 --> 00:04.000\nВторая',
	'/subs/en.srt': '1\n00:00:00,000 --> 00:00:02,000\n<i>First</i>\n',
	'/subs/empty.vtt': 'WEBVTT\n',
}

function subtitleFile(name: string, text: string): File {
	return new File([text], name)
}

function setup(initialTracks: MediaTextTrackItem[] | undefined = [RU, EN], initialTrack?: string | null) {
	const fetchMock = vi.fn(async (url: string, init?: RequestInit) =>
		url in FILES
			? new Response(FILES[url], { headers: { 'x-credentials': String(init?.credentials) } })
			: new Response('', { status: 404 }),
	)
	vi.stubGlobal('fetch', fetchMock)
	const state = reactive({ currentTime: 0, isPaused: true })
	const media = ref<HTMLMediaElement | null>(null)
	const tracks = ref(initialTracks)
	const textTrack = ref<string | null | undefined>(initialTrack)
	const flash = vi.fn()
	const emitTrack = vi.fn()
	const { result, wrapper } = withSetup(() =>
		useMediaSubtitles({
			tracks: () => tracks.value,
			textTrack: () => textTrack.value,
			state,
			media,
			credentials: () => 'include',
			flash,
			emitTrack,
		}),
	)
	const text = (): string => result.captionLines.value.map(line => line.map(segment => segment.text).join('')).join('\n')
	return { result, wrapper, state, media, tracks, textTrack, flash, emitTrack, fetchMock, text }
}

describe('useMediaSubtitles', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		vi.useRealTimers()
	})

	it('включает дорожку по умолчанию и показывает реплику текущей позиции', async () => {
		const { result, state, emitTrack, fetchMock, text } = setup()

		expect(result.activeCaptionId.value).toBe(RU.src)
		expect(emitTrack).toHaveBeenCalledWith(RU.src)
		expect(fetchMock).toHaveBeenCalledWith(RU.src, { credentials: 'include' })
		await vi.waitFor(() => expect(text()).toBe('Первая'))
		state.currentTime = 3
		await nextTick()
		expect(text()).toBe('Вторая')
		expect(result.captionTracks.value).toEqual([
			{ id: RU.src, label: 'Русский' },
			{ id: EN.src, label: 'English' },
		])
	})

	it('небезопасные адреса отбрасываются; без дорожки по умолчанию субтитры выключены', () => {
		const { result, emitTrack } = setup([{ src: 'javascript:alert(1)', label: 'XSS' }, EN])

		expect(result.captionTracks.value).toEqual([{ id: EN.src, label: 'English' }])
		expect(result.activeCaptionId.value).toBeNull()
		expect(emitTrack).not.toHaveBeenCalled()
		expect(result.captionLines.value).toEqual([])
	})

	it('выбор дорожки загружает файл один раз; неизвестная дорожка выключает субтитры', async () => {
		const { result, fetchMock, text } = setup()

		result.selectCaptionTrack(EN.src)
		result.selectCaptionTrack(RU.src)
		result.selectCaptionTrack(EN.src)
		await vi.waitFor(() => expect(text()).toBe('First'))
		expect(result.captionLines.value[0][0].isItalic).toBe(true)
		expect(fetchMock).toHaveBeenCalledTimes(2)
		result.selectCaptionTrack('/subs/unknown.vtt')
		expect(result.activeCaptionId.value).toBeNull()
		expect(text()).toBe('')
	})

	it('ошибка загрузки или файл без реплик: сообщение и выключение, повторный выбор загружает снова', async () => {
		const { result, flash, emitTrack, fetchMock } = setup([
			{ src: '/subs/missing.vtt', label: 'Нет файла', isDefault: true },
			{ src: '/subs/empty.vtt', label: 'Пустой' },
		])

		await vi.waitFor(() => expect(flash).toHaveBeenCalledWith('Не удалось загрузить субтитры'))
		expect(result.activeCaptionId.value).toBeNull()
		expect(emitTrack.mock.calls).toEqual([['/subs/missing.vtt'], [null]])

		result.selectCaptionTrack('/subs/empty.vtt')
		result.selectCaptionTrack('/subs/missing.vtt')
		await vi.waitFor(() => expect(flash).toHaveBeenCalledTimes(3))
		expect(fetchMock).toHaveBeenCalledTimes(3)
	})

	it('выбранная дорожка из v-model: null выключает, адрес включает', async () => {
		const { result, textTrack, fetchMock } = setup([RU, EN], null)

		expect(result.activeCaptionId.value).toBeNull()
		expect(fetchMock).not.toHaveBeenCalled()
		textTrack.value = EN.src
		await nextTick()
		expect(result.activeCaptionId.value).toBe(EN.src)
		textTrack.value = undefined
		await nextTick()
		expect(result.activeCaptionId.value).toBe(EN.src)
		textTrack.value = null
		await nextTick()
		expect(result.activeCaptionId.value).toBeNull()
	})

	it('клавиша C: выключить, включить последнюю, без дорожек — ничего', async () => {
		const { result, flash, tracks } = setup()

		result.selectCaptionTrack(EN.src)
		result.toggleCaptions()
		expect(result.activeCaptionId.value).toBeNull()
		expect(flash).toHaveBeenLastCalledWith('Субтитры выключены')
		result.toggleCaptions()
		expect(result.activeCaptionId.value).toBe(EN.src)
		expect(flash).toHaveBeenLastCalledWith('Субтитры: English')

		tracks.value = []
		await nextTick()
		expect(result.activeCaptionId.value).toBeNull()
		flash.mockClear()
		result.toggleCaptions()
		expect(flash).not.toHaveBeenCalled()
	})

	it('клавиша C без выбора ранее: дорожка по умолчанию, иначе первая', () => {
		const withDefault = setup([EN, RU], null)
		withDefault.result.toggleCaptions()
		expect(withDefault.result.activeCaptionId.value).toBe(RU.src)

		const withoutDefault = setup([EN], null)
		withoutDefault.result.toggleCaptions()
		expect(withoutDefault.result.activeCaptionId.value).toBe(EN.src)
	})

	it('дорожки пришли после монтирования; выбранная пропала — дорожка по умолчанию', async () => {
		const { result, tracks } = setup([])

		expect(result.activeCaptionId.value).toBeNull()
		tracks.value = [EN, RU]
		await nextTick()
		expect(result.activeCaptionId.value).toBe(RU.src)
		result.selectCaptionTrack(null)
		tracks.value = [EN]
		await nextTick()
		expect(result.activeCaptionId.value).toBeNull()
		result.selectCaptionTrack(EN.src)
		tracks.value = [RU]
		await nextTick()
		expect(result.activeCaptionId.value).toBe(RU.src)
	})

	it('файл зрителя: .srt в Windows-1251 становится дорожкой; пустой файл — сообщение', async () => {
		const { result, flash, emitTrack, text } = setup([])
		const cp1251 = new File(
			[new Uint8Array([0x31, 0x0a, 0x30, 0x30, 0x3a, 0x30, 0x30, 0x3a, 0x30, 0x30, 0x2c, 0x30, 0x30, 0x30])],
			'x.srt',
		)

		await result.loadCaptionFile(subtitleFile('serial-01.srt', '1\n00:00:00,000 --> 00:00:05,000\nИз файла\n'))
		expect(result.captionTracks.value).toEqual([{ id: 'file:serial-01.srt', label: 'Файл: serial-01.srt' }])
		expect(emitTrack).toHaveBeenLastCalledWith('file:serial-01.srt')
		expect(text()).toBe('Из файла')

		await result.loadCaptionFile(subtitleFile('serial-01.srt', '1\n00:00:00,000 --> 00:00:05,000\nЗаново\n'))
		expect(result.captionTracks.value).toHaveLength(1)
		expect(text()).toBe('Заново')

		await result.loadCaptionFile(cp1251)
		expect(flash).toHaveBeenCalledWith('Не удалось загрузить субтитры')
		const windows1251 = new Uint8Array([
			...new TextEncoder().encode('1\n00:00:00,000 --> 00:00:05,000\n'),
			0xcf,
			0xf0,
			0xe8,
			0xe2,
			0xe5,
			0xf2,
		])
		await result.loadCaptionFile(new File([windows1251], 'cp1251.srt'))
		expect(text()).toBe('Привет')
	})

	it('во время воспроизведения позиция берётся из элемента каждый кадр', async () => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
		const { result, state, media, text, wrapper } = setup()
		await vi.waitFor(() => expect(result.captionLines.value).toHaveLength(1))

		media.value = { currentTime: 3 } as HTMLMediaElement
		state.isPaused = false
		await nextTick()
		expect(text()).toBe('Вторая')
		media.value = { currentTime: 1 } as HTMLMediaElement
		vi.advanceTimersToNextFrame()
		expect(text()).toBe('Первая')
		media.value = null
		vi.advanceTimersToNextFrame()
		expect(text()).toBe('Первая')
		state.isPaused = true
		await nextTick()
		expect(text()).toBe('Первая')
		wrapper.unmount()
	})
})

function textTrack(init: Partial<Record<'kind' | 'label' | 'language' | 'mode', string>>): TextTrack {
	const track = new EventTarget() as TextTrack
	Object.assign(track, { kind: 'subtitles', label: '', language: '', mode: 'disabled', activeCues: null, ...init })
	return track
}

function textTrackList(tracks: TextTrack[]): TextTrackList {
	const list = new EventTarget() as TextTrackList
	const define = (items: TextTrack[]): void => {
		items.forEach((track, index) => Object.defineProperty(list, index, { value: track, configurable: true }))
		Object.defineProperty(list, 'length', { value: items.length, configurable: true })
	}
	define(tracks)
	return Object.assign(list, { define })
}

describe('useMediaSubtitles: субтитры потока и файла (textTracks)', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('дорожки элемента в списке; выбор скрывает вывод браузера и берёт реплики из activeCues', async () => {
		const stream = textTrack({ label: 'Русский (поток)', language: 'ru' })
		const plain = textTrack({ kind: 'captions' })
		const list = textTrackList([stream, textTrack({ kind: 'metadata' }), plain])
		const { result, media, fetchMock, text } = setup([EN], null)
		media.value = { textTracks: list, currentTime: 0 } as unknown as HTMLMediaElement
		await nextTick()

		expect(result.captionTracks.value).toEqual([
			{ id: EN.src, label: 'English' },
			{ id: 'text:0', label: 'Русский (поток)' },
			{ id: 'text:1', label: 'Субтитры 2' },
		])
		result.selectCaptionTrack('text:0')
		expect([stream.mode, plain.mode]).toEqual(['hidden', 'disabled'])
		expect(fetchMock).not.toHaveBeenCalled()
		Object.assign(stream, { activeCues: [{ text: '<i>Из потока</i>' }] })
		stream.dispatchEvent(new Event('cuechange'))
		await nextTick()
		expect(text()).toBe('Из потока')
		expect(result.captionLines.value[0][0].isItalic).toBe(true)
	})

	it('браузер или hls.js включили дорожку сами — плеер возвращает свой выбор; выключение и новые дорожки', async () => {
		const first = textTrack({ label: 'A' })
		const second = textTrack({ label: 'B' })
		const list = textTrackList([first, second]) as TextTrackList & { define: (items: TextTrack[]) => void }
		const { result, media } = setup([])
		media.value = { textTracks: list, currentTime: 0 } as unknown as HTMLMediaElement
		await nextTick()

		result.selectCaptionTrack('text:0')
		second.mode = 'showing'
		list.dispatchEvent(new Event('change'))
		expect([first.mode, second.mode]).toEqual(['hidden', 'disabled'])
		result.selectCaptionTrack(null)
		expect(first.mode).toBe('disabled')

		list.define([first, second, textTrack({ label: 'C' })])
		list.dispatchEvent(new Event('addtrack'))
		await nextTick()
		expect(result.captionTracks.value.map(track => track.label)).toEqual(['A', 'B', 'C'])
		expect(result.captionLines.value).toEqual([])
	})

	it('обработчики дорожек элемента снимаются вместе с плеером', async () => {
		const track = textTrack({ label: 'A' })
		const list = textTrackList([track])
		const removeFromList = vi.spyOn(list, 'removeEventListener')
		const removeFromTrack = vi.spyOn(track, 'removeEventListener')
		const { media, wrapper } = setup([])
		media.value = { textTracks: list, currentTime: 0 } as unknown as HTMLMediaElement
		await nextTick()

		wrapper.unmount()
		expect(removeFromList).toHaveBeenCalledTimes(3)
		expect(removeFromTrack).toHaveBeenCalledWith('cuechange', expect.any(Function))
	})
})
