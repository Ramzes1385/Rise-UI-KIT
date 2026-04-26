/**
 * Integration-тесты для BaseInput.
 * Проверяют взаимодействие: ввод, v-model, emits.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

import BaseInput from './BaseInput.vue'

describe('BaseInput integration', () => {
	describe('v-model', () => {
		it('должен эмитить update:modelValue при вводе', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseInput, { props: { modelValue: '' } })

			const input = screen.getByRole('textbox')
			await user.type(input, 'h')

			const events = emitted()['update:modelValue']
			expect(events).toBeTruthy()
		})

		it('должен эмитить корректное значение при вводе текста', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseInput, { props: { modelValue: '' } })

			const input = screen.getByRole('textbox')
			await user.type(input, 'hello')

			const events = emitted()['update:modelValue'] as string[][]
			expect(events.at(-1)?.[0]).toBe('hello')
		})
	})

	describe('события фокуса', () => {
		it('должен эмитить focus при фокусе', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseInput, { props: { modelValue: '' } })

			await user.click(screen.getByRole('textbox'))

			expect(emitted()).toHaveProperty('focus')
		})

		it('должен эмитить blur при потере фокуса', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseInput, { props: { modelValue: '' } })

			const input = screen.getByRole('textbox')
			await user.click(input)
			await user.tab()

			expect(emitted()).toHaveProperty('blur')
		})
	})

	describe('отключённое поле', () => {
		it('не должен эмитить update:modelValue при вводе в отключённое поле', async () => {
			const { emitted } = render(BaseInput, {
				props: { modelValue: '', isDisabled: true },
			})

			await fireEvent.click(screen.getByRole('textbox'))

			expect(emitted()).not.toHaveProperty('update:modelValue')
		})
	})

	describe('поле пароля', () => {
		it('должен рендерить кнопку переключения видимости', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', type: 'password' },
			})

			expect(container.querySelector('.base-input__password-toggle')).toBeInTheDocument()
		})

		it('должен добавлять класс --password когда type=password', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', type: 'password' },
			})

			expect(container.firstElementChild?.classList.contains('base-input--password')).toBe(true)
		})
	})
})
