/**
 * Unit-тесты для BaseTextarea.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseTextarea from './BaseTextarea.vue'

describe('BaseTextarea unit', () => {
	describe('рендер', () => {
		it('должен рендерить текстовую область', () => {
			render(BaseTextarea, { props: { modelValue: '' } })

			expect(screen.getByRole('textbox')).toBeInTheDocument()
		})

		it('должен отображать placeholder', () => {
			render(BaseTextarea, { props: { modelValue: '', placeholder: 'Введите текст' } })

			expect(screen.getByPlaceholderText('Введите текст')).toBeInTheDocument()
		})

		it('должен отображать значение modelValue', () => {
			render(BaseTextarea, { props: { modelValue: 'Текст' } })

			expect(screen.getByDisplayValue('Текст')).toBeInTheDocument()
		})
	})

	describe('пропс rows', () => {
		it('должен устанавливать rows=4 по умолчанию', () => {
			render(BaseTextarea, { props: { modelValue: '' } })

			expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4')
		})

		it('должен устанавливать переданное количество строк', () => {
			render(BaseTextarea, { props: { modelValue: '', rows: 8 } })

			expect(screen.getByRole('textbox')).toHaveAttribute('rows', '8')
		})
	})

	describe('пропс isDisabled', () => {
		it('должен быть disabled когда isDisabled=true', () => {
			render(BaseTextarea, { props: { modelValue: '', isDisabled: true } })

			expect(screen.getByRole('textbox')).toBeDisabled()
		})

		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', isDisabled: true },
			})

			expect(container.firstElementChild?.classList.contains('base-textarea--disabled')).toBe(true)
		})

		it('не должен быть disabled по умолчанию', () => {
			render(BaseTextarea, { props: { modelValue: '' } })

			expect(screen.getByRole('textbox')).not.toBeDisabled()
		})
	})

	describe('пропс error', () => {
		it('должен добавлять класс --error когда error передан', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', error: 'Обязательное поле' },
			})

			expect(container.firstElementChild?.classList.contains('base-textarea--error')).toBe(true)
		})

		it('должен отображать текст ошибки', () => {
			render(BaseTextarea, {
				props: { modelValue: '', error: 'Обязательное поле' },
			})

			expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
		})

		it('не должен добавлять класс --error по умолчанию', () => {
			const { container } = render(BaseTextarea, { props: { modelValue: '' } })

			expect(container.firstElementChild?.classList.contains('base-textarea--error')).toBe(false)
		})
	})

	describe('пропс label', () => {
		it('должен отображать метку', () => {
			render(BaseTextarea, {
				props: { modelValue: '', label: 'Описание' },
			})

			expect(screen.getByText('Описание')).toBeInTheDocument()
		})

		it('должен отображать звёздочку для обязательного поля', () => {
			render(BaseTextarea, {
				props: { modelValue: '', label: 'Описание', isRequired: true },
			})

			expect(screen.getByText('*')).toBeInTheDocument()
		})
	})

	describe('пропс isReadonly', () => {
		it('должен быть readonly когда isReadonly=true', () => {
			render(BaseTextarea, { props: { modelValue: '', isReadonly: true } })

			expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
		})
	})

	describe('пропс maxlength', () => {
		it('должен устанавливать maxlength', () => {
			render(BaseTextarea, { props: { modelValue: '', maxlength: 100 } })

			expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '100')
		})
	})
})
