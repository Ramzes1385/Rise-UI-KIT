import '@testing-library/jest-dom/vitest'
import type { PresentationWrapper } from '../utils/presentation.test-utils'
import { button, fakeAudio, mountPresentation, setVisibility, slidesOf } from '../utils/presentation.test-utils'

const NEXT = 'Следующий слайд'

const voiced = (count: number) => slidesOf(count).map((slide, index) => ({ ...slide, audio: `/voice-${index + 1}.webm` }))

const completedIds = (wrapper: PresentationWrapper): string[] =>
	wrapper.emitted('slide-complete')?.map(([value]) => (value as { id: string }).id) ?? []

describe('BasePresentationPlayer — авто-переход и клик по кадру', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		localStorage.clear()
	})
	afterEach(() => {
		setVisibility('visible')
		vi.useRealTimers()
	})

	it.each(['free', 'linear', 'strict'] as const)(
		'%s: после авто-перехода по duration следующий слайд ещё не пройден',
		async navigation => {
			const wrapper = await mountPresentation({ slides: slidesOf(3, { duration: 2 }), navigation })
			await button(wrapper, 'Воспроизвести').trigger('click')
			await vi.advanceTimersByTimeAsync(2100)
			expect(wrapper.emitted('update:slide')).toEqual([[1]])
			expect(completedIds(wrapper)).toEqual(['s1'])
			if (navigation !== 'free') {
				expect(button(wrapper, NEXT).attributes('aria-disabled')).toBe('true')
				await button(wrapper, NEXT).trigger('click')
				expect(wrapper.emitted('update:slide')).toEqual([[1]])
			}
			await vi.advanceTimersByTimeAsync(2000)
			expect(completedIds(wrapper)).toEqual(['s1', 's2'])
		},
	)

	it('linear: после авто-перехода по концу озвучки следующий слайд ещё не пройден', async () => {
		const wrapper = await mountPresentation({ slides: voiced(3), navigation: 'linear' })
		const audio = fakeAudio(wrapper, { duration: 2 })
		await button(wrapper, 'Воспроизвести').trigger('click')
		audio.update({ ended: true, paused: true, currentTime: 2 }, 'ended')
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		expect(completedIds(wrapper)).toEqual(['s1'])
		expect(button(wrapper, NEXT).attributes('aria-disabled')).toBe('true')
	})

	it('linear: общая дорожка — после перехода по времени следующий слайд ещё не пройден', async () => {
		const slides = slidesOf(3).map((slide, index) => ({ ...slide, at: index * 2 }))
		const wrapper = await mountPresentation({ slides, audio: '/track.webm', navigation: 'linear' })
		const audio = fakeAudio(wrapper, { duration: 6 })
		await button(wrapper, 'Воспроизвести').trigger('click')
		audio.update({ currentTime: 2.1 }, 'timeupdate')
		await vi.advanceTimersByTimeAsync(0)
		audio.update({ currentTime: 2.2 }, 'timeupdate')
		await vi.advanceTimersByTimeAsync(300)
		expect(completedIds(wrapper)).toEqual(['s1'])
		expect(button(wrapper, NEXT).attributes('aria-disabled')).toBe('true')
	})

	it('storageKey: переход, убравший плашку «Продолжить», сохраняет новое место', async () => {
		localStorage.setItem('rise-presentation:c', JSON.stringify({ index: 2, completed: [] }))
		const wrapper = await mountPresentation({ slides: slidesOf(4, { duration: 5 }), storageKey: 'c' })
		expect(wrapper.text()).toContain('Продолжить')
		await button(wrapper, NEXT).trigger('click')
		await vi.advanceTimersByTimeAsync(0)
		expect(JSON.parse(localStorage.getItem('rise-presentation:c') ?? 'null')).toMatchObject({ index: 1 })
	})

	it('клик по кадру запускает и ставит на паузу', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { duration: 5 }) })
		await wrapper.get('img').trigger('click')
		expect(wrapper.emitted('play')).toHaveLength(1)
		await wrapper.get('img').trigger('click')
		expect(wrapper.emitted('pause')).toHaveLength(1)
	})

	it('клик по интерактивному элементу в слоте slide не запускает показ', async () => {
		const wrapper = await mountPresentation(
			{ slides: slidesOf(2, { duration: 5 }) },
			{ slots: { slide: '<button type="button" class="in-slot">Ответ</button>' } },
		)
		await wrapper.get('.in-slot').trigger('click')
		expect(wrapper.emitted('play')).toBeUndefined()
	})
})
