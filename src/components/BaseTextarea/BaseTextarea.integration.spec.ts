/**
 * Integration-тесты для BaseTextarea.
 * Проверяют взаимодействие: ввод, v-model, emits.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

import BaseTextarea from './BaseTextarea.vue'

describe('BaseTextarea integration', () => {
	describe('v-model', () => {
		it('должен эмитить update:modelValue при вводе', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTextarea, { props: { modelValue: '' } })

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, 'hello')

			const events = emitted()['update:modelValue']
			expect(events).toBeTruthy()
		})

		it('должен эмитить корректное значение при вводе', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTextarea, { props: { modelValue: '' } })

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, 'hello')

			const events = emitted()['update:modelValue'] as string[][]
			expect(events.at(-1)?.[0]).toBe('hello')
		})
	})

	describe('события фокуса', () => {
		it('должен эмитить focus при фокусе', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTextarea, { props: { modelValue: '' } })

			await user.click(screen.getByRole('textbox'))

			expect(emitted()).toHaveProperty('focus')
		})

		it('должен эмитить blur при потере фокуса', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTextarea, { props: { modelValue: '' } })

			const textarea = screen.getByRole('textbox')
			await user.click(textarea)
			await user.tab()

			expect(emitted()).toHaveProperty('blur')
		})
	})

	describe('отключённая область', () => {
		it('должен быть disabled и не допускать ввод', () => {
			render(BaseTextarea, {
				props: { modelValue: '', isDisabled: true },
			})

			const textarea = screen.getByRole('textbox')
			expect(textarea).toBeDisabled()
		})
	})

	describe('ошибка', () => {
		it('должен отображать текст ошибки', () => {
			render(BaseTextarea, {
				props: { modelValue: '', error: 'Обязательное поле' },
			})

			expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
		})
	})

	describe('автоизменение высоты', () => {
		it('должен добавлять класс --autosize когда isAutosize=true', () => {
			const { container } = render(BaseTextarea, {
				props: { modelValue: '', isAutosize: true },
			})

			expect(container.firstElementChild?.classList.contains('base-textarea--autosize')).toBe(true)
		})
	})
})
