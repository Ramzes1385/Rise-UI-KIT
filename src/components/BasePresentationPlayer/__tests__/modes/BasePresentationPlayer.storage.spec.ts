import '@testing-library/jest-dom/vitest'
import { button, mountPresentation, slidesOf } from '../utils/presentation.test-utils'

const KEY = 'rise-presentation:course'

const saved = () => JSON.parse(localStorage.getItem(KEY) ?? 'null') as unknown

describe('BasePresentationPlayer — storageKey', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => {
		localStorage.clear()
		vi.useRealTimers()
	})

	it('сохраняет место и пройденные слайды, после конца — начало', async () => {
		const wrapper = await mountPresentation({
			slides: slidesOf(2, { duration: 1, minDuration: 2 }),
			navigation: 'linear',
			storageKey: 'course',
		})
		await button(wrapper, 'Воспроизвести').trigger('click')
		await vi.advanceTimersByTimeAsync(2100)
		expect(saved()).toEqual({ index: 1, completed: ['s1'] })
		await vi.advanceTimersByTimeAsync(2100)
		expect(saved()).toEqual({ index: 0, completed: ['s1', 's2'] })
	})

	it('восстанавливает пройденные без событий и предлагает продолжить; «Продолжить» переходит к слайду', async () => {
		localStorage.setItem(KEY, JSON.stringify({ index: 2, completed: ['s1', 's2', 'unknown', 7] }))
		const wrapper = await mountPresentation({ slides: slidesOf(4, { duration: 5 }), navigation: 'linear', storageKey: 'course' })
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.text()).toContain('Продолжить со слайда 3?')
		expect(wrapper.find('.base-media-player__start').exists()).toBe(false)
		expect(wrapper.emitted('slide-complete')).toBeUndefined()
		await wrapper.get('.base-media-player__resume').findAll('button')[0].trigger('click')
		expect(wrapper.emitted('update:slide')).toEqual([[2]])
		expect(wrapper.find('.base-media-player__resume').exists()).toBe(false)
		expect(button(wrapper, 'Следующий слайд').attributes('aria-disabled')).toBe('true')
		expect(saved()).toEqual({ index: 2, completed: ['s1', 's2'] })
	})

	it('«Сначала» убирает плашку и оставляет первый слайд', async () => {
		localStorage.setItem(KEY, JSON.stringify({ index: 1, completed: [] }))
		const wrapper = await mountPresentation({ slides: slidesOf(3, { duration: 5 }), storageKey: 'course' })
		await vi.advanceTimersByTimeAsync(0)
		await wrapper.get('.base-media-player__resume').findAll('button')[1].trigger('click')
		expect(wrapper.find('.base-media-player__resume').exists()).toBe(false)
		expect(wrapper.emitted('update:slide')).toBeUndefined()
		expect(wrapper.find('.base-media-player__start').exists()).toBe(true)
	})

	it('переход к другому слайду убирает плашку', async () => {
		localStorage.setItem(KEY, JSON.stringify({ index: 2, completed: [] }))
		const wrapper = await mountPresentation({ slides: slidesOf(3, { duration: 5 }), storageKey: 'course' })
		await vi.advanceTimersByTimeAsync(0)
		await button(wrapper, 'Следующий слайд').trigger('click')
		expect(wrapper.find('.base-media-player__resume').exists()).toBe(false)
		await button(wrapper, 'Следующий слайд').trigger('click')
		expect(saved()).toEqual({ index: 2, completed: [] })
		await button(wrapper, 'Предыдущий слайд').trigger('click')
		expect(saved()).toEqual({ index: 1, completed: [] })
	})

	it('битый JSON, чужой формат и номер вне списка — без плашки', async () => {
		for (const value of ['{oops', JSON.stringify({ index: 'x', completed: [] }), JSON.stringify({ index: 9, completed: [] }), 'null']) {
			localStorage.setItem(KEY, value)
			const wrapper = await mountPresentation({ slides: slidesOf(3), storageKey: 'course' })
			await vi.advanceTimersByTimeAsync(0)
			expect(wrapper.find('.base-media-player__resume').exists()).toBe(false)
			wrapper.unmount()
		}
	})

	it('без storageKey ничего не пишет, ошибки localStorage не ломают показ', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2) })
		await button(wrapper, 'Следующий слайд').trigger('click')
		expect(localStorage.length).toBe(0)
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('QuotaExceededError')
		})
		const stored = await mountPresentation({ slides: slidesOf(2), storageKey: 'course' })
		await button(stored, 'Следующий слайд').trigger('click')
		expect(stored.emitted('update:slide')).toEqual([[1]])
	})
})
