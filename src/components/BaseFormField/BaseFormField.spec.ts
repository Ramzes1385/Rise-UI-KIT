/**
 * Unit-тесты для BaseFormField.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseFormField from './BaseFormField.vue'

describe('BaseFormField unit', () => {
	describe('рендер', () => {
		it('должен рендерить обёртку поля', () => {
			const { container } = render(BaseFormField)

			expect(container.querySelector('.base-form-field')).toBeInTheDocument()
		})

		it('должен рендерить контент слота', () => {
			render(BaseFormField, { slots: { default: '<input type="text" />' } })

			expect(screen.getByRole('textbox')).toBeInTheDocument()
		})
	})

	describe('пропс label', () => {
		it('должен рендерить заголовок когда передан', () => {
			render(BaseFormField, { props: { label: 'Имя', for: 'name-input' } })

			expect(screen.getByText('Имя')).toBeInTheDocument()
		})

		it('не должен рендерить заголовок когда не передан', () => {
			const { container } = render(BaseFormField)

			expect(container.querySelector('.base-form-field__label')).not.toBeInTheDocument()
		})

		it('должен связывать label с input через for', () => {
			render(BaseFormField, { props: { label: 'Имя', for: 'name-input' } })

			const label = screen.getByText('Имя')
			expect(label.getAttribute('for')).toBe('name-input')
		})
	})

	describe('пропс isRequired', () => {
		it('должен рендерить звёздочку когда isRequired=true', () => {
			render(BaseFormField, { props: { label: 'Имя', isRequired: true } })

			expect(screen.getByText('*')).toBeInTheDocument()
		})

		it('не должен рендерить звёздочку по умолчанию', () => {
			const { container } = render(BaseFormField, { props: { label: 'Имя' } })

			expect(container.querySelector('.base-form-field__required')).not.toBeInTheDocument()
		})
	})

	describe('пропс description', () => {
		it('должен рендерить описание когда передано', () => {
			render(BaseFormField, { props: { description: 'Подсказка' } })

			expect(screen.getByText('Подсказка')).toBeInTheDocument()
		})

		it('не должен рендерить описание когда есть ошибка', () => {
			render(BaseFormField, { props: { description: 'Подсказка', error: 'Ошибка' } })

			expect(screen.queryByText('Подсказка')).not.toBeInTheDocument()
		})
	})

	describe('пропс error', () => {
		it('должен рендерить ошибку когда передана', () => {
			render(BaseFormField, { props: { error: 'Обязательное поле' } })

			expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
		})

		it('должен добавлять класс --error когда есть ошибка', () => {
			const { container } = render(BaseFormField, { props: { error: 'Ошибка' } })

			expect(container.querySelector('.base-form-field')?.classList.contains('base-form-field--error')).toBe(true)
		})

		it('не должен добавлять класс --error когда нет ошибки', () => {
			const { container } = render(BaseFormField)

			expect(container.querySelector('.base-form-field')?.classList.contains('base-form-field--error')).toBe(false)
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseFormField, {
				props: {
					customClass: 'custom-field-class',
				},
			})

			expect(container.querySelector('.base-form-field')?.classList.contains('custom-field-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseFormField, {
				props: {
					customClass: {
						root: 'custom-field-root',
						header: 'custom-field-header',
						label: 'custom-field-label',
						required: 'custom-field-required',
						content: 'custom-field-content',
						description: 'custom-field-description',
						animation: 'custom-field-animation',
						error: 'custom-field-error',
					},
					label: 'Имя',
					isRequired: true,
					description: 'Подсказка',
					error: 'Ошибка',
				},
			})

			expect(container.querySelector('.base-form-field')?.classList.contains('custom-field-root')).toBe(true)
			expect(container.querySelector('.base-form-field__header')?.classList.contains('custom-field-header')).toBe(true)
			expect(container.querySelector('.base-form-field__label')?.classList.contains('custom-field-label')).toBe(true)
			expect(container.querySelector('.base-form-field__required')?.classList.contains('custom-field-required')).toBe(
				true,
			)
			expect(container.querySelector('.base-form-field__content')?.classList.contains('custom-field-content')).toBe(
				true,
			)
			expect(container.querySelector('.custom-field-animation')).toBeInTheDocument()
			expect(container.querySelector('.base-form-field__error')?.classList.contains('custom-field-error')).toBe(true)
		})
	})
})
