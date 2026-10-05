import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales'
import BaseProgress from '../ui/BaseProgress.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseProgress доступность и complete', () => {
	describe('aria-valuetext (PRG-2)', () => {
		afterEach(() => {
			setLocale('ru')
		})

		it('должен описывать значение текстом из словаря', () => {
			render(BaseProgress, { props: { value: 50 } })

			expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Выполнено 50%')
		})

		it('должен брать текст из английского словаря', () => {
			setLocale('en')
			render(BaseProgress, { props: { value: 3, max: 4 } })

			expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '75% complete')
		})

		it('должен сообщать, что работа идёт, в неопределённом режиме', () => {
			render(BaseProgress, { props: { value: 0, isIndeterminate: true } })

			expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Выполняется')
		})
	})

	describe('complete только на максимуме (PRG-3)', () => {
		it('не должен эмитить complete и показывать 100%, пока значение меньше максимума', async () => {
			const { emitted, rerender } = render(BaseProgress, { props: { value: 10, hasLabel: true } })

			await rerender({ value: 99.6 })

			expect(emitted()).not.toHaveProperty('complete')
			expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '99')
			expect(await screen.findByText('99%')).toBeInTheDocument()
		})

		it('должен эмитить complete один раз при достижении максимума', async () => {
			const { emitted, rerender } = render(BaseProgress, { props: { value: 99.6 } })

			await rerender({ value: 100 })
			await rerender({ value: 120 })

			expect(emitted('complete')).toHaveLength(1)
		})

		it('должен эмитить complete снова после ухода с максимума и возврата', async () => {
			const { emitted, rerender } = render(BaseProgress, { props: { value: 5, max: 5 } })

			await rerender({ value: 4 })
			await rerender({ value: 5 })

			expect(emitted('complete')).toHaveLength(2)
		})

		it('должен эмитить complete один раз при монтировании на максимуме', async () => {
			const { emitted, rerender } = render(BaseProgress, { props: { value: 10, max: 10 } })

			await rerender({ value: 10, max: 10, hasLabel: true })

			expect(emitted('complete')).toHaveLength(1)
		})

		it('не должен эмитить complete при монтировании на максимуме в неопределённом режиме', () => {
			const { emitted } = render(BaseProgress, { props: { value: 100, isIndeterminate: true } })

			expect(emitted()).not.toHaveProperty('complete')
		})
	})

	describe('геометрия кольца (CNS-1)', () => {
		it('должен рассчитывать радиус от размера viewBox и толщины линии', () => {
			const { container } = render(BaseProgress, { props: { value: 50, shape: 'circle' } })
			const circle = container.querySelector('.base-progress__fill-circle')

			expect(container.querySelector('.base-progress__svg')).toHaveAttribute('viewBox', '0 0 120 120')
			expect(circle).toHaveAttribute('r', '52')
			expect(circle).toHaveAttribute('cx', '60')
			expect(circle).toHaveAttribute('stroke-width', '8')
		})
	})
})
