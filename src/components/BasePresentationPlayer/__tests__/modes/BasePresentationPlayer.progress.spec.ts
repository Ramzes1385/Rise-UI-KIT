import '@testing-library/jest-dom/vitest'
import { button, mountPresentation, setVisibility, slidesOf, statusText } from '../utils/presentation.test-utils'

describe('BasePresentationPlayer — прохождение и события', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-10-02T09:00:00Z'))
	})
	afterEach(() => {
		setVisibility('visible')
		vi.useRealTimers()
	})

	it('slide-complete, progress и complete — по одному разу на слайд и в нужном порядке', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { duration: 1, minDuration: 2 }), navigation: 'linear' })
		await button(wrapper, 'Воспроизвести').trigger('click')
		await vi.advanceTimersByTimeAsync(2100)
		expect(wrapper.emitted('progress')).toEqual([[{ completed: 1, total: 2 }]])
		await vi.advanceTimersByTimeAsync(2100)
		const start = new Date('2026-10-02T09:00:00Z').getTime()
		const completed = wrapper.emitted<[{ id: string; index: number; at: number }]>('slide-complete')?.map(([value]) => value)
		expect(completed?.map(({ id, index }) => ({ id, index }))).toEqual([
			{ id: 's1', index: 0 },
			{ id: 's2', index: 1 },
		])
		expect(completed?.[0].at).toBeGreaterThanOrEqual(start + 2000)
		expect(completed?.[1].at).toBeGreaterThanOrEqual(start + 4000)
		expect(completed?.[1].at).toBeLessThanOrEqual(start + 4200)
		expect(wrapper.emitted('progress')).toEqual([[{ completed: 1, total: 2 }], [{ completed: 2, total: 2 }]])
		expect(wrapper.emitted('complete')).toHaveLength(1)
		expect(wrapper.emitted('pause')).toHaveLength(1)
		await button(wrapper, 'Смотреть сначала').trigger('click')
		await vi.advanceTimersByTimeAsync(4400)
		expect(wrapper.emitted('slide-complete')).toHaveLength(2)
		expect(wrapper.emitted('complete')).toHaveLength(1)
	})

	it('после последнего слайда — экран «Пройдено» с числом слайдов и кнопкой «Смотреть сначала»', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { duration: 1 }) })
		await button(wrapper, 'Воспроизвести').trigger('click')
		await vi.advanceTimersByTimeAsync(2200)
		const done = wrapper.get('.base-presentation-player__done')
		expect(done.text()).toContain('Пройдено')
		expect(done.text()).toContain('Пройдено слайдов: 2 из 2')
		expect(wrapper.find('button[aria-label="Смотреть сначала"]').exists()).toBe(true)
		await done.get('button').trigger('click')
		expect(wrapper.emitted('update:slide')).toEqual([[1], [0]])
		expect(wrapper.find('.base-presentation-player__done').exists()).toBe(false)
		expect(wrapper.find('button[aria-label="Пауза"]').exists()).toBe(true)
	})

	it('free: пропущенный кнопкой слайд не пройден, экран — «Показ окончен»', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2, { duration: 1 }) })
		await button(wrapper, 'Следующий слайд').trigger('click')
		await button(wrapper, 'Воспроизвести').trigger('click')
		await vi.advanceTimersByTimeAsync(1100)
		expect(wrapper.emitted('slide-complete')).toEqual([[expect.objectContaining({ id: 's2', index: 1 })]])
		expect(wrapper.get('.base-presentation-player__done').text()).toContain('Показ окончен')
		expect(wrapper.get('.base-presentation-player__done').text()).toContain('Пройдено слайдов: 1 из 2')
		expect(wrapper.emitted('complete')).toBeUndefined()
	})

	it('слайд без озвучки и duration пройден сразу, если нет minDuration', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(2), navigation: 'linear' })
		await vi.advanceTimersByTimeAsync(0)
		expect(wrapper.emitted('slide-complete')).toHaveLength(1)
		expect(button(wrapper, 'Следующий слайд').attributes('aria-disabled')).toBeUndefined()
	})

	it('role="status" объявляет слайд только после монтирования', async () => {
		const wrapper = await mountPresentation({ slides: slidesOf(3) })
		await vi.advanceTimersByTimeAsync(0)
		expect(statusText(wrapper)).toBe('Слайд 1 из 3: Слайд-1')
		expect(wrapper.findAll('[role="status"]').at(-1)?.classes()).toContain('base-media-player__visually-hidden')
	})
})
