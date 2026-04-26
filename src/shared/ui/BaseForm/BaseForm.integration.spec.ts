/**
 * Integration-тесты для BaseForm.
 * Проверяют взаимодействие: отправка формы.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

import BaseForm from './BaseForm.vue'

describe('BaseForm integration', () => {
	describe('отправка формы', () => {
		it('должен эмитить submit при отправке формы', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseForm, {
				slots: { default: '<button type="submit">Отправить</button>' },
			})

			await user.click(screen.getByText('Отправить'))

			expect(emitted()).toHaveProperty('submit')
		})

		it('не должен эмитить submit когда isLoading=true', async () => {
			const { container, emitted } = render(BaseForm, {
				props: { isLoading: true },
				slots: { default: '<button type="submit">Отправить</button>' },
			})

			/** pointer-events: none блокирует userEvent, используем fireEvent */
			const form = container.querySelector('form') as HTMLFormElement
			await fireEvent.submit(form)

			expect(emitted()).not.toHaveProperty('submit')
		})

		it('не должен эмитить submit когда isDisabled=true', async () => {
			const { container, emitted } = render(BaseForm, {
				props: { isDisabled: true },
				slots: { default: '<button type="submit">Отправить</button>' },
			})

			const form = container.querySelector('form') as HTMLFormElement
			await fireEvent.submit(form)

			expect(emitted()).not.toHaveProperty('submit')
		})
	})
})
