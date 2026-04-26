/**
 * Unit-тесты для BaseCheckbox.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseCheckbox from './BaseCheckbox.vue'

describe('BaseCheckbox unit', () => {
	describe('рендер', () => {
		it('должен рендерить чекбокс', () => {
			const { container } = render(BaseCheckbox, { props: { modelValue: false } })

			expect(container.querySelector('.base-checkbox')).toBeInTheDocument()
		})

		it('должен рендерить input[type=checkbox]', () => {
			render(BaseCheckbox, { props: { modelValue: false } })

			expect(screen.getByRole('checkbox')).toBeInTheDocument()
		})
	})

	describe('пропс label', () => {
		it('должен отображать label когда передан', () => {
			render(BaseCheckbox, { props: { modelValue: false, label: 'Согласен' } })

			expect(screen.getByText('Согласен')).toBeInTheDocument()
		})

		it('не должен отображать label когда не передан', () => {
			const { container } = render(BaseCheckbox, { props: { modelValue: false } })

			expect(container.querySelector('.base-checkbox__label')).not.toBeInTheDocument()
		})
	})

	describe('пропс isDisabled', () => {
		it('должен быть disabled когда isDisabled=true', () => {
			render(BaseCheckbox, { props: { modelValue: false, isDisabled: true } })

			expect(screen.getByRole('checkbox')).toBeDisabled()
		})

		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BaseCheckbox, {
				props: { modelValue: false, isDisabled: true },
			})

			expect(container.firstElementChild?.classList.contains('base-checkbox--disabled')).toBe(true)
		})

		it('не должен быть disabled по умолчанию', () => {
			render(BaseCheckbox, { props: { modelValue: false } })

			expect(screen.getByRole('checkbox')).not.toBeDisabled()
		})
	})

	describe('пропс hasError', () => {
		it('должен добавлять класс --error когда hasError=true', () => {
			const { container } = render(BaseCheckbox, {
				props: { modelValue: false, hasError: true },
			})

			expect(container.firstElementChild?.classList.contains('base-checkbox--error')).toBe(true)
		})

		it('не должен добавлять класс --error по умолчанию', () => {
			const { container } = render(BaseCheckbox, { props: { modelValue: false } })

			expect(container.firstElementChild?.classList.contains('base-checkbox--error')).toBe(false)
		})
	})

	describe('пропс modelValue', () => {
		it('должен отображать галочку когда modelValue=true', () => {
			const { container } = render(BaseCheckbox, { props: { modelValue: true } })

			expect(container.querySelector('.base-checkbox__icon')).toBeInTheDocument()
		})

		it('не должен отображать галочку когда modelValue=false', () => {
			const { container } = render(BaseCheckbox, { props: { modelValue: false } })

			expect(container.querySelector('.base-checkbox__icon')).not.toBeInTheDocument()
		})

		it('должен устанавливать checked атрибут когда modelValue=true', () => {
			render(BaseCheckbox, { props: { modelValue: true } })

			expect(screen.getByRole('checkbox')).toBeChecked()
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=1', () => {
			const { container } = render(BaseCheckbox, {
				props: { modelValue: false, sizeScale: 100 },
			})

			expect(container.firstElementChild?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseCheckbox, {
				props: { modelValue: false, sizeScale: 150 },
			})

			expect(container.firstElementChild?.getAttribute('style')).toContain('--size-scale: 1.5')
		})

		it('должен устанавливать --size-scale когда sizeScale=0.75', () => {
			const { container } = render(BaseCheckbox, {
				props: { modelValue: false, sizeScale: 75 },
			})

			expect(container.firstElementChild?.getAttribute('style')).toContain('--size-scale: 0.75')
		})
	})
})
