/**
 * Unit-тесты для BaseInput.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseInput from './BaseInput.vue'

describe('BaseInput unit', () => {
	describe('рендер', () => {
		it('должен рендерить текстовое поле', () => {
			render(BaseInput, { props: { modelValue: '' } })

			expect(screen.getByRole('textbox')).toBeInTheDocument()
		})

		it('должен отображать placeholder', () => {
			render(BaseInput, { props: { modelValue: '', placeholder: 'Введите текст' } })

			expect(screen.getByPlaceholderText('Введите текст')).toBeInTheDocument()
		})

		it('должен отображать значение modelValue', () => {
			render(BaseInput, { props: { modelValue: 'Тестовое значение' } })

			expect(screen.getByDisplayValue('Тестовое значение')).toBeInTheDocument()
		})
	})

	describe('пропс label', () => {
		it('должен отображать label когда передан', () => {
			render(BaseInput, { props: { modelValue: '', label: 'Email' } })

			expect(screen.getByText('Email')).toBeInTheDocument()
		})

		it('не должен отображать label когда не передан', () => {
			const { container } = render(BaseInput, { props: { modelValue: '' } })

			expect(container.querySelector('.base-input__label')).not.toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --outline по умолчанию', () => {
			const { container } = render(BaseInput, { props: { modelValue: '' } })

			expect(container.firstElementChild?.classList.contains('base-input--outline')).toBe(true)
		})

		it('должен применять модификатор --filled', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', variant: 'filled' },
			})

			expect(container.firstElementChild?.classList.contains('base-input--filled')).toBe(true)
		})

		it('должен применять модификатор --underline', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', variant: 'underline' },
			})

			expect(container.firstElementChild?.classList.contains('base-input--underline')).toBe(true)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=1', () => {
			const { container } = render(BaseInput, { props: { modelValue: '', sizeScale: 100 } })

			expect(container.firstElementChild?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', sizeScale: 150 },
			})

			expect(container.firstElementChild?.getAttribute('style')).toContain('--size-scale: 1.5')
		})
	})

	describe('пропс isDisabled', () => {
		it('должен быть disabled когда isDisabled=true', () => {
			render(BaseInput, { props: { modelValue: '', isDisabled: true } })

			expect(screen.getByRole('textbox')).toBeDisabled()
		})

		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', isDisabled: true },
			})

			expect(container.firstElementChild?.classList.contains('base-input--disabled')).toBe(true)
		})
	})

	describe('пропс error', () => {
		it('должен отображать текст ошибки', () => {
			render(BaseInput, { props: { modelValue: '', error: 'Обязательное поле' } })

			expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
		})

		it('должен добавлять класс --error когда error передан', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', error: 'Ошибка' },
			})

			expect(container.firstElementChild?.classList.contains('base-input--error')).toBe(true)
		})
	})

	describe('пропс isRequired', () => {
		it('должен отображать звёздочку когда isRequired=true', () => {
			render(BaseInput, { props: { modelValue: '', isRequired: true, label: 'Поле' } })

			expect(screen.getByText('*')).toBeInTheDocument()
		})
	})

	describe('пропс prefix', () => {
		it('должен отображать префикс', () => {
			render(BaseInput, { props: { modelValue: '', prefix: '+7' } })

			expect(screen.getByText('+7')).toBeInTheDocument()
		})

		it('должен добавлять класс --has-prefix когда prefix передан', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', prefix: '+7' },
			})

			expect(container.firstElementChild?.classList.contains('base-input--has-prefix')).toBe(true)
		})
	})

	describe('пропс postfix', () => {
		it('должен отображать постфикс', () => {
			render(BaseInput, { props: { modelValue: '', postfix: 'мм' } })

			expect(screen.getByText('мм')).toBeInTheDocument()
		})

		it('должен добавлять класс --has-postfix когда postfix передан', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', postfix: 'мм' },
			})

			expect(container.firstElementChild?.classList.contains('base-input--has-postfix')).toBe(true)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=1', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', sizeScale: 100 },
			})

			expect(container.firstElementChild?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', sizeScale: 150 },
			})

			expect(container.firstElementChild?.getAttribute('style')).toContain('--size-scale: 1.5')
		})

		it('должен устанавливать --size-scale когда sizeScale=0.75', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', sizeScale: 75 },
			})

			expect(container.firstElementChild?.getAttribute('style')).toContain('--size-scale: 0.75')
		})
	})
})
