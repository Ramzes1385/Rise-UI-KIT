import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import { fakeAudio } from './audio.test-utils'
import BaseAudioPlayer from '../ui/BaseAudioPlayer.vue'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import { findCueIndex, splitMatches, toTranscriptCues, transcriptFileName, transcriptToText } from '../model/transcript/transcriptText'

const decodeWaveformPeaks = vi.hoisted(() => vi.fn(async (_src: string, _bars: number): Promise<number[] | null> => null))

vi.mock('@utils/media/mediaUtils', async original => ({ ...(await original<object>()), decodeWaveformPeaks }))

const VTT = [
	'WEBVTT',
	'',
	'00:00.000 --> 00:04.000',
	'<v Анна>Привет, &amp; добро пожаловать</v>',
	'',
	'00:04.000 --> 00:08.000',
	'<v.host Борис>Сегодня про <b>мир</b>',
	'звука',
	'',
	'00:10.000 --> 00:14.000',
	'Без говорящего',
].join('\n')

const SRT = '1\n00:00:01,000 --> 00:00:03,000\nПервая\n\n2\n00:00:03,000 --> 00:00:05,000\nВторая\n'

const scrollTo = vi.fn()

function setup(props: Record<string, unknown> = {}) {
	const result = render(BaseAudioPlayer, { props: { src: '/voice.webm', title: 'Подкаст', peaks: [0.5, 1], transcript: VTT, ...props } })
	const audio = result.container.querySelector('audio') as HTMLAudioElement
	return { ...result, audio, fake: fakeAudio(audio, { duration: 20 }) }
}

const toggle = (): HTMLElement => screen.getByRole('button', { name: 'Расшифровка' })

async function openPanel(): Promise<HTMLElement> {
	await fireEvent.click(toggle())
	return screen.getByRole('region', { name: 'Расшифровка' })
}

const cues = (): HTMLElement[] => within(screen.getByRole('list', { name: 'Реплики' })).getAllByRole('button')

