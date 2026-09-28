import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseProgress from '../ui/BaseProgress.vue'

describe('BaseProgress integration', () => {
	describe('hasLabel (линейный)', () => {
		it('должен показывать подпись с процентом над полосой, внутри progressbar', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: true, shape: 'line' },
			})

			const status = container.querySelector('.base-progress__status') as HTMLElement
			expect(status).toHaveTextContent('50%')
			// Подпись идёт перед треком и ширина её области равна проценту — текст стоит у конца заливки
			expect(status.nextElementSibling).toHaveClass('base-progress__track')
			expect(status.style.width).toBe('50%')
			expect(screen.getByRole('progressbar')).toHaveTextContent('50%')
		})

		it('не должен телепортировать подпись в body (без BaseTooltip)', () => {
			render(BaseProgress, {
				props: { value: 50, hasLabel: true, shape: 'line' },
			})

			expect(document.body.querySelector('.base-tooltip-popup')).toBeNull()
		})

		it('не должен рендерить подпись когда hasLabel=false', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: false, shape: 'line' },
			})

			expect(container.querySelector('.base-progress__status')).not.toBeInTheDocument()
		})

		it('должен рендерить слот default в подписи линии', () => {
			render(BaseProgress, {
				props: { value: 3, max: 5, hasLabel: true, shape: 'line' },
				slots: { default: '<template #default="{ value }">Шаг {{ value }} из 5</template>' },
			})

			expect(screen.getByRole('progressbar')).toHaveTextContent('Шаг 3 из 5')
		})
	})

	describe('hasLabel (круговой)', () => {
		it('должен рендерить подпись с процентами когда hasLabel=true и shape=circle', () => {
			const { container } = render(BaseProgress, {
				props: { value: 75, hasLabel: true, shape: 'circle' },
			})

			const label = container.querySelector('.base-progress__circle-label')
			expect(label).toBeInTheDocument()
			expect(label?.textContent).toContain('75%')
		})

		it('не должен рендерить подпись когда hasLabel=false и shape=circle', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: false, shape: 'circle' },
			})

			expect(container.querySelector('.base-progress__circle-label')).not.toBeInTheDocument()
		})
	})

	describe('emit complete', () => {
		it('должен вызывать emit complete когда значение достигает максимума', async () => {
			const { emitted, rerender } = render(BaseProgress, {
				props: { value: 50 },
			})

			await rerender({ value: 100 })

			expect(emitted()).toHaveProperty('complete')
		})

		it('не должен вызывать emit complete когда значение меньше максимума', async () => {
			const { emitted } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(emitted()).not.toHaveProperty('complete')
		})

		it('не должен вызывать emit complete при isIndeterminate', async () => {
			const { emitted, rerender } = render(BaseProgress, {
				props: { value: 100, isIndeterminate: true },
			})

			await rerender({ value: 100, isIndeterminate: true })

			expect(emitted()).not.toHaveProperty('complete')
		})
	})

	describe('круговой прогресс с лейблом', () => {
		it('должен рендерить SVG и лейбл одновременно', () => {
			const { container } = render(BaseProgress, {
				props: { value: 60, hasLabel: true, shape: 'circle' },
			})

			expect(container.querySelector('.base-progress__svg')).toBeInTheDocument()
			expect(container.querySelector('.base-progress__circle-label')).toBeInTheDocument()
		})

		it('должен отображать корректный процент в лейбле', () => {
			const { container } = render(BaseProgress, {
				props: { value: 33, hasLabel: true, shape: 'circle' },
			})

			const label = container.querySelector('.base-progress__circle-label')
			expect(label?.textContent).toContain('33%')
		})
	})

	describe('линейный прогресс с лейблом', () => {
		it('должен рендерить fill с правильной шириной', () => {
			const { container } = render(BaseProgress, {
				props: { value: 40, hasLabel: true, shape: 'line' },
			})

			const fill = container.querySelector('.base-progress__fill')
			expect(fill?.getAttribute('style')).toContain('width: 40%')
		})
	})

	describe('слот default', () => {
		it('должен рендерить кастомный контент слота в круговом прогрессе', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: true, shape: 'circle' },
				slots: { default: '<span class="custom-label">Half</span>' },
			})

			expect(container.querySelector('.custom-label')).toBeInTheDocument()
		})
	})
})
