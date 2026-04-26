/**
 * Unit-тесты для BaseRange.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'

import BaseRange from './BaseRange.vue'

describe('BaseRange unit', () => {
	describe('рендер', () => {
		it('должен рендерить range-компонент', () => {
			const { container } = render(BaseRange)

			expect(container.querySelector('.base-range')).toBeInTheDocument()
		})

		it('должен рендерить трек', () => {
			const { container } = render(BaseRange)

			expect(container.querySelector('.base-range__track')).toBeInTheDocument()
		})

		it('должен рендерить ползунок', () => {
			const { container } = render(BaseRange)

			expect(container.querySelector('.base-range__thumb')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --primary по умолчанию', () => {
			const { container } = render(BaseRange)

			expect(container.querySelector('.base-range')?.classList.contains('base-range--primary')).toBe(true)
		})

		it('должен применять модификатор --accent когда variant=accent', () => {
			const { container } = render(BaseRange, {
				props: { variant: 'accent' },
			})

			expect(container.querySelector('.base-range')?.classList.contains('base-range--accent')).toBe(true)
		})
	})

	describe('пропс isDisabled', () => {
		it('должен применять модификатор --disabled когда isDisabled=true', () => {
			const { container } = render(BaseRange, {
				props: { isDisabled: true },
			})

			expect(container.querySelector('.base-range')?.classList.contains('base-range--disabled')).toBe(true)
		})
	})

	describe('пропс hasLabel', () => {
		it('должен рендерить метку когда hasLabel=true', () => {
			const { container } = render(BaseRange, {
				props: { hasLabel: true },
			})

			expect(container.querySelector('.base-range__label')).toBeInTheDocument()
		})

		it('не должен рендерить метку по умолчанию', () => {
			const { container } = render(BaseRange)

			expect(container.querySelector('.base-range__label')).not.toBeInTheDocument()
		})
	})

	describe('пропс hasTooltip', () => {
		it('должен рендерить тултип когда hasTooltip=true', () => {
			const { container } = render(BaseRange, {
				props: { hasTooltip: true },
			})

			expect(container.querySelector('.base-range__tooltip')).toBeInTheDocument()
		})
	})

	describe('пропс isVertical', () => {
		it('должен применять модификатор --vertical когда isVertical=true', () => {
			const { container } = render(BaseRange, {
				props: { isVertical: true },
			})

			expect(container.querySelector('.base-range')?.classList.contains('base-range--vertical')).toBe(true)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=1', () => {
			const { container } = render(BaseRange, {
				props: { sizeScale: 100 },
			})

			expect(container.querySelector('.base-range')?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseRange, {
				props: { sizeScale: 150 },
			})

			expect(container.querySelector('.base-range')?.getAttribute('style')).toContain('--size-scale: 1.5')
		})
	})
})
