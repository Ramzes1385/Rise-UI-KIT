/**
 * Integration-тесты для BaseCheckbox.
 * Проверяют взаимодействие: клик, v-model, emits.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseCheckbox from '../ui/BaseCheckbox.vue'

describe('BaseCheckbox integration', () => {
	describe('переключение по клику', () => {
		it('должен эмитить update:modelValue=true при клике на невыбранный', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseCheckbox, { props: { modelValue: false } })

			await user.click(screen.getByRole('checkbox'))

			const events = emitted()['update:modelValue'] as boolean[][]
			expect(events.at(-1)?.[0]).toBe(true)
		})

		it('должен эмитить update:modelValue=false при клике на выбранный', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseCheckbox, { props: { modelValue: true } })

			await user.click(screen.getByRole('checkbox'))

			const events = emitted()['update:modelValue'] as boolean[][]
			expect(events.at(-1)?.[0]).toBe(false)
		})

		it('должен эмитить change при клике', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseCheckbox, { props: { modelValue: false } })

			await user.click(screen.getByRole('checkbox'))

			expect(emitted()).toHaveProperty('change')
		})
	})

	describe('клик по лейблу', () => {
		it('должен переключать чекбокс при клике на label', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseCheckbox, {
				props: { modelValue: false, label: 'Согласен' },
			})

			await user.click(screen.getByText('Согласен'))

			const events = emitted()['update:modelValue'] as boolean[][]
			expect(events.at(-1)?.[0]).toBe(true)
		})
	})

	describe('отключённый чекбокс', () => {
		it('не должен эмитить update:modelValue при клике на отключённый', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseCheckbox, {
				props: { modelValue: false, isDisabled: true },
			})

			await user.click(screen.getByRole('checkbox'))

			expect(emitted()).not.toHaveProperty('update:modelValue')
		})
	})
})
