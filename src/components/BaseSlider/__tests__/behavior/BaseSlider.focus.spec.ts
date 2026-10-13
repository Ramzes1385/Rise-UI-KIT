import '@testing-library/jest-dom/vitest'
import BaseSlider from '../../ui/BaseSlider.vue'
import userEvent from '@testing-library/user-event'
import type { SliderItem } from '../../types/BaseSlider.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const ITEMS: SliderItem[] = [1, 2, 3].map(n => ({ src: `slide${n}.jpg`, alt: `Слайд ${n}` }))

describe('BaseSlider: стрелки на пределе', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('«Следующий» на последнем слайде остаётся в фокусе, aria-disabled, лишнее нажатие не листает', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseSlider, { props: { items: ITEMS, isLoop: false } })
		const next = screen.getByRole('button', { name: 'Следующий слайд' })

		next.focus()
		await user.keyboard('{Enter}')
		await user.keyboard('{Enter}')

		expect(emitted().change).toEqual([[1], [2]])
		expect(next).toHaveAttribute('aria-disabled', 'true')
		expect(next).not.toHaveAttribute('disabled')
		expect(document.activeElement).toBe(next)

		await user.keyboard('{Enter}')
		expect(emitted().change).toHaveLength(2)
	})

	it('удержание стрелки на пределе не запускает повтор', async () => {
		vi.useFakeTimers()
		const { emitted } = render(BaseSlider, { props: { items: ITEMS, isLoop: false } })
		const prev = screen.getByRole('button', { name: 'Предыдущий слайд' })

		await fireEvent.pointerDown(prev)
		await vi.advanceTimersByTimeAsync(1000)
		await fireEvent.pointerUp(prev)

		expect(emitted().change).toBeUndefined()
		expect(emitted().prev).toBeUndefined()
	})

	it('удержание «Следующего» доходит до последнего слайда и останавливается', async () => {
		vi.useFakeTimers()
		const { emitted } = render(BaseSlider, { props: { items: ITEMS, isLoop: false } })
		const next = screen.getByRole('button', { name: 'Следующий слайд' })

		await fireEvent.pointerDown(next)
		await vi.advanceTimersByTimeAsync(400 + 5 * 150)
		await fireEvent.pointerUp(next)
		await fireEvent.pointerDown(next)
		await vi.advanceTimersByTimeAsync(1000)

		expect(emitted().change).toEqual([[1], [2]])
	})

	it('с isLoop стрелки не отключаются, удержание на первом слайде листает по кругу', async () => {
		vi.useFakeTimers()
		const { emitted } = render(BaseSlider, { props: { items: ITEMS, isLoop: true } })
		const prev = screen.getByRole('button', { name: 'Предыдущий слайд' })

		expect(prev).not.toHaveAttribute('aria-disabled')
		await fireEvent.pointerDown(prev)
		await vi.advanceTimersByTimeAsync(400 + 150)

		expect(emitted().change).toEqual([[2]])
	})
})
