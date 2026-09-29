import { nextTick, reactive, ref } from 'vue'
import { withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { useMediaEventLog } from '../../model/core/useMediaEventLog'
import type { MediaState } from '../../types/playback/MediaCore.types'
import type { BaseMediaPlayerEmits } from '../../types/BaseMediaPlayer.types'

function video(patch: Record<string, unknown> = {}): HTMLVideoElement {
	const element = document.createElement('video')
	Object.defineProperties(element, {
		currentSrc: { value: 'https://cdn.example.com/demo.webm' },
		videoWidth: { value: 480 },
		videoHeight: { value: 270 },
		duration: { value: 72 },
		...Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, { value }])),
	})
	return element
}

function setup(element: HTMLVideoElement | null = video()) {
	const state = reactive({ currentTime: 5.37 }) as unknown as MediaState
	const media = ref<HTMLMediaElement | null>(element)
	const { result, wrapper } = withSetup(() => useMediaEventLog({ media, state }))
	return { state, media, result, wrapper }
}

describe('лог событий плеера', () => {
	afterEach(() => vi.useRealTimers())

	it('события элемента: время на часах, позиция и подробности', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date(2026, 8, 29, 9, 5, 7, 42))
		const element = video({ error: { code: 4, message: 'Format error' } })
		const { result } = setup(element)

		for (const type of ['loadstart', 'loadedmetadata', 'resize', 'waiting', 'error', 'timeupdate'])
			element.dispatchEvent(new Event(type))
		expect(result.eventLog.value).toEqual([
			{ id: 1, clock: '09:05:07.042', position: '0:05.3', type: 'loadstart', detail: 'https://cdn.example.com/demo.webm' },
			{ id: 2, clock: '09:05:07.042', position: '0:05.3', type: 'loadedmetadata', detail: '480×270, 1:12' },
			{ id: 3, clock: '09:05:07.042', position: '0:05.3', type: 'resize', detail: '480×270' },
			{ id: 4, clock: '09:05:07.042', position: '0:05.3', type: 'waiting', detail: '' },
			{ id: 5, clock: '09:05:07.042', position: '0:05.3', type: 'error', detail: '4: Format error' },
		])
	})

	it('события плеера уходят дальше и пишутся в лог; позиция каждые 250 мс — нет; длинное и циклическое сокращается', () => {
		const { state, result } = setup()
		const emit = vi.fn()
		const logged = result.logEmits(emit as unknown as BaseMediaPlayerEmits) as unknown as (event: string, ...values: unknown[]) => void
		const loop: Record<string, unknown> = { id: 'a' }
		loop.self = loop

		state.currentTime = Number.NaN
		logged('update:currentTime', 12)
		logged('update:volume', 0.4)
		logged('banner', loop)
		logged('ad', { text: 'x'.repeat(300) })
		expect(emit.mock.calls.map(call => call[0])).toEqual(['update:currentTime', 'update:volume', 'banner', 'ad'])
		expect(result.eventLog.value.map(entry => [entry.type, entry.detail, entry.position])).toEqual([
			['update:volume', '0.4', '0:00'],
			['banner', '[object Object]', '0:00'],
			['ad', `${`{"text":"${'x'.repeat(300)}"}`.slice(0, 159)}…`, '0:00'],
		])
	})

	it('хранит последние 200 записей; при смене элемента и размонтировании снимает обработчики', async () => {
		const first = video()
		const { media, result, wrapper } = setup(first)

		for (let index = 0; index < 205; index++) first.dispatchEvent(new Event('seeked'))
		expect(result.eventLog.value).toHaveLength(200)
		expect(result.eventLog.value[0].id).toBe(6)

		const second = video()
		media.value = second
		await nextTick()
		first.dispatchEvent(new Event('playing'))
		second.dispatchEvent(new Event('playing'))
		expect(result.eventLog.value.at(-1)?.id).toBe(206)
		wrapper.unmount()
		second.dispatchEvent(new Event('stalled'))
		expect(result.eventLog.value.at(-1)?.type).toBe('playing')
	})

	it('без элемента лог пуст', () => {
		expect(setup(null).result.eventLog.value).toEqual([])
	})
})
