import '@testing-library/jest-dom/vitest'
import { button, mountPresentation, setVisibility, slidesOf, statusText } from '../utils/presentation.test-utils'

const NEXT = 'Следующий слайд'

function linear(extra = {}) {
	return mountPresentation({ slides: slidesOf(3, { duration: 2, minDuration: 5 }), navigation: 'linear', ...extra })
}

describe('BasePresentationPlayer — режим linear и minDuration', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => {
		setVisibility('visible')
		vi.useRealTimers()
	})

	it('«Следующий слайд» закрыта до minDuration, затем показ сам переходит дальше', async () => {
		const wrapper = await linear()
		await button(wrapper, 'Воспроизвести').trigger('click')
		const next = button(wrapper, NEXT)
		expect(next.attributes('aria-disabled')).toBe('true')
		await vi.advanceTimersByTimeAsync(2500)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		expect(next.attributes('aria-disabled')).toBe('true')
		await vi.advanceTimersByTimeAsync(2600)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		expect(statusText(wrapper)).toBe('Слайд 2 из 3: Слайд-2')
	})

	it('закрытая кнопка описана текстом «Доступно через N с», кольцо скрыто от скринридера', async () => {
		const wrapper = await linear()
		await button(wrapper, 'Воспроизвести').trigger('click')
		await vi.advanceTimersByTimeAsync(1000)
		const next = button(wrapper, NEXT)
		const hint = wrapper.get(`#${next.attributes('aria-describedby')}`)
		expect(hint.text()).toBe('Доступно через 4 с')
		expect(next.attributes('data-tooltip')).toBe('Доступно через 4 с')
		expect(wrapper.get('.base-presentation-player__ring').attributes('aria-hidden')).toBe('true')
		expect(wrapper.get('.base-presentation-player__next').attributes('style')).toContain('--presentation-lock: 20')
	})

	it('нажатие на закрытую кнопку не меняет слайд и на 4 с пишет причину в role="status"', async () => {
		const wrapper = await linear()
		await vi.advanceTimersByTimeAsync(0)
		await button(wrapper, NEXT).trigger('click')
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		expect(statusText(wrapper)).toBe('Доступно через 5 с')
		await vi.advanceTimersByTimeAsync(4000)
		expect(statusText(wrapper)).toBe('Слайд 1 из 3: Слайд-1')
	})

	it('клавиши →, End, цифры, Shift+N и шкала не пускают дальше первого непройденного слайда', async () => {
		const wrapper = await linear()
		const root = wrapper.get('[role="region"]')
		const keys = [
			{ code: 'ArrowRight' },
			{ code: 'End' },
			{ code: 'Digit9' },
			{ code: 'KeyN', shiftKey: true },
			{ code: 'PageUp' },
			{ code: 'KeyL' },
		]
		for (const init of keys) {
			await root.trigger('keydown', init)
		}
		const slider = wrapper.get('[role="slider"][aria-label="Слайды"]')
		await slider.trigger('keydown', { key: 'ArrowRight', code: 'ArrowRight' })
		await slider.trigger('keydown', { key: 'End', code: 'End' })
		;(wrapper.vm as unknown as { goTo: (index: number) => void }).goTo(2)
		;(wrapper.vm as unknown as { next: () => void }).next()
		expect(wrapper.emitted('update:slide')).toBeUndefined()
	})

	it('назад — свободно, к пройденному слайду — тоже', async () => {
		const wrapper = await linear({ slides: slidesOf(3, { duration: 1 }) })
		await button(wrapper, 'Воспроизвести').trigger('click')
		await vi.advanceTimersByTimeAsync(1100)
		expect(wrapper.emitted('update:slide')).toEqual([[1]])
		await button(wrapper, 'Предыдущий слайд').trigger('click')
		await button(wrapper, NEXT).trigger('click')
		expect(wrapper.emitted('update:slide')).toEqual([[1], [0], [1]])
	})

	it('время показа не идёт, пока вкладка скрыта; в linear показ продолжается', async () => {
		const wrapper = await linear({ slides: slidesOf(2, { minDuration: 3 }) })
		await button(wrapper, 'Воспроизвести').trigger('click')
		await vi.advanceTimersByTimeAsync(1000)
		setVisibility('hidden')
		await vi.advanceTimersByTimeAsync(10_000)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		expect(wrapper.emitted('pause')).toBeUndefined()
		setVisibility('visible')
		await vi.advanceTimersByTimeAsync(2100)
		expect(wrapper.emitted('slide-complete')?.[0]?.[0]).toMatchObject({ id: 's1', index: 0 })
	})

	it('на паузе время показа не идёт', async () => {
		const wrapper = await linear({ slides: slidesOf(2, { minDuration: 3 }) })
		await vi.advanceTimersByTimeAsync(10_000)
		expect(wrapper.emitted('slide-complete')).toBeUndefined()
	})
})
