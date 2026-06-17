/**
 * Integration-тесты для BaseProgress.
 * Проверяют взаимодействие с BaseTooltip, BaseText и emit complete.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import BaseProgress from '../ui/BaseProgress.vue'

describe('BaseProgress integration', () => {
	describe('hasLabel + BaseTooltip (линейный)', () => {
		it('должен рендерить BaseTooltip внутри fill когда hasLabel=true и shape=line', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: true, shape: 'line' },
			})

			const trigger = container.querySelector('.base-progress__tooltip-trigger')
			expect(trigger).toBeInTheDocument()
			expect(trigger?.closest('.base-progress__fill')).toBeInTheDocument()
		})

		it('не должен рендерить BaseTooltip когда hasLabel=false', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: false, shape: 'line' },
			})

			expect(container.querySelector('.base-progress__tooltip-trigger')).not.toBeInTheDocument()
		})
	})

	describe('hasLabel + BaseText (круговой)', () => {
		it('должен рендерить BaseText с процентами когда hasLabel=true и shape=circle', () => {
			const { container } = render(BaseProgress, {
				props: { value: 75, hasLabel: true, shape: 'circle' },
			})

			const label = container.querySelector('.base-progress__circle-label')
			expect(label).toBeInTheDocument()
			expect(label?.textContent).toContain('75%')
		})

		it('не должен рендерить BaseText когда hasLabel=false и shape=circle', () => {
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
