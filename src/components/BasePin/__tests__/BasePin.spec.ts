import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BasePin from '../ui/BasePin.vue'

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

	describe('доступность', () => {
		it('подписывает каждую ячейку позицией в коде', () => {
			render(BasePin, { props: { modelValue: '', length: 6 } })

			expect(screen.getAllByRole('textbox')).toHaveLength(6)
			expect(screen.getByRole('textbox', { name: 'Символ 1 из 6' })).toBeInTheDocument()
			expect(screen.getByRole('textbox', { name: 'Символ 6 из 6' })).toBeInTheDocument()
		})

		it('объединяет ячейки в группу, которой aria-label на компоненте даёт имя', () => {
			render(BasePin, { props: { modelValue: '' }, attrs: { 'aria-label': 'Код из СМС' } })

			const group = screen.getByRole('group', { name: 'Код из СМС' })
			expect(group).toContainElement(screen.getByRole('textbox', { name: 'Символ 1 из 4' }))
		})

		it('помечает ячейки aria-invalid и связывает их с текстом ошибки', () => {
			render(BasePin, { props: { modelValue: '1234', error: 'Неверный код' } })

			for (const cell of screen.getAllByRole('textbox')) {
				expect(cell).toHaveAttribute('aria-invalid', 'true')
				expect(cell).toHaveAccessibleDescription('Неверный код')
			}
		})

		it('без ошибки не ставит aria-invalid и aria-describedby', () => {
			render(BasePin, { props: { modelValue: '' } })

			const cell = screen.getByRole('textbox', { name: 'Символ 1 из 4' })
			expect(cell).not.toHaveAttribute('aria-invalid')
			expect(cell).not.toHaveAttribute('aria-describedby')
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
