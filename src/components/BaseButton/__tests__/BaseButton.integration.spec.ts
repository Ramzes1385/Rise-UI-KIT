/**
 * Integration-тесты для BaseButton.
 * Проверяют взаимодействие: клики, emits, состояние загрузки.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

import BaseButton from '../ui/BaseButton.vue'

describe('BaseButton integration', () => {
	describe('клик', () => {
		it('должен эмитить click при клике', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseButton, { slots: { default: 'Кнопка' } })

			await user.click(screen.getByRole('button'))

			expect(emitted()).toHaveProperty('click')
		})

		it('не должен эмитить click когда isDisabled=true', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseButton, {
				props: { isDisabled: true },
				slots: { default: 'Кнопка' },
			})

			await user.click(screen.getByRole('button'))

			expect(emitted()).not.toHaveProperty('click')
		})

		it('не должен эмитить click когда isLoading=true', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseButton, {
				props: { isLoading: true },
				slots: { default: 'Кнопка' },
			})

			await user.click(screen.getByRole('button'))

			expect(emitted()).not.toHaveProperty('click')
		})
	})

	describe('фокус', () => {
		it('должен получать фокус по Tab', async () => {
			const user = userEvent.setup()
			render(BaseButton, { slots: { default: 'Кнопка' } })

			await user.tab()

			expect(screen.getByRole('button')).toHaveFocus()
		})

		it('не должен получать фокус когда isDisabled=true', async () => {
			const user = userEvent.setup()
			render(BaseButton, {
				props: { isDisabled: true },
				slots: { default: 'Кнопка' },
			})

			await user.tab()

			expect(screen.getByRole('button')).not.toHaveFocus()
		})
	})
})
