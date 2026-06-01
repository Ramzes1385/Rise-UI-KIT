/**
 * Unit-тесты для BasePin.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'

import BasePin from './BasePin.vue'

describe('BasePin unit', () => {
	describe('рендер', () => {
		it('должен рендерить контейнер pin', () => {
			const { container } = render(BasePin, {
				props: { modelValue: '' },
			})

			expect(container.querySelector('.base-pin')).toBeInTheDocument()
		})

		it('должен рендерить 4 input по умолчанию', () => {
			const { container } = render(BasePin, {
				props: { modelValue: '' },
			})

			const inputs = container.querySelectorAll('.base-pin__input')
			expect(inputs).toHaveLength(4)
		})

		it('должен рендерить количество input по пропсу length', () => {
			const { container } = render(BasePin, {
				props: { modelValue: '', length: 6 },
			})

			const inputs = container.querySelectorAll('.base-pin__input')
			expect(inputs).toHaveLength(6)
		})
	})

	describe('пропс modelValue', () => {
		it('должен заполнять input значениями из modelValue', () => {
			const { container } = render(BasePin, {
				props: { modelValue: '12' },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			expect(inputs[0].value).toBe('1')
			expect(inputs[1].value).toBe('2')
		})

		it('должен оставлять пустыми input без значений', () => {
			const { container } = render(BasePin, {
				props: { modelValue: '' },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			inputs.forEach(input => {
				expect(input.value).toBe('')
			})
		})
	})

	describe('пропс isDisabled', () => {
		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BasePin, {
				props: { modelValue: '', isDisabled: true },
			})

			expect(container.querySelector('.base-pin')?.classList.contains('base-pin--disabled')).toBe(true)
		})

		it('должен устанавливать disabled на все input', () => {
			const { container } = render(BasePin, {
				props: { modelValue: '', isDisabled: true },
			})

			const disabledInputs = container.querySelectorAll<HTMLInputElement>('input:disabled')
			expect(disabledInputs).toHaveLength(4)
		})
	})

	describe('пропс error', () => {
		it('должен добавлять класс --error когда error непустая строка', () => {
			const { container } = render(BasePin, {
				props: { modelValue: '', error: 'Неверный код' },
			})

			expect(container.querySelector('.base-pin')?.classList.contains('base-pin--error')).toBe(true)
		})

		it('должен рендерить сообщение об ошибке в base-pin__error-text', () => {
			const { container } = render(BasePin, {
				props: { modelValue: '', error: 'Неверный код' },
			})

			expect(container.querySelector('.base-pin__error-text')?.textContent).toContain('Неверный код')
		})

		it('не должен добавлять класс --error по умолчанию', () => {
			const { container } = render(BasePin, {
				props: { modelValue: '' },
			})

			expect(container.querySelector('.base-pin')?.classList.contains('base-pin--error')).toBe(false)
			expect(container.querySelector('.base-pin__error-text')).toBeNull()
		})
	})

	describe('пропс type', () => {
		it('должен рендерить input с type=text по умолчанию', () => {
			const { container } = render(BasePin, {
				props: { modelValue: '' },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			inputs.forEach(input => {
				expect(input.type).toBe('text')
			})
		})
	})

	describe('атрибут maxlength', () => {
		it('должен устанавливать maxlength=1 на каждый input', () => {
			const { container } = render(BasePin, {
				props: { modelValue: '' },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			inputs.forEach(input => {
				expect(input.maxLength).toBe(1)
			})
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BasePin, {
				props: {
					modelValue: '',
					customClass: 'custom-root-class',
				},
			})

			expect(container.querySelector('.base-pin')).toHaveClass('custom-root-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BasePin, {
				props: {
					modelValue: '',
					error: 'Ошибка',
					customClass: {
						root: 'custom-root',
						cells: 'custom-cells',
						input: 'custom-input',
						errorText: 'custom-error',
					},
				},
			})

			expect(container.querySelector('.base-pin')).toHaveClass('custom-root')
			expect(container.querySelector('.base-pin__cells')).toHaveClass('custom-cells')
			expect(container.querySelector('.base-pin__input')).toHaveClass('custom-input')
			expect(container.querySelector('.base-pin__error-text')).toHaveClass('custom-error')
		})
	})
})
