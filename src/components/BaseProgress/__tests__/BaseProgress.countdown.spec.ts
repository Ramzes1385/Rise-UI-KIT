import '@testing-library/jest-dom/vitest'
import BaseProgress from '../ui/BaseProgress.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseProgress: обратный отсчёт', () => {
	it('countdown задаёт длительность через переменную и не выставляет aria-valuenow, подписи нет', () => {
		const { container } = render(BaseProgress, { props: { value: 100, countdown: 4000, hasLabel: true } })

		const bar = screen.getByRole('progressbar')
		expect(bar).toHaveClass('base-progress--countdown')
		expect(bar).not.toHaveAttribute('aria-valuenow')
		expect(bar).toHaveAttribute('aria-valuetext', 'Выполняется')
		expect(container.querySelector('.base-progress__fill')).toHaveAttribute('style', '--progress-countdown: 4000ms;')
		expect(container.querySelector('.base-progress__status')).toBeNull()
	})

	it('пауза добавляет класс, complete не срабатывает при value=max', async () => {
		const { rerender, emitted } = render(BaseProgress, { props: { value: 100, countdown: 1000 } })

		expect(emitted('complete')).toBeUndefined()
		expect(screen.getByRole('progressbar')).not.toHaveClass('base-progress--paused')
		await rerender({ isPaused: true })
		expect(screen.getByRole('progressbar')).toHaveClass('base-progress--paused')
	})

	it('у кольца и при нулевой длительности отсчёта нет', () => {
		const { rerender } = render(BaseProgress, { props: { value: 30, countdown: 1000, shape: 'circle' } })
		expect(screen.getByRole('progressbar')).not.toHaveClass('base-progress--countdown')
		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '30')

		return rerender({ shape: 'line', countdown: 0 }).then(() => {
			expect(screen.getByRole('progressbar')).not.toHaveClass('base-progress--countdown')
		})
	})
})
