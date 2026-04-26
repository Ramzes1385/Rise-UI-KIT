/**
 * Unit-тесты для BaseProgress.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'

import BaseProgress from './BaseProgress.vue'

describe('BaseProgress unit', () => {
	describe('рендер', () => {
		it('должен рендерить прогресс-бар', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(container.querySelector('.base-progress')).toBeInTheDocument()
		})

		it('должен устанавливать role=progressbar', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('role')).toBe('progressbar')
		})

		it('должен устанавливать aria-valuenow', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('aria-valuenow')).toBe('50')
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --primary по умолчанию', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(container.querySelector('.base-progress')?.classList.contains('base-progress--primary')).toBe(true)
		})

		it('должен применять модификатор --success когда variant=success', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, variant: 'success' },
			})

			expect(container.querySelector('.base-progress')?.classList.contains('base-progress--success')).toBe(true)
		})
	})

	describe('пропс shape', () => {
		it('должен рендерить линейный прогресс по умолчанию', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(container.querySelector('.base-progress__track')).toBeInTheDocument()
		})

		it('должен рендерить круговой прогресс когда shape=circle', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, shape: 'circle' },
			})

			expect(container.querySelector('.base-progress__svg')).toBeInTheDocument()
		})
	})

	describe('пропс hasLabel', () => {
		it('должен рендерить метку когда hasLabel=true и shape=line', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: true },
			})

			expect(container.querySelector('.base-progress__tooltip')).toBeInTheDocument()
		})

		it('должен рендерить метку когда hasLabel=true и shape=circle', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: true, shape: 'circle' },
			})

			expect(container.querySelector('.base-progress__circle-label')).toBeInTheDocument()
		})
	})

	describe('пропс isIndeterminate', () => {
		it('должен применять модификатор --indeterminate когда isIndeterminate=true', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, isIndeterminate: true },
			})

			expect(container.querySelector('.base-progress')?.classList.contains('base-progress--indeterminate')).toBe(true)
		})
	})

	describe('пропс animation', () => {
		it('должен применять модификатор --striped когда animation=striped', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, animation: 'striped' },
			})

			expect(container.querySelector('.base-progress')?.classList.contains('base-progress--striped')).toBe(true)
		})

		it('должен применять модификатор --pulse когда animation=pulse', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, animation: 'pulse' },
			})

			expect(container.querySelector('.base-progress')?.classList.contains('base-progress--pulse')).toBe(true)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=1', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, sizeScale: 100 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, sizeScale: 150 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('style')).toContain('--size-scale: 1.5')
		})
	})
})
