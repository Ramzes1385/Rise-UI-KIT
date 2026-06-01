/**
 * Unit-тесты для BaseForm.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseForm from './BaseForm.vue'

describe('BaseForm unit', () => {
	describe('рендер', () => {
		it('должен рендерить форму', () => {
			const { container } = render(BaseForm)

			expect(container.querySelector('.base-form')).toBeInTheDocument()
		})

		it('должен рендерить тег form', () => {
			const { container } = render(BaseForm)

			expect(container.querySelector('form')).toBeInTheDocument()
		})

		it('должен рендерить контент слота', () => {
			render(BaseForm, { slots: { default: '<input type="text" />' } })

			expect(screen.getByRole('textbox')).toBeInTheDocument()
		})
	})

	describe('пропс isLoading', () => {
		it('должен добавлять класс --loading когда isLoading=true', () => {
			const { container } = render(BaseForm, { props: { isLoading: true } })

			expect(container.querySelector('.base-form')?.classList.contains('base-form--loading')).toBe(true)
		})

		it('не должен добавлять класс --loading по умолчанию', () => {
			const { container } = render(BaseForm)

			expect(container.querySelector('.base-form')?.classList.contains('base-form--loading')).toBe(false)
		})
	})

	describe('пропс isDisabled', () => {
		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BaseForm, { props: { isDisabled: true } })

			expect(container.querySelector('.base-form')?.classList.contains('base-form--disabled')).toBe(true)
		})

		it('не должен добавлять класс --disabled по умолчанию', () => {
			const { container } = render(BaseForm)

			expect(container.querySelector('.base-form')?.classList.contains('base-form--disabled')).toBe(false)
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseForm, {
				props: {
					customClass: 'custom-form-class',
				},
			})

			expect(container.querySelector('.base-form')?.classList.contains('custom-form-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseForm, {
				props: {
					customClass: {
						root: 'custom-form-root',
						overlay: 'custom-form-overlay',
						content: 'custom-form-content',
					},
					isLoading: true,
				},
			})

			expect(container.querySelector('.base-form')?.classList.contains('custom-form-root')).toBe(true)
			expect(container.querySelector('.base-form__overlay')?.classList.contains('custom-form-overlay')).toBe(true)
			expect(container.querySelector('.base-form__content')?.classList.contains('custom-form-content')).toBe(true)
		})
	})
})
