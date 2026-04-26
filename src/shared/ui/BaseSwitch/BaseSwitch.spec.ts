/**
 * Unit-тесты для BaseSwitch.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseSwitch from './BaseSwitch.vue'

describe('BaseSwitch unit', () => {
	describe('рендер', () => {
		it('должен рендерить переключатель', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			expect(container.querySelector('.base-switch')).toBeInTheDocument()
		})

		it('должен рендерить checkbox input', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
		})

		it('должен рендерить слайдер', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			expect(container.querySelector('.base-switch__slider')).toBeInTheDocument()
		})
	})

	describe('пропс label', () => {
		it('должен рендерить лейбл когда передан', () => {
			render(BaseSwitch, {
				props: { modelValue: false, label: 'Уведомления' },
			})

			expect(screen.getByText('Уведомления')).toBeInTheDocument()
		})

		it('не должен рендерить лейбл когда не передан', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			expect(container.querySelector('.base-switch__label')).not.toBeInTheDocument()
		})
	})

	describe('пропс modelValue', () => {
		it('должен отмечать input когда modelValue=true', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: true },
			})

			const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
			expect(input?.checked).toBe(true)
		})

		it('не должен отмечать input когда modelValue=false', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
			expect(input?.checked).toBe(false)
		})
	})

	describe('пропс isDisabled', () => {
		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, isDisabled: true },
			})

			expect(container.querySelector('.base-switch')?.classList.contains('base-switch--disabled')).toBe(true)
		})

		it('должен устанавливать disabled на input', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, isDisabled: true },
			})

			const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
			expect(input?.disabled).toBe(true)
		})

		it('не должен добавлять класс --disabled по умолчанию', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			expect(container.querySelector('.base-switch')?.classList.contains('base-switch--disabled')).toBe(false)
		})
	})
})