describe('BaseAudioPlayer — расшифровка', () => {
	beforeEach(() => {
		HTMLElement.prototype.scrollTo = scrollTo
	})

	afterEach(() => {
		scrollTo.mockReset()
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
		vi.useRealTimers()
	})

	it('без расшифровки кнопки нет; пустая строка — тоже', () => {
		setup({ transcript: undefined })
		expect(screen.queryByRole('button', { name: 'Расшифровка' })).not.toBeInTheDocument()
		document.body.innerHTML = ''
		setup({ transcript: '   ' })
		expect(screen.queryByRole('button', { name: 'Расшифровка' })).not.toBeInTheDocument()
	})

	it('кнопка раскрывает панель: aria-expanded, aria-controls только у открытой, v-model', async () => {
		const { emitted } = setup()
		expect(toggle()).toHaveAttribute('aria-expanded', 'false')
		expect(toggle()).not.toHaveAttribute('aria-controls')
		const panel = await openPanel()
		expect(toggle()).toHaveAttribute('aria-expanded', 'true')
		expect(toggle()).toHaveAttribute('aria-controls', panel.id)
		expect(emitted('update:isTranscriptOpen')).toEqual([[true]])
		await fireEvent.click(toggle())
		expect(screen.queryByRole('region', { name: 'Расшифровка' })).not.toBeInTheDocument()
		expect(emitted('update:isTranscriptOpen')?.at(-1)).toEqual([false])
	})

	it('управляемое открытие через isTranscriptOpen', async () => {
		const { rerender } = setup({ isTranscriptOpen: true })
		expect(screen.getByRole('region', { name: 'Расшифровка' })).toBeInTheDocument()
		await rerender({ isTranscriptOpen: false })
		await waitFor(() => expect(screen.queryByRole('region', { name: 'Расшифровка' })).not.toBeInTheDocument())
	})

	it('разбор VTT: время, говорящий из <v>, текст без тегов и с сущностями', async () => {
		setup()
		await openPanel()
		const [first, second, third] = cues()
		expect(cues()).toHaveLength(3)
		expect(first).toHaveTextContent('0:00 Анна Привет, & добро пожаловать')
		expect(second).toHaveTextContent('0:04 Борис Сегодня про мир звука')
		expect(third).toHaveTextContent('0:10 Без говорящего')
		expect(third.querySelector('.base-audio-player__cue-speaker')).toBeNull()
	})

	it('разбор SRT', async () => {
		setup({ transcript: SRT })
		await openPanel()
		expect(cues().map(cue => cue.textContent?.replace(/\s+/g, ' '))).toEqual(['0:01 Первая', '0:03 Вторая'])
	})

	it('клик по реплике переходит к её началу', async () => {
		const { fake } = setup()
		await openPanel()
		await fireEvent.click(cues()[2])
		expect(fake.values.currentTime).toBe(10)
	})

	it('текущая реплика: aria-current, подсветка, автопрокрутка; в паузе между репликами — нет текущей', async () => {
		const { fake } = setup()
		await openPanel()
		fake.update({ currentTime: 5 }, 'timeupdate')
		await nextTick()
		await nextTick()
		expect(cues()[1]).toHaveAttribute('aria-current', 'true')
		expect(cues()[1]).toHaveClass('base-audio-player__cue--current')
		expect(cues()[0]).not.toHaveAttribute('aria-current')
		expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' })
		scrollTo.mockClear()
		fake.update({ currentTime: 9 }, 'timeupdate')
		await nextTick()
		await nextTick()
		expect(screen.queryByRole('button', { current: true })).not.toBeInTheDocument()
		expect(scrollTo).not.toHaveBeenCalled()
	})

	it('при reduced motion автопрокрутка без плавности', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
		const { fake } = setup()
		await openPanel()
		fake.update({ currentTime: 1 }, 'timeupdate')
		await nextTick()
		await nextTick()
		expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' })
	})

	it('ручная прокрутка ставит автопрокрутку на паузу; «К текущей реплике» возвращает', async () => {
		const { fake } = setup()
		await openPanel()
		await fireEvent.wheel(screen.getByRole('list', { name: 'Реплики' }))
		scrollTo.mockClear()
		fake.update({ currentTime: 5 }, 'timeupdate')
		await nextTick()
		await nextTick()
		expect(scrollTo).not.toHaveBeenCalled()
		await fireEvent.click(screen.getByRole('button', { name: 'К текущей реплике' }))
		await nextTick()
		expect(scrollTo).toHaveBeenCalledOnce()
		expect(screen.queryByRole('button', { name: 'К текущей реплике' })).not.toBeInTheDocument()
		await fireEvent.touchMove(screen.getByRole('list', { name: 'Реплики' }))
		expect(screen.getByRole('button', { name: 'К текущей реплике' })).toBeInTheDocument()
		await fireEvent.click(cues()[0])
		expect(screen.queryByRole('button', { name: 'К текущей реплике' })).not.toBeInTheDocument()
	})

	it('клавиатура: одна реплика в порядке Tab, стрелки, Home и End; Escape закрывает и возвращает фокус', async () => {
		const { fake, emitted } = setup()
		await openPanel()
		expect(cues().map(cue => cue.tabIndex)).toEqual([0, -1, -1])
		fake.update({ currentTime: 11 }, 'timeupdate')
		await nextTick()
		expect(cues().map(cue => cue.tabIndex)).toEqual([-1, -1, 0])
		cues()[2].focus()
		await fireEvent.keyDown(cues()[2], { key: 'ArrowDown' })
		expect(cues()[2]).toHaveFocus()
		await fireEvent.keyDown(cues()[2], { key: 'ArrowUp' })
		expect(cues()[1]).toHaveFocus()
		expect(cues()[1].tabIndex).toBe(0)
		await fireEvent.keyDown(cues()[1], { key: 'Home' })
		expect(cues()[0]).toHaveFocus()
		await fireEvent.keyDown(cues()[0], { key: 'ArrowUp' })
		expect(cues()[0]).toHaveFocus()
		await fireEvent.keyDown(cues()[0], { key: 'End' })
		expect(cues()[2]).toHaveFocus()
		await fireEvent.keyDown(cues()[2], { key: 'a' })
		expect(cues()[2]).toHaveFocus()
		expect(screen.getByRole('button', { name: 'К текущей реплике' })).toBeInTheDocument()
		await fireEvent.keyDown(cues()[2], { key: 'Escape' })
		await nextTick()
		expect(screen.queryByRole('region', { name: 'Расшифровка' })).not.toBeInTheDocument()
		expect(toggle()).toHaveFocus()
		expect(emitted('update:isTranscriptOpen')?.at(-1)).toEqual([false])
	})

	it('поиск: фильтр, подсветка в тексте и говорящем, итог для скринридера', async () => {
		setup()
		await openPanel()
		const search = screen.getByRole('textbox', { name: 'Поиск по расшифровке' })
		const status = screen.getByRole('status')
		expect(status).toHaveTextContent('')
		await fireEvent.update(search, 'МИР')
		expect(cues()).toHaveLength(1)
		expect(cues()[0].querySelector('mark')).toHaveTextContent('мир')
		expect(status).toHaveTextContent('Совпадений: 1')
		await fireEvent.update(search, 'анна')
		expect(cues()[0].querySelector('.base-audio-player__cue-speaker mark')).toHaveTextContent('Анна')
		await fireEvent.update(search, 'нет такого')
		expect(screen.queryByRole('list', { name: 'Реплики' })).not.toBeInTheDocument()
		expect(status).toHaveTextContent('Ничего не найдено')
		await fireEvent.update(search, ' ')
		expect(cues()).toHaveLength(3)
	})

	it('скачивание: текст со временем и говорящими, имя файла из названия', async () => {
		const createObjectURL = vi.fn((_blob: Blob) => 'blob:transcript')
		const revokeObjectURL = vi.fn()
		vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }))
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
		vi.useFakeTimers()
		setup({ title: 'Выпуск: 1/2' })
		await openPanel()
		await fireEvent.click(screen.getByRole('button', { name: 'Скачать расшифровку' }))
		const link = click.mock.contexts[0] as HTMLAnchorElement
		expect(link.download).toBe('Выпуск 1 2.txt')
		expect(await createObjectURL.mock.calls[0][0].text()).toBe(
			'[0:00] Анна: Привет, & добро пожаловать\n[0:04] Борис: Сегодня про мир звука\n[0:10] Без говорящего\n',
		)
		vi.runAllTimers()
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:transcript')
		vi.useRealTimers()
	})

	it('расшифровка без реплик: подсказка, скачивание недоступно', async () => {
		setup({ transcript: 'WEBVTT\n\n00:00.000 --> 00:01.000\n' })
		await openPanel()
		expect(screen.getByText('В расшифровке нет реплик')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Скачать расшифровку' })).toBeDisabled()
	})

	it('адрес файла: загрузка, затем реплики; кодировка — по decodeSubtitles', async () => {
		const fetchMock = vi.fn(async () => new Response(SRT))
		vi.stubGlobal('fetch', fetchMock)
		setup({ transcript: '/podcast.srt' })
		await openPanel()
		expect(screen.getByText('Загрузка расшифровки…')).toBeInTheDocument()
		expect(screen.getByRole('textbox', { name: 'Поиск по расшифровке' })).toBeDisabled()
		await waitFor(() => expect(cues()).toHaveLength(2))
		expect(fetchMock).toHaveBeenCalledWith('/podcast.srt', expect.objectContaining({ signal: expect.any(AbortSignal) }))
	})

	it('файл не загрузился или адрес небезопасен — сообщение об ошибке', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('', { status: 404 })),
		)
		const { rerender } = setup({ transcript: 'https://example.com/a.vtt' })
		await openPanel()
		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Не удалось загрузить расшифровку'))
		await rerender({ transcript: 'javascript:alert(1)' })
		expect(screen.getByRole('alert')).toHaveTextContent('Не удалось загрузить расшифровку')
	})

	it('смена адреса во время загрузки отменяет прежний запрос без ошибки', async () => {
		let reject: (reason: unknown) => void = () => undefined
		vi.stubGlobal(
			'fetch',
			vi.fn(
				(_src: string, init: RequestInit) =>
					new Promise((_, fail) => {
						reject = fail
						init.signal?.addEventListener('abort', () => fail(new DOMException('aborted', 'AbortError')))
					}),
			),
		)
		const { rerender } = setup({ transcript: '/a.vtt' })
		await openPanel()
		await rerender({ transcript: VTT })
		reject(new Error('late'))
		await nextTick()
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
		expect(cues()).toHaveLength(3)
	})

	it('ответ после смены источника не подменяет реплики', async () => {
		let resolve: (value: Response) => void = () => undefined
		vi.stubGlobal(
			'fetch',
			vi.fn(() => new Promise<Response>(done => (resolve = done))),
		)
		const { rerender } = setup({ transcript: '/a.srt' })
		await openPanel()
		await rerender({ transcript: VTT })
		resolve(new Response(SRT))
		await new Promise(done => setTimeout(done))
		expect(cues()).toHaveLength(3)
	})

	it('недоступный плеер: реплики и кнопка расшифровки отключены', async () => {
		setup({ isDisabled: true, isTranscriptOpen: true })
		expect(toggle()).toBeDisabled()
		expect(cues().every(cue => (cue as HTMLButtonElement).disabled)).toBe(true)
	})

	it('умолчания из плагина (kitDefaults)', () => {
		render(BaseAudioPlayer, {
			props: { src: '/voice.webm', title: 'Подкаст' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseAudioPlayer: { bars: 12 } } })] },
		})
		expect(decodeWaveformPeaks).toHaveBeenCalledWith('/voice.webm', 12)
	})
})

describe('transcriptText', () => {
	it('текущая реплика при наложении — последняя начавшаяся', () => {
		const list = toTranscriptCues([
			{ start: 0, end: 5, text: 'a' },
			{ start: 2, end: 4, text: 'b' },
		])
		expect(findCueIndex(list, 3)).toBe(1)
		expect(findCueIndex(list, 4.5)).toBe(0)
		expect(findCueIndex(list, 6)).toBe(-1)
	})

	it('подсветка нескольких совпадений; пустой запрос — весь текст', () => {
		expect(splitMatches('Мир и мир', 'мир')).toEqual([
			{ text: 'Мир', isMatch: true },
			{ text: ' и ', isMatch: false },
			{ text: 'мир', isMatch: true },
		])
		expect(splitMatches('текст', '')).toEqual([{ text: 'текст', isMatch: false }])
	})

	it('текст файла: формат времени по длительности; имя файла без названия', () => {
		const list = toTranscriptCues([{ start: 3700, end: 3705, text: '<v Ведущий>Финал' }])
		expect(transcriptToText(list, 0)).toBe('[1:01:40] Ведущий: Финал\n')
		expect(transcriptFileName(' / ')).toBe('transcript.txt')
	})
})
