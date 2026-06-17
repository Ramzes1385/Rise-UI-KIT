/**
 * Integration-тесты для BaseSwitch.
 * Проверяют взаимодействие: переключение, v-model, emits.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseSwitch from '../ui/BaseSwitch.vue'

describe('BaseSwitch integration', () => {
	describe('v-model', () => {
		it('должен эмитить update:modelValue при клике', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			await user.click(screen.getByRole('checkbox'))

			expect(emitted()).toHaveProperty('update:modelValue')
		})

		it('должен эмитить true при включении', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			await user.click(screen.getByRole('checkbox'))

			const events = emitted()['update:modelValue'] as boolean[][]
			expect(events.at(-1)?.[0]).toBe(true)
		})

		it('должен эмитить false при выключении', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSwitch, {
				props: { modelValue: true },
			})

			await user.click(screen.getByRole('checkbox'))

			const events = emitted()['update:modelValue'] as boolean[][]
			expect(events.at(-1)?.[0]).toBe(false)
		})
	})

	describe('событие change', () => {
		it('должен эмитить change при переключении', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			await user.click(screen.getByRole('checkbox'))

			expect(emitted()).toHaveProperty('change')
		})
	})

	describe('отключённый переключатель', () => {
		it('должен иметь disabled input когда isDisabled=true', () => {
			const { container } = render(BaseSwitch, {
				props: { modelValue: false, isDisabled: true },
			})

			const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')
			expect(input?.disabled).toBe(true)
		})
	})

	describe('клавиатурная навигация', () => {
		it('должен переключаться при нажатии Space', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSwitch, {
				props: { modelValue: false },
			})

			screen.getByRole('checkbox').focus()
			await user.keyboard(' ')

			expect(emitted()).toHaveProperty('update:modelValue')
		})
	})

	describe('клик по лейблу', () => {
		it('должен переключать при клике на лейбл', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSwitch, {
				props: { modelValue: false, label: 'Уведомления' },
			})

			await user.click(screen.getByText('Уведомления'))

			expect(emitted()).toHaveProperty('update:modelValue')
		})
	})
})
