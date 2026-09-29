import { nextTick, reactive, ref } from 'vue'
import { useMediaStats } from '../model/useMediaStats'
import { withSetup } from './BaseMediaPlayer.test-utils'
import type { MediaState } from '../types/MediaCore.types'

function video(quality?: VideoPlaybackQuality) {
	const element = document.createElement('video')
	Object.defineProperties(element, {
		currentSrc: { value: 'https://cdn.example.com/demo.webm' },
		videoWidth: { value: 480 },
		videoHeight: { value: 270 },
		getVideoPlaybackQuality: { value: quality ? () => quality : undefined },
	})
	return element
}

function setup(element: HTMLVideoElement | null) {
	const state = reactive({
		currentTime: 5,
		duration: 12,
		buffered: [[0, 8]],
		playbackRate: 1.5,
		volume: 0.5,
		isMuted: false,
	}) as unknown as MediaState
	const media = ref<HTMLMediaElement | null>(element)
	const { result, wrapper } = withSetup(() => useMediaStats({ media, state, source: () => ({ src: 'demo.webm', type: 'video/webm' }) }))
	return { state, media, result, wrapper }
}

describe('useMediaStats', () => {
	it('источник, формат, разрешение, кадры, буфер, скорость, громкость, позиция и состояние', () => {
		const { result } = setup(video({ droppedVideoFrames: 3, totalVideoFrames: 120 } as VideoPlaybackQuality))
		const values = Object.fromEntries(result.statsRows.value.map(row => [row.label, row.value]))

		expect(values).toMatchObject({
			Источник: 'https://cdn.example.com/demo.webm',
			Формат: 'video/webm',
			Разрешение: '480×270',
			Кадры: '3 пропущено из 120',
			'Загружено вперёд': '3 с',
			Скорость: '1,5×',
			Позиция: '0:05 / 0:12',
		})
		expect(values['Громкость']).toMatch(/^50\s%$/)
		const report = result.statsReport().split('\n')
		expect(report[0]).toMatch(/^Время отчёта: \d{4}-\d{2}-\d{2}T/)
		expect(report[1]).toBe(`Браузер: ${navigator.userAgent}`)
		expect(report[2]).toBe(`Страница: ${location.origin}${location.pathname}`)
		expect(report.slice(4, 13)).toContain('Формат: video/webm')
		expect(report.slice(-2)).toEqual(['', 'События:'])
		expect(result.statsEvents.value).toEqual([])
	})

	it('без данных о кадрах и буфере — прочерк и 0; без элемента — пусто', () => {
		const { state, media, result } = setup(video())
		state.currentTime = 10
		state.isMuted = true
		const values = Object.fromEntries(result.statsRows.value.map(row => [row.label, row.value]))
		expect([values['Кадры'], values['Загружено вперёд']]).toEqual(['—', '0 с'])

		media.value = null
		expect(result.statsRows.value).toEqual([])
	})

	it('открытая панель обновляется раз в секунду', async () => {
		vi.useFakeTimers()
		const element = video()
		const { result, wrapper } = setup(element)
		const before = result.statsRows.value

		result.toggleStats()
		await nextTick()
		vi.advanceTimersByTime(1000)
		expect(result.statsRows.value).not.toBe(before)
		result.toggleStats()
		await nextTick()
		wrapper.unmount()
		vi.useRealTimers()
	})

	it('строка «Озвучка» — только когда звучит отдельный аудиофайл', () => {
		const state = reactive({
			currentTime: 0,
			duration: 12,
			buffered: [],
			playbackRate: 1,
			volume: 1,
			isMuted: false,
		}) as unknown as MediaState
		const audio = ref<string | null>('https://cdn.example.com/dub.m4a')
		const { result } = withSetup(() =>
			useMediaStats({ media: ref(video()), state, source: () => undefined, audioSource: () => audio.value }),
		)

		expect(result.statsRows.value[1]).toEqual({ label: 'Озвучка', value: 'https://cdn.example.com/dub.m4a' })
		audio.value = null
		expect(result.statsRows.value.map(row => row.label)).not.toContain('Озвучка')
	})

	it('лог событий: в панели новые сверху, в отчёте — по порядку, без пустых подробностей', () => {
		const state = reactive({
			currentTime: 0,
			duration: 12,
			buffered: [],
			playbackRate: 1,
			volume: 1,
			isMuted: false,
		}) as unknown as MediaState
		const events = [
			{ id: 1, clock: '10:00:00.000', position: '0:00.0', type: 'loadstart', detail: 'demo.webm' },
			{ id: 2, clock: '10:00:01.000', position: '0:00.0', type: 'play', detail: '' },
		]
		const { result } = withSetup(() => useMediaStats({ media: ref(video()), state, source: () => undefined, events: () => events }))

		expect(result.statsEvents.value.map(entry => entry.id)).toEqual([2, 1])
		expect(result.statsReport().split('\n').slice(-3)).toEqual([
			'События:',
			'10:00:00.000 [0:00.0] loadstart demo.webm',
			'10:00:01.000 [0:00.0] play',
		])
	})
})
